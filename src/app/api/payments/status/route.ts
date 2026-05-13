import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { finalizePendingLetterBySystem } from "@/app/actions/letterActions";
import {
  buildCheckPaymentPayload,
  getCheckPaymentUrl,
  getMorparaHeaders,
  getMorparaSignDiagnostics,
} from "@/lib/morpara";

function normalizeUiStatus(status: string, isFinalized: boolean) {
  if (status === "APPROVED" && isFinalized) return "success";
  if (status === "FAILED" || status === "CANCELLED") return "failed";
  return "processing";
}

type AttemptRecord = {
  id: string;
  orderNumber: string;
  conversationId: string | null;
  status: string;
  isFinalized: boolean;
  checkResponseCode: string | null;
  checkResponseDescription: string | null;
  letterId: string | null;
  rawCallbackPayload?: unknown;
  updatedAt: Date;
};

function pickField(
  payload: Record<string, unknown>,
  camelKey: string,
): string | undefined {
  const pascalKey = `${camelKey.charAt(0).toUpperCase()}${camelKey.slice(1)}`;
  const value = payload[camelKey] ?? payload[pascalKey];
  return typeof value === "string" ? value : undefined;
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

function extractTokenFromPayload(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const record = payload as Record<string, unknown>;
  const keys = ["token", "Token", "paymentToken", "PaymentToken"];
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function maskOptionalToken(value: string | undefined) {
  if (!value) return undefined;
  if (value.length <= 6) return "***";
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

function detectTokenSourceFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const keys = ["token", "Token", "paymentToken", "PaymentToken"];
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return key;
    }
  }
  return null;
}

