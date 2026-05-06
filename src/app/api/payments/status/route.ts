import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function normalizeUiStatus(status: string, isFinalized: boolean) {
  if (status === "APPROVED" && isFinalized) return "success";
  if (status === "FAILED" || status === "CANCELLED") return "failed";
  return "processing";
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

    return NextResponse.json({
      success: true,
      paymentAttemptId: attempt.id,
      orderNumber: attempt.orderNumber,
      conversationId: attempt.conversationId,
      status: attempt.status,
      uiStatus: normalizeUiStatus(attempt.status, attempt.isFinalized),
      isFinalized: attempt.isFinalized,
      checkResponseCode: attempt.checkResponseCode,
      checkResponseDescription: attempt.checkResponseDescription,
      letterId: attempt.letterId,
      updatedAt: attempt.updatedAt,
    });
  } catch (error) {
    console.error("PAYMENT_STATUS_GET_ERROR", error);
    return NextResponse.json(
      { error: "Ödeme durumu alınamadı." },
      { status: 500 },
    );
  }
}
