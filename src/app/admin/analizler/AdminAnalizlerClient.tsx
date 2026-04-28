"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { BarChart3, Calendar, CircleDollarSign, FileText } from "lucide-react";

const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
] as const;

type YearlyLetter = {
  id: string;
  status: string;
  totalAmount: number | null;
  createdAt: string;
  data: unknown;
};

function getLetterType(data: unknown) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Standart Mektup";
  }

  const address = (data as Record<string, unknown>).address;
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return "Standart Mektup";
  }

  const isPrison = (address as Record<string, unknown>).isPrison;
  return isPrison ? "Cezaevi Mektubu" : "Standart Mektup";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function AdminAnalizlerClient({
  selectedYear,
  initialMonth,
  yearOptions,
  yearlyLetters,
}: {
  selectedYear: number;
  initialMonth: number;
  yearOptions: number[];
  yearlyLetters: YearlyLetter[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  const yearButtonOptions = useMemo(
    () =>
      Array.from(new Set([...yearOptions, 2027, 2028, 2029, 2030])).sort(
        (a, b) => a - b,
      ),
    [yearOptions],
  );

  const monthlyLetters = useMemo(
    () =>
      yearlyLetters.filter(
        (letter) => new Date(letter.createdAt).getMonth() + 1 === selectedMonth,
      ),
    [yearlyLetters, selectedMonth],
  );

  const paidLetters = useMemo(
    () =>
      monthlyLetters.filter(
        (letter) =>
          letter.status === "PAID" ||
          letter.status === "PREPARING" ||
          letter.status === "SHIPPED" ||
          letter.status === "COMPLETED",
      ),
    [monthlyLetters],
  );

  const monthlySalesCount = monthlyLetters.length;
  const totalRevenue = monthlyLetters.reduce(
    (sum, letter) => sum + (letter.totalAmount ?? 0),
    0,
  );

  const statusLabels: Record<string, string> = {
    PAID: "Ödendi",
    PREPARING: "Hazırlanıyor",
    SHIPPED: "Kargoya Verildi",
    COMPLETED: "Teslim Edildi",
  };

  const statusColors: Record<string, string> = {
    PAID: "#3B82F6",
    PREPARING: "#F97316",
    SHIPPED: "#8B5CF6",
    COMPLETED: "#10B981",
  };

  const statusCounts = ["PAID", "PREPARING", "SHIPPED", "COMPLETED"].map(
    (status) => ({
      status,
      label: statusLabels[status],
      value: monthlyLetters.filter((letter) => letter.status === status).length,
      color: statusColors[status],
    }),
  );

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const donutTotal =
    statusCounts.reduce((sum, item) => sum + item.value, 0) || 1;

  let accumulated = 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-playfair font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="text-blue-600" size={28} /> Sipariş Analizleri
        </h1>
        <p className="text-slate-500">
          Ay ve yıla göre mektup satışlarını görüntüleyin.
        </p>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="inline-flex items-center gap-2 text-sm text-slate-600 font-medium">
            <Calendar size={16} /> Yıl
          </div>
          <div className="flex flex-wrap gap-2">
            {yearButtonOptions.map((year) => (
              <button
                key={year}
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(() => {
                    router.push(
                      `/admin/analizler?year=${year}&month=${selectedMonth}`,
                    );
                  })
                }
                className={`px-3 py-1.5 rounded-full border text-sm font-semibold transition-colors ${
                  selectedYear === year
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                } ${isPending ? "opacity-70 cursor-wait" : ""}`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {MONTHS.map((monthName, index) => {
            const monthNumber = index + 1;
            const isActive = selectedMonth === monthNumber;

            return (
              <button
                key={monthName}
                type="button"
                onClick={() => setSelectedMonth(monthNumber)}
                className={`px-3 py-2 rounded-full border text-center text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {monthName}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Toplam Mektup Satışı
          </p>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {monthlySalesCount}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Toplam Kazanç
          </p>
          <p className="text-3xl font-black text-emerald-600 mt-2">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Ödenmiş Mektuplar ({paidLetters.length})
          </h2>
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {paidLetters.length === 0 && (
              <div className="text-sm text-slate-500 border border-dashed border-slate-300 rounded-lg p-4">
                Seçili dönemde Ödenmiş durumunda mektup yok.
              </div>
            )}
            {paidLetters.map((letter) => (
              <div
                key={letter.id}
                className="border border-slate-200 rounded-lg p-3 flex justify-between items-start gap-3"
              >
                <div>
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <FileText size={15} className="text-blue-500" />
                    {getLetterType(letter.data)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDate(letter.createdAt)}
                  </p>
                </div>
                <p className="text-sm font-bold text-emerald-600 whitespace-nowrap">
                  {formatCurrency(letter.totalAmount ?? 0)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Durum Dağılımı
          </h2>
          <div className="relative w-52 h-52">
            <svg
              width="208"
              height="208"
              viewBox="0 0 208 208"
              className="-rotate-90"
            >
              <circle
                cx="104"
                cy="104"
                r={radius}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="20"
              />
              {statusCounts.map((item) => {
                const segment = (item.value / donutTotal) * circumference;
                const dashOffset = circumference - accumulated;
                accumulated += segment;

                if (item.value === 0) return null;

                return (
                  <circle
                    key={item.status}
                    cx="104"
                    cy="104"
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="20"
                    strokeDasharray={`${segment} ${circumference - segment}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="butt"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <CircleDollarSign className="text-emerald-500 mb-1" size={18} />
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">
                Toplam Kazanç
              </p>
              <p className="text-lg font-black text-slate-900">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>

          <div className="mt-6 w-full grid grid-cols-2 gap-2">
            {statusCounts.map((item) => (
              <div
                key={item.status}
                className="text-xs text-slate-600 flex items-center justify-between border border-slate-200 rounded-md px-2 py-1.5"
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
