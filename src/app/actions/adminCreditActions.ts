"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function addCreditToUser(email: string, amount: number) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return { error: "Bu işlemi yapmak için yetkiniz bulunmuyor." };
    }

    return {
      success: false,
      error:
        "Kredi yükleme özelliği kaldırıldı. Sistem doğrudan ödeme modeline geçmiştir.",
    };
  } catch (error: any) {
    console.error("ADD_CREDIT_ADMIN_ERROR:", error);
    return {
      error: error.message || "Bakiye yüklenirken beklenmeyen bir hata oluştu.",
    };
  }
}

export async function searchUsers(query: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return { error: "Yetkisiz işlem." };
    }

    if (!query || query.length < 2) {
      return { users: [] };
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, email: true, name: true },
      take: 10,
    });

    return { users };
  } catch (error: any) {
    console.error("SEARCH_USERS_ERROR:", error);
    return {
      error: error.message || "Kullanıcılar aranırken bir hata oluştu.",
    };
  }
}
