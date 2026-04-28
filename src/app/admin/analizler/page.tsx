import prisma from "@/lib/prisma";
import AdminAnalizlerClient from "./AdminAnalizlerClient";

export const revalidate = 0;

function parseNumber(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default async function AdminAnalizlerPage({
  searchParams,
}: {
  searchParams:
    | { year?: string; month?: string }
    | Promise<{ year?: string; month?: string }>;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [newestLetter, oldestLetter] = await Promise.all([
    prisma.letter.findFirst({
      where: { receiverId: null },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.letter.findFirst({
      where: { receiverId: null },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
  ]);

  const minYear = oldestLetter?.createdAt.getFullYear() ?? currentYear;
  const maxYear = newestLetter?.createdAt.getFullYear() ?? currentYear;

  const yearOptions = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i,
  ).reverse();
  const selectedYear = parseNumber(resolvedSearchParams.year, currentYear);
  const selectedMonth = Math.min(
    12,
    Math.max(1, parseNumber(resolvedSearchParams.month, currentMonth)),
  );

  const yearStart = new Date(selectedYear, 0, 1, 0, 0, 0, 0);
  const nextYearStart = new Date(selectedYear + 1, 0, 1, 0, 0, 0, 0);

  const yearlyLetters = await prisma.letter.findMany({
    where: {
      receiverId: null,
      createdAt: {
        gte: yearStart,
        lt: nextYearStart,
      },
    },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      data: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminAnalizlerClient
      selectedYear={selectedYear}
      initialMonth={selectedMonth}
      yearOptions={yearOptions}
      yearlyLetters={yearlyLetters.map((letter) => ({
        ...letter,
        createdAt: letter.createdAt.toISOString(),
      }))}
    />
  );
}
