import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

async function main() {
    console.log("Resetting all referral codes to new short IDs...");

    const users = await prisma.user.findMany({
        select: { id: true }
    });

    console.log(`Found ${users.length} users. Updating...`);

    let updatedCount = 0;
    for (const user of users) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                referralCode: nanoid(8).toUpperCase()
            }
        });
        updatedCount++;
    }

    console.log(`Successfully updated ${updatedCount} referral codes.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
