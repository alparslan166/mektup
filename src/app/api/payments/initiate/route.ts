import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createPendingLetter } from "@/app/actions/letterActions";
import {
  buildHostedPaymentPayload,
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

function buildConversationId(orderNumber: string) {
  const clean = orderNumber.replace(/[^a-zA-Z0-9]/g, "");
  return clean.slice(0, 32) || `MP${Date.now()}`;
}

function formatAmount(amount: number | null) {
  const normalized = typeof amount === "number" && amount > 0 ? amount : 0;
  return normalized.toFixed(2);
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

    const createdAttempt = await (prisma as any).paymentAttempt.create({
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

    const conversationId = buildConversationId(orderNumber);
    let hostedPaymentUrl = getHostedPaymentUrl(orderNumber, conversationId);
    let mode: "live" | "mock" = "mock";

    await (prisma as any).paymentAttempt.update({
      where: { id: createdAttempt.id },
      data: { conversationId },
    });

    try {
      const baseUrl = getBaseUrl(req);
      const requestBody = buildHostedPaymentPayload({
        returnUrl: `${baseUrl}/odeme/sonuc?status=success&order=${encodeURIComponent(orderNumber)}`,
        failUrl: `${baseUrl}/odeme/sonuc?status=failed&order=${encodeURIComponent(orderNumber)}`,
        conversationId,
        amount: formatAmount(letter.totalAmount),
      });

      const response = await fetch(getHostedPaymentRedirectUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getMorparaHeaders(),
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
      });

      if (response.ok) {
        const responseData = (await response.json()) as { returnUrl?: string };
        if (
          typeof responseData.returnUrl === "string" &&
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
        }
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

      await (prisma as any).paymentAttempt.update({
        where: { id: createdAttempt.id },
        data: {
          status: "FAILED",
          checkResponseCode: technicalErrorCode,
          checkResponseDescription: "Morpara bağlantı hatası",
          rawCallbackPayload: {
            conversationId,
            fallbackErrorCode: technicalErrorCode,
            fallbackErrorMessage: technicalErrorMessage,
          },
        },
      });

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
        status: mode === "live" ? "PENDING" : createdAttempt.status,
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
