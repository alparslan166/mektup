"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getCreditBalanceAction() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    return { success: false, error: "Oturum açmalısınız." };
  }

  return { success: true, balance: 0 };
}

export async function getCreditTransactionsAction() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    return { success: false, error: "Oturum açmalısınız." };
  }

  return { success: true, transactions: [] };
}