async function callCheckPayment(
  conversationId: string,
  context: { orderNumber: string; attemptId: string; token?: string },
) {
  const endpoint = getCheckPaymentUrl();
  const morparaHeaders = getMorparaHeaders();
  const requestBody = buildCheckPaymentPayload({
    conversationId,
    token: context.token,
  });
  const rawSign = String(requestBody.sign || "");
  const signFingerprint = crypto
    .createHash("sha256")
    .update(rawSign, "utf8")
    .digest("hex")
    .slice(0, 12);

  console.info("MORPARA_CHECK_PAYMENT_REQUEST_HEADERS", {
    orderNumber: context.orderNumber,
    attemptId: context.attemptId,
    conversationId,
    endpoint,
    headers: getMaskedMorparaHeadersForLog(morparaHeaders),
  });

  console.info("MORPARA_CHECK_PAYMENT_REQUEST_BODY", {
    orderNumber: context.orderNumber,
    attemptId: context.attemptId,
    conversationId,
    ...getMorparaSignDiagnostics(),
    signLength: rawSign.length,
    signFingerprint,
    body: {
      ...requestBody,
      sign: maskLogValue(rawSign),
    },
  });

  const response = await fetch(endpoint, {
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

  const responseCode = responseRaw
    ? pickField(responseRaw, "responseCode")
    : undefined;
  const responseDescription = responseRaw
    ? pickField(responseRaw, "responseDescription")
    : undefined;
  const correlationId = responseRaw
    ? pickField(responseRaw, "correlationId") ||
      (typeof responseRaw.CorrelationId === "string"
        ? responseRaw.CorrelationId
        : undefined)
    : undefined;

  if (!response.ok) {
    console.warn("MORPARA_CHECK_PAYMENT_NON_OK", {
      orderNumber: context.orderNumber,
      attemptId: context.attemptId,
      conversationId,
      status: response.status,
      statusText: response.statusText,
      providerResponseCode: responseCode || null,
      providerResponseDescription: responseDescription || null,
      correlationId: correlationId || null,
      responseBody: truncateForLog(responseText),
    });

    return {
      responseCode: `HTTP_${response.status}`,
      responseDescription: `CheckPayment HTTP ${response.status}`,
      isTechnicalError: true,
    };
  }

  console.info("MORPARA_CHECK_PAYMENT_OK", {
    orderNumber: context.orderNumber,
    attemptId: context.attemptId,
    conversationId,
    providerResponseCode: responseCode || null,
    providerResponseDescription: responseDescription || null,
    correlationId: correlationId || null,
  });

  const raw = responseRaw || {};
  return {
    responseCode: pickField(raw, "responseCode") || "CHECK_UNAVAILABLE",
    responseDescription:
      pickField(raw, "responseDescription") || "CheckPayment sonucu alınamadı",
    isTechnicalError: false,
  };
}

async function reconcilePendingAttempt(attempt: AttemptRecord, token?: string) {
  if (!attempt.conversationId) return attempt;
  if (attempt.status === "APPROVED" || attempt.status === "FAILED")
    return attempt;

  // Poll endpoint'i sık çağrıldığı için provider tarafına gereksiz yüklenmeyelim.
  const lastUpdatedAtMs = new Date(attempt.updatedAt).getTime();
  const nowMs = Date.now();
  if (nowMs - lastUpdatedAtMs < 8000) return attempt;

  try {
    const check = await callCheckPayment(attempt.conversationId, {
      orderNumber: attempt.orderNumber,
      attemptId: attempt.id,
      token,
    });
    const isApproved =
      check.responseCode === "B0000" &&
      check.responseDescription === "Approved";
    const isTechnicalPending =
      check.isTechnicalError || check.responseCode === "CHECK_UNAVAILABLE";

    if (isApproved && attempt.letterId) {
      const finalizeResult = await finalizePendingLetterBySystem(
        attempt.letterId,
      );

      if (!("error" in finalizeResult)) {
        await (prisma as any).paymentAttempt.update({
          where: { id: attempt.id },
          data: {
            status: "APPROVED",
            isFinalized: true,
            checkResponseCode: check.responseCode,
            checkResponseDescription: check.responseDescription,
            rawCheckPayload: {
              conversationId: attempt.conversationId,
              data: check,
              source: "status-poll-fallback",
            },
          },
        });
      }
    } else if (isTechnicalPending) {
      await (prisma as any).paymentAttempt.update({
        where: { id: attempt.id },
        data: {
          checkResponseCode: check.responseCode,
          checkResponseDescription: check.responseDescription,
          rawCheckPayload: {
            conversationId: attempt.conversationId,
            data: check,
            source: "status-poll-fallback",
          },
        },
      });
    } else {
      await (prisma as any).paymentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "FAILED",
          checkResponseCode: check.responseCode,
          checkResponseDescription: check.responseDescription,
          rawCheckPayload: {
            conversationId: attempt.conversationId,
            data: check,
            source: "status-poll-fallback",
          },
        },
      });
    }
  } catch (error) {
    console.warn("PAYMENT_STATUS_RECONCILE_ERROR", {
      attemptId: attempt.id,
      orderNumber: attempt.orderNumber,
      conversationId: attempt.conversationId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  const refreshed = await (prisma as any).paymentAttempt.findUnique({
    where: { id: attempt.id },
    select: {
      id: true,
      orderNumber: true,
      conversationId: true,
      status: true,
      isFinalized: true,
      checkResponseCode: true,
      checkResponseDescription: true,
      letterId: true,
      updatedAt: true,
    },
  });

  return (refreshed || attempt) as AttemptRecord;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("order")?.trim();
    const conversationId = searchParams.get("conversationId")?.trim();
    const token = searchParams.get("token")?.trim() || undefined;

    if (!orderNumber && !conversationId) {
      return NextResponse.json(
        { error: "order veya conversationId gerekli." },
        { status: 400 },
      );
    }

    const whereClause = orderNumber
      ? { orderNumber, userId }
      : { conversationId, userId };

    const attempt = await (prisma as any).paymentAttempt.findFirst({
      where: whereClause,
      select: {
        id: true,
        orderNumber: true,
        conversationId: true,
        status: true,
        isFinalized: true,
        checkResponseCode: true,
        checkResponseDescription: true,
        letterId: true,
        rawCallbackPayload: true,
        updatedAt: true,
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Ödeme kaydı bulunamadı." },
        { status: 404 },
      );
    }

    const effectiveToken =
      token ||
      extractTokenFromPayload((attempt as AttemptRecord).rawCallbackPayload);
    const payloadTokenSource = detectTokenSourceFromPayload(
      (attempt as AttemptRecord).rawCallbackPayload,
    );

    console.info("PAYMENT_STATUS_TOKEN_RESOLUTION", {
      orderNumber: attempt.orderNumber,
      attemptId: attempt.id,
      conversationId: attempt.conversationId,
      queryTokenPresent: Boolean(token),
      queryTokenMask: maskOptionalToken(token),
      payloadTokenSource,
      payloadTokenMask: maskOptionalToken(
        extractTokenFromPayload((attempt as AttemptRecord).rawCallbackPayload),
      ),
      effectiveTokenPresent: Boolean(effectiveToken),
      effectiveTokenMask: maskOptionalToken(effectiveToken),
      status: attempt.status,
      isFinalized: attempt.isFinalized,
    });

    const resolvedAttempt =
      normalizeUiStatus(attempt.status, attempt.isFinalized) === "processing"
        ? await reconcilePendingAttempt(
            attempt as AttemptRecord,
            effectiveToken,
          )
        : (attempt as AttemptRecord);

    return NextResponse.json({
      success: true,
      paymentAttemptId: resolvedAttempt.id,
      orderNumber: resolvedAttempt.orderNumber,
      conversationId: resolvedAttempt.conversationId,
      status: resolvedAttempt.status,
      uiStatus: normalizeUiStatus(
        resolvedAttempt.status,
        resolvedAttempt.isFinalized,
      ),
      isFinalized: resolvedAttempt.isFinalized,
      checkResponseCode: resolvedAttempt.checkResponseCode,
      checkResponseDescription: resolvedAttempt.checkResponseDescription,
      letterId: resolvedAttempt.letterId,
      updatedAt: resolvedAttempt.updatedAt,
    });
  } catch (error) {
    console.error("PAYMENT_STATUS_GET_ERROR", error);
    return NextResponse.json(
      { error: "Ödeme durumu alınamadı." },
      { status: 500 },
    );
  }
}
