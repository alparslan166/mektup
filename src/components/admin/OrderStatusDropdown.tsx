"use client";

import React, { useState } from "react";
import { updateGiftOrderStatus } from "@/app/actions/adminGiftOrderActions";
import { Loader2 } from "lucide-react";

export default function OrderStatusDropdown({
    orderId,
    currentStatus
}: {
    orderId: string;
    currentStatus: string;
}) {
    const [status, setStatus] = useState(currentStatus);
    const [isLoading, setIsLoading] = useState(false);

    const statuses = [
        { value: "PAID", label: "Yeni (Ödendi)" },
        { value: "PREPARING", label: "Hazırlanıyor" },
        { value: "SHIPPED", label: "Kargolandı" },
        { value: "COMPLETED", label: "Tamamlandı" }
    ];

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        if (newStatus === status) return;

        setIsLoading(true);
        const result = await updateGiftOrderStatus(orderId, newStatus);

        if (result.success) {
            setStatus(newStatus);
        } else {
            alert(result.error || "Durum güncellenirken bir hata oluştu.");
            e.target.value = status; // Revert select value on error
        }
        setIsLoading(false);
    };

    return (
        <div className="relative inline-flex items-center">
            <select
                value={status}
                onChange={handleStatusChange}
                disabled={isLoading}
                className={`text-sm font-semibold rounded-lg pl-3 pr-8 py-1.5 appearance-none border outline-none cursor-pointer transition-colors ${status === 'PAID' ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' :
                        status === 'PREPARING' ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' :
                            status === 'SHIPPED' ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' :
                                'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                {statuses.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                ))}
            </select>

            {/* Custom SVG Arrow overlay */}
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                {isLoading ? (
                    <Loader2 size={14} className="animate-spin text-current" />
                ) : (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
        </div>
    );
}
