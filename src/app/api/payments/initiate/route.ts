import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createPendingLetter } from "@/app/actions/letterActions";
import {
  buildHostedPaymentPayload,
  getMorparaEnvDiagnostics,
  getMorparaSignDiagnostics,
  getHostedPaymentRedirectUrl,
  getMorparaHeaders,
} from "@/lib/morpara";

function getOrderNumberFromLetterData(letterData: unknown, letterId: string) {
  if (
    letterData &&
    typeof letterData === "object" &&
    "orderNumber" in letterData &&
    typeof (letterData as Record<string, unknown>).orderNumber === "string" &&
    ((letterData as Record<string, unknown>).orderNumber as string).trim()
      .length > 0
  ) {
    return (
      (letterData as Record<string, unknown>).orderNumber as string
    ).trim();
  }

  return `ORD-${letterId}`;
}

function getHostedPaymentUrl(
  orderNumber: string,
  conversationId: string,
  status: "processing" | "failed" | "success" = "processing",
) {
  return `/odeme/sonuc?status=${status}&order=${encodeURIComponent(orderNumber)}&conversationId=${encodeURIComponent(conversationId)}`;
}

function getUiStatusFromAttemptStatus(
  status: string,
): "processing" | "failed" | "success" {
  if (status === "FAILED" || status === "CANCELLED") return "failed";
  if (status === "APPROVED") return "success";
  return "processing";
}

async function markInitiateFailed(
  attemptId: string,
  conversationId: string,
  technicalErrorCode: string,
  technicalErrorMessage: string,
) {
  await (prisma as any).paymentAttempt.update({
    where: { id: attemptId },
    data: {
      status: "FAILED",
      checkResponseCode: technicalErrorCode,
      checkResponseDescription: "Morpara bağlantı/başlatma hatası",
      rawCallbackPayload: {
        conversationId,
        fallbackErrorCode: technicalErrorCode,
        fallbackErrorMessage: technicalErrorMessage,
      },
    },
  });
}

function buildConversationId(_orderNumber: string) {
  // Morpara conversationId algoritması:
  //   - Null/empty olmayacak
  //   - Uzunluğu TAM 20 karakter
  //   - Sadece İngilizce harf + rakam (alfanumerik)
  //   - Türkçe karakter içermeyecek
  // 16 random byte -> 32 char lowercase hex -> ilk 20 char.
  return crypto.randomBytes(16).toString("hex").slice(0, 20);
}

function formatAmount(amount: number | null) {
  const normalized = typeof amount === "number" && amount > 0 ? amount : 0;
  return normalized.toFixed(2);
}

