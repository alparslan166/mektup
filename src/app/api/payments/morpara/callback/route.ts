import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { finalizePendingLetterBySystem } from "@/app/actions/letterActions";
import {
  buildCheckPaymentPayload,
  getCheckPaymentUrl,
  getMorparaHeaders,
  verifyMorparaCallbackSign,
} from "@/lib/morpara";

type CheckPaymentResult = {
  responseCode?: string;
  responseDescription?: string;
  [key: string]: unknown;
};

function normalizePayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  return payload as Record<string, unknown>;
}

function maskLogValue(value: string | null | undefined) {
  if (!value) return undefined;
  if (value.length <= 6) return "***";
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

function extractPresentKeys(payload: Record<string, unknown>) {
  return Object.keys(payload).filter((key) => {
    const value = payload[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}

function extractOrderNumber(payload: Record<string, unknown>): string | null {
  const possibleKeys = [
    "orderNumber",
    "orderNo",
    "orderId",
    "merchantOrderId",
    "merchantPaymentId",
  ];

  for (const key of possibleKeys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function detectTokenSource(payload: Record<string, unknown>) {
  const possibleKeys = ["token", "Token", "paymentToken", "PaymentToken"];
  for (const key of possibleKeys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return key;
    }
  }
  return null;
}

function extractToken(payload: Record<string, unknown>): string | null {
  const possibleKeys = ["token", "Token", "paymentToken", "PaymentToken"];

  for (const key of possibleKeys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function extractProviderPaymentId(
  payload: Record<string, unknown>,
): string | null {
  const possibleKeys = ["paymentId", "transactionId", "txnId", "referenceNo"];

  for (const key of possibleKeys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

async function callCheckPayment(
  conversationId: string,
): Promise<CheckPaymentResult | null> {
  let endpoint: string;
  let requestBody: Record<string, unknown>;
  let headers: Record<string, string>;

  try {
    endpoint = getCheckPaymentUrl();
    requestBody = {
      checkPaymentRequest: buildCheckPaymentPayload({ conversationId }),
    };
    headers = {
      "Content-Type": "application/json",
      ...getMorparaHeaders(),
    };
  } catch {
    return null;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      responseCode: "HTTP_ERROR",
      responseDescription: `CheckPayment HTTP ${res.status}`,
    };
  }

  return (await res.json()) as CheckPaymentResult;
}

function extractConversationId(
  payload: Record<string, unknown>,
): string | null {
  const possibleKeys = ["conversationId", "conversationID", "convId"];

  for (const key of possibleKeys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const payload = normalizePayload(raw);
    const callbackConversationId = extractConversationId(payload);
    const callbackToken = extractToken(payload);
    const callbackTokenSource = detectTokenSource(payload);

    console.info("MORPARA_CALLBACK_RECEIVED", {
      orderNumberHint: extractOrderNumber(payload),
      conversationId: callbackConversationId,
      presentKeys: extractPresentKeys(payload),
      tokenSource: callbackTokenSource,
      tokenMask: maskLogValue(callbackToken),
    });

    const orderNumber = extractOrderNumber(payload);
    if (!orderNumber && !callbackConversationId) {
      return NextResponse.json(
        { error: "orderNumber veya conversationId bulunamadı." },
        { status: 400 },
      );
    }

    let paymentAttempt = null;

    if (callbackConversationId) {
      paymentAttempt = await (prisma as any).paymentAttempt.findUnique({
        where: { conversationId: callbackConversationId },
      });
    }

    if (!paymentAttempt && orderNumber) {
      paymentAttempt = await (prisma as any).paymentAttempt.findUnique({
        where: { orderNumber },
      });
    }

    if (!paymentAttempt) {
      return NextResponse.json(
        { error: "Payment attempt bulunamadı." },
        { status: 404 },
      );
    }

    if (paymentAttempt.isFinalized) {
      return NextResponse.json({
        success: true,
        status: paymentAttempt.status,
        message: "Ödeme zaten finalize edilmiş.",
      });
    }

    const providerPaymentId =
      extractProviderPaymentId(payload) ||
      paymentAttempt.providerPaymentId ||
      null;

    const savedConversationId =
      typeof paymentAttempt.rawCallbackPayload === "object" &&
      paymentAttempt.rawCallbackPayload &&
      "conversationId" in paymentAttempt.rawCallbackPayload &&
      typeof (paymentAttempt.rawCallbackPayload as Record<string, unknown>)
        .conversationId === "string"
        ? ((paymentAttempt.rawCallbackPayload as Record<string, unknown>)
            .conversationId as string)
        : null;

    const conversationId =
      callbackConversationId ||
      (savedConversationId && savedConversationId.trim().length > 0
        ? savedConversationId.trim()
        : orderNumber || "");

    const callbackPayloadForStore = {
      ...payload,
      orderNumber,
      conversationId,
      token: callbackToken || undefined,
      tokenSource: callbackTokenSource || undefined,
      providerPaymentId: providerPaymentId || undefined,
    };

    const signValidation = verifyMorparaCallbackSign(payload);
    if (!signValidation.isValid) {
      await (prisma as any).paymentAttempt.update({
        where: { id: paymentAttempt.id },
        data: {
          status: "FAILED",
          rawCallbackPayload: {
            ...callbackPayloadForStore,
            callbackSignValidationError: signValidation.reason,
          },
        },
      });

      return NextResponse.json(
        {
          success: false,
          status: "FAILED",
          error: signValidation.reason,
        },
        { status: 400 },
      );
    }

    const checkPayment = await callCheckPayment(conversationId);

    const responseCode = checkPayment?.responseCode || "CHECK_UNAVAILABLE";
    const responseDescription =
      checkPayment?.responseDescription || "CheckPayment sonucu alınamadı";

    const isApproved =
      responseCode === "B0000" && responseDescription === "Approved";

    if (!isApproved) {
      await (prisma as any).paymentAttempt.update({
        where: { id: paymentAttempt.id },
        data: {
          status: "FAILED",
          providerPaymentId: providerPaymentId || undefined,
          checkResponseCode: responseCode,
          checkResponseDescription: responseDescription,
          rawCallbackPayload: callbackPayloadForStore,
          rawCheckPayload: {
            conversationId,
            data: checkPayment || undefined,
          },
        },
      });

      return NextResponse.json({
        success: false,
        status: "FAILED",
        responseCode,
        responseDescription,
      });
    }

    if (!paymentAttempt.letterId) {
      await (prisma as any).paymentAttempt.update({
        where: { id: paymentAttempt.id },
        data: {
          status: "PENDING",
          providerPaymentId: providerPaymentId || undefined,
          checkResponseCode: responseCode,
          checkResponseDescription: responseDescription,
          rawCallbackPayload: callbackPayloadForStore,
          rawCheckPayload: {
            conversationId,
            data: checkPayment || undefined,
          },
        },
      });

      return NextResponse.json(
        {
          success: false,
          status: "PENDING",
          error: "Payment attempt için mektup bağlantısı bulunamadı.",
        },
        { status: 500 },
      );
    }

    const finalizeResult = await finalizePendingLetterBySystem(
      paymentAttempt.letterId,
    );

    if ("error" in finalizeResult) {
      await (prisma as any).paymentAttempt.update({
        where: { id: paymentAttempt.id },
        data: {
          status: "PENDING",
          providerPaymentId: providerPaymentId || undefined,
          checkResponseCode: responseCode,
          checkResponseDescription: responseDescription,
          rawCallbackPayload: callbackPayloadForStore,
          rawCheckPayload: {
            conversationId,
            data: checkPayment || undefined,
          },
        },
      });

      return NextResponse.json(
        {
          success: false,
          status: "PENDING",
          error: finalizeResult.error,
        },
        { status: 500 },
      );
    }

    await (prisma as any).paymentAttempt.update({
      where: { id: paymentAttempt.id },
      data: {
        status: "APPROVED",
        isFinalized: true,
        providerPaymentId: providerPaymentId || undefined,
        checkResponseCode: responseCode,
        checkResponseDescription: responseDescription,
        rawCallbackPayload: callbackPayloadForStore,
        rawCheckPayload: {
          conversationId,
          data: checkPayment || undefined,
        },
      },
    });

    return NextResponse.json({
      success: true,
      status: "APPROVED",
      responseCode,
      responseDescription,
      letterId: finalizeResult.letterId,
    });
  } catch (error) {
    console.error("MORPARA_CALLBACK_ERROR", error);
    return NextResponse.json(
      { error: "Callback işlenemedi." },
      { status: 500 },
    );
  }
}
