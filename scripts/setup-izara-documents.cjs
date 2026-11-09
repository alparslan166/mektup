// Additive, repeatable setup: only creates the new IZARA table/index.
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  await prisma.$transaction(async tx => {
    await tx.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "IzaraDocument" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "imageUrl" TEXT NOT NULL,
      "blobPath" TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "IzaraDocument_pkey" PRIMARY KEY ("id")
    )`);
    await tx.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "IzaraDocument_order_createdAt_idx" ON "IzaraDocument"("order", "createdAt")');
  });
  console.log('IZARA document table is ready. Existing tables were not changed.');
})().catch(() => { console.error('IZARA table setup failed. Check database connectivity and permissions.'); process.exitCode = 1; }).finally(() => prisma.$disconnect());
