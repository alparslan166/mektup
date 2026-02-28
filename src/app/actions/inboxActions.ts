"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getUnreadInboxCount() {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;
        if (!userId) return 0;

        const count = await prisma.incomingLetter.count({
            where: {
                userId: userId,
                isRead: false
            }
        });

        return count;
    } catch (error) {
        console.error("GET_UNREAD_INBOX_COUNT_ERROR", error);
        return 0;
    }
}
