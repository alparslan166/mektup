import React from "react";

const statusConfig: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Beklemede", color: "bg-amber-100 text-amber-700 border-amber-200" },
    PAID: { label: "Ödendi", color: "bg-blue-100 text-blue-700 border-blue-200" },
    PREPARING: { label: "Hazırlanıyor", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    SHIPPED: { label: "Kargolandı", color: "bg-purple-100 text-purple-700 border-purple-200" },
    COMPLETED: { label: "Tamamlandı", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    CANCELLED: { label: "İptal Edildi", color: "bg-rose-100 text-rose-700 border-rose-200" },
};

export default function LetterStatusBadge({ status }: { status: string }) {
    const config = statusConfig[status] || { label: status, color: "bg-slate-100 text-slate-700 border-slate-200" };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color}`}>
            {config.label}
        </span>
    );
}