function truncateForLog(value: string, max = 1000) {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}...`;
}

function maskLogValue(value: string) {
  if (!value) return value;
  if (value.length <= 6) return "***";
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

function getMaskedMorparaHeadersForLog(headers: Record<string, string>) {
  return {
    "x-ClientID": maskLogValue(headers["x-ClientID"] || ""),
    "x-ClientSecret": maskLogValue(headers["x-ClientSecret"] || ""),
    "x-GrantType": headers["x-GrantType"] || "",
    "x-Scope": headers["x-Scope"] || "",
    "x-Timestamp": headers["x-Timestamp"] || "",
  };
}

function getBaseUrl(req: Request) {
  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL;
  }

  return new URL(req.url).origin;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 },
      );
    }

    const payload = await req.json();
    const pendingResult = await createPendingLetter(payload);

    if ("error" in pendingResult) {
      return NextResponse.json({ error: pendingResult.error }, { status: 400 });
    }

    const letter = await prisma.letter.findUnique({
      where: { id: pendingResult.letterId },
      select: {
        id: true,
        userId: true,
        data: true,
        totalAmount: true,
      },
    });

    if (!letter) {
      return NextResponse.json(
        { error: "Mektup bulunamadı." },
        { status: 404 },
      );
    }

    const orderNumber = getOrderNumberFromLetterData(letter.data, letter.id);

    const existingAttempt = await (prisma as any).paymentAttempt.findUnique({
      where: { orderNumber },
    });

    if (existingAttempt) {
      const existingHostedUrl =
        typeof existingAttempt.rawCallbackPayload === "object" &&
        existingAttempt.rawCallbackPayload &&
        "hostedPaymentUrl" in existingAttempt.rawCallbackPayload
          ? (existingAttempt.rawCallbackPayload as Record<string, unknown>)
              .hostedPaymentUrl
          : null;

      const hasLiveHostedUrl = typeof existingHostedUrl === "string";
      const isTerminalStatus =
        existingAttempt.status === "APPROVED" ||
        existingAttempt.status === "CANCELLED";

      // Terminal (APPROVED/CANCELLED) ya da hâlâ kullanılabilir bir hosted
      // URL varsa mevcut attempt'i aynen döndür. Aksi halde (INITIATED /
      // PENDING / FAILED ve URL yok) aşağıdaki Morpara fetch akışıyla
      // yeniden dene.
      if (isTerminalStatus || hasLiveHostedUrl) {
        return NextResponse.json({
          success: true,
          paymentAttemptId: existingAttempt.id,
          orderNumber: existingAttempt.orderNumber,
          conversationId: existingAttempt.conversationId || undefined,
          amount: existingAttempt.amount,
          currency: existingAttempt.currency,
          status: existingAttempt.status,
          hostedPaymentUrl:
            typeof existingHostedUrl === "string"
              ? existingHostedUrl
              : getHostedPaymentUrl(
                  existingAttempt.orderNumber,
                  existingAttempt.conversationId ||
                    buildConversationId(existingAttempt.orderNumber),
                  getUiStatusFromAttemptStatus(existingAttempt.status),
                ),
          provider: existingAttempt.provider,
          mode: typeof existingHostedUrl === "string" ? "live" : "mock",
        });
      }
    }

    const createdAttempt = existingAttempt
      ? existingAttempt
      : await (prisma as any).paymentAttempt.create({
          data: {
            userId: letter.userId,
            letterId: letter.id,
            orderNumber,
            provider: "MORPARA",
            amount: letter.totalAmount || 0,
            currency: "TRY",
            status: "INITIATED",
          },
        });

    // Her initiate denemesinde Morpara'ya yeni bir conversationId gönderiyoruz.
    // Bu hem min uzunluk gereksinimini garanti eder hem de daha önce Morpara
    // tarafında reddedilmiş (örn. eski 403/400 alan) bir id'nin tekrar
    // gönderilmesini engeller.
    const conversationId = buildConversationId(orderNumber);
    let hostedPaymentUrl = getHostedPaymentUrl(orderNumber, conversationId);
    let mode: "live" | "mock" = "mock";

    await (prisma as any).paymentAttempt.update({
      where: { id: createdAttempt.id },
      data: {
        conversationId,
        status: "INITIATED",
        checkResponseCode: null,
        checkResponseDescription: null,
      },
    });

    try {
      const baseUrl = getBaseUrl(req);
      const requestBody = buildHostedPaymentPayload({
        returnUrl: `${baseUrl}/odeme/sonuc?status=success&order=${encodeURIComponent(orderNumber)}`,
        failUrl: `${baseUrl}/odeme/sonuc?status=failed&order=${encodeURIComponent(orderNumber)}`,
        conversationId,
        amount: formatAmount(letter.totalAmount),
      });
      const envDiagnostics = getMorparaEnvDiagnostics();
      const morparaHeaders = getMorparaHeaders();

      console.info("MORPARA_ENV_CHECK", {
        orderNumber,
        conversationId,
        ...envDiagnostics,
      });

      console.info("MORPARA_HOSTED_REDIRECT_REQUEST_HEADERS", {
        orderNumber,
        conversationId,
        endpoint: getHostedPaymentRedirectUrl(),
        headers: getMaskedMorparaHeadersForLog(morparaHeaders),
      });

      const signFingerprint = crypto
        .createHash("sha256")
        .update(String(requestBody.Sign || ""), "utf8")
        .digest("hex")
        .slice(0, 12);

      console.info("MORPARA_HOSTED_REDIRECT_REQUEST_BODY", {
        orderNumber,
        conversationId,
        ...getMorparaSignDiagnostics(),
        signLength: String(requestBody.Sign || "").length,
        signFingerprint,
        body: {
          ...requestBody,
          Sign: maskLogValue(String(requestBody.Sign || "")),
        },
      });

      const response = await fetch(getHostedPaymentRedirectUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...morparaHeaders,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
      });

      const responseText = await response.text();
      let responseRaw: Record<string, unknown> | null = null;
      try {
        responseRaw = responseText
          ? (JSON.parse(responseText) as Record<string, unknown>)
          : null;
      } catch {
        responseRaw = null;
      }

      // Morpara hem PascalCase (ReturnUrl, ResponseCode, ResponseDescription)
      // hem de camelCase dönebilir; her iki anahtara da bakıyoruz.
      const pickStringField = (key: string) => {
        if (!responseRaw) return undefined;
        const pascal = `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        const value =
          (responseRaw[key] as unknown) ?? (responseRaw[pascal] as unknown);
        return typeof value === "string" ? value : undefined;
      };
      const responseData = {
        returnUrl: pickStringField("returnUrl"),
        responseCode: pickStringField("responseCode"),
        responseDescription: pickStringField("responseDescription"),
      };

      if (!response.ok) {
        const technicalErrorCode =
          responseData?.responseCode || `HTTP_${response.status}`;
        const technicalErrorMessage =
          responseData?.responseDescription ||
          responseText ||
          "HostedPaymentRedirect başarısız döndü";

        console.warn("MORPARA_HOSTED_REDIRECT_NON_OK", {
          status: response.status,
          statusText: response.statusText,
          orderNumber,
          conversationId,
          providerResponseCode: responseData?.responseCode || null,
          providerResponseDescription:
            responseData?.responseDescription || null,
          responseBody: truncateForLog(responseText),
        });

        await markInitiateFailed(
          createdAttempt.id,
          conversationId,
          technicalErrorCode,
          technicalErrorMessage,
        );

        hostedPaymentUrl = getHostedPaymentUrl(
          orderNumber,
          conversationId,
          "failed",
        );
      } else if (
        typeof responseData?.returnUrl === "string" &&
        responseData.returnUrl
      ) {
        hostedPaymentUrl = responseData.returnUrl;
        mode = "live";

        await (prisma as any).paymentAttempt.update({
          where: { id: createdAttempt.id },
          data: {
            status: "PENDING",
            conversationId,
            rawCallbackPayload: {
              hostedPaymentUrl,
              conversationId,
            },
          },
        });
      } else {
        console.warn("MORPARA_HOSTED_REDIRECT_MISSING_RETURN_URL", {
          orderNumber,
          conversationId,
          providerResponseCode: responseData?.responseCode || null,
          providerResponseDescription:
            responseData?.responseDescription || null,
          responseBody: truncateForLog(responseText),
        });

        await markInitiateFailed(
          createdAttempt.id,
          conversationId,
          "MORPARA_RETURN_URL_MISSING",
          "HostedPaymentRedirect returnUrl alanı boş döndü",
        );

        hostedPaymentUrl = getHostedPaymentUrl(
          orderNumber,
          conversationId,
          "failed",
        );
      }
    } catch (error) {
      const technicalErrorCode =
        ((error as { cause?: { code?: string } }).cause?.code as
          | string
          | undefined) ||
        ((error as { code?: string }).code as string | undefined) ||
        "MORPARA_FETCH_ERROR";

      const technicalErrorMessage =
        error instanceof Error ? error.message : "Bilinmeyen bağlantı hatası";

      await markInitiateFailed(
        createdAttempt.id,
        conversationId,
        technicalErrorCode,
        technicalErrorMessage,
      );

      hostedPaymentUrl = getHostedPaymentUrl(
        orderNumber,
        conversationId,
        "failed",
      );
      console.warn("MORPARA_HOSTED_REDIRECT_FALLBACK", error);
    }

    return NextResponse.json(
      {
        success: true,
        paymentAttemptId: createdAttempt.id,
        orderNumber: createdAttempt.orderNumber,
        conversationId,
        amount: createdAttempt.amount,
        currency: createdAttempt.currency,
        status: mode === "live" ? "PENDING" : "FAILED",
        hostedPaymentUrl,
        provider: createdAttempt.provider,
        mode,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("PAYMENT_INITIATE_ERROR", error);
    return NextResponse.json(
      { error: "Ödeme başlatılamadı." },
      { status: 500 },
    );
  }
}
