import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any).id) {
        redirect("/auth/login");
    }

    const userId = (session.user as any).id;

    // Fetch real stats
    const [user, letterCount, addressCount] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true, referredById: true } }),
        prisma.letter.count({ where: { userId } }),
        prisma.address.count({ where: { userId } }),
    ]);

    return (
        <main className="min-h-screen pt-24 pb-20 px-6">
            <div className="container mx-auto max-w-4xl">
                <ProfileClient
                    session={session}
                    referralCode={user?.referralCode || ""}
                    referredById={user?.referredById || null}
                    stats={{
                        letters: letterCount,
                        addresses: addressCount
                    }}
                />
            </div>
        </main>
    );
}
