const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const start = Date.now();
    try {
        const gifts = await prisma.gift.findMany({ take: 1 });
        console.log(`Connected and fetched in ${Date.now() - start}ms`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
