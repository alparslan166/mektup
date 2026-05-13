import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { finalizePendingLetterBySystem } from "@/app/actions/letterActions";
import {
  buildCheckPaymentPayload,
  getCheckPaymentUrl,
  getMorparaHeaders,
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

async function callCheckPayment(conversationId: string) {
  const response = await fetch(getCheckPaymentUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getMorparaHeaders(),
    },
    body: JSON.stringify(buildCheckPaymentPayload({ conversationId })),
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      responseCode: `HTTP_${response.status}`,
      responseDescription: `CheckPayment HTTP ${response.status}`,
    };
  }

  const raw = (await response.json()) as Record<string, unknown>;
  return {
    responseCode: pickField(raw, "responseCode") || "CHECK_UNAVAILABLE",
    responseDescription:
      pickField(raw, "responseDescription") || "CheckPayment sonucu alınamadı",
  };
}

async function reconcilePendingAttempt(attempt: AttemptRecord) {
  if (!attempt.conversationId) return attempt;
  if (attempt.status === "APPROVED" || attempt.status === "FAILED")
    return attempt;

  // Poll endpoint'i sık çağrıldığı için provider tarafına gereksiz yüklenmeyelim.
  const lastUpdatedAtMs = new Date(attempt.updatedAt).getTime();
  const nowMs = Date.now();
  if (nowMs - lastUpdatedAtMs < 8000) return attempt;

  try {
    const check = await callCheckPayment(attempt.conversationId);
    const isApproved =
      check.responseCode === "B0000" &&
      check.responseDescription === "Approved";

    if (!isApproved) {
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
    } else if (attempt.letterId) {
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
        updatedAt: true,
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Ödeme kaydı bulunamadı." },
        { status: 404 },
      );
    }

    const resolvedAttempt =
      normalizeUiStatus(attempt.status, attempt.isFinalized) === "processing"
        ? await reconcilePendingAttempt(attempt as AttemptRecord)
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
