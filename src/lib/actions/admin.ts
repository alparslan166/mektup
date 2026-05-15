"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  sendCompletedEmail,
  sendOrderReceivedEmail,
  sendPreparingEmail,
  sendTrackingCodeEmail,
} from "@/app/actions/emailActions";

export async function getAllLetters() {
  const session = await getServerSession(authOptions);
  console.log(
    "getAllLetters called... Session role:",
    (session?.user as any)?.role,
  );

  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return await prisma.letter.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function updateLetterStatus(letterId: string, status: string) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const updatedLetter = await prisma.letter.update({
    where: { id: letterId },
    data: { status },
    include: { user: true },
  });

  const orderRef =
    ((updatedLetter.data as any)?.orderNumber as string | undefined) ||
    updatedLetter.id;

  if (updatedLetter.user?.email) {
    if (status === "PAID") {
      await sendOrderReceivedEmail(updatedLetter.user.email, orderRef);
    } else if (status === "PREPARING") {
      await sendPreparingEmail(updatedLetter.user.email, orderRef);
    } else if (status === "SHIPPED") {
      await sendTrackingCodeEmail(
        updatedLetter.user.email,
        orderRef,
        updatedLetter.trackingCode || undefined,
      );
    } else if (status === "COMPLETED") {
      await sendCompletedEmail(updatedLetter.user.email, orderRef);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/mektuplar");
  revalidatePath("/gonderilenler");
  return updatedLetter;
}
