// Additive, repeatable setup: only creates the IZARA "Hakkımızda" table. Existing tables are not changed.
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "IzaraAbout" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "paragraphs" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IzaraAbout_pkey" PRIMARY KEY ("id")
  )`);
  console.log('IZARA about table is ready. Existing tables were not changed.');
})().catch(() => { console.error('IZARA about table setup failed. Check database connectivity and permissions.'); process.exitCode = 1; }).finally(() => prisma.$disconnect());
