"use client";

import React, { useState } from "react";
import { updateLetterStatus } from "@/lib/actions/admin";
import { toast } from "react-hot-toast";

const statuses = [
    { value: "PENDING", label: "Beklemede" },
    { value: "PAID", label: "Ödendi" },
    { value: "SENT", label: "Gönderildi" },
    { value: "COMPLETED", label: "Tamamlandı" },
    { value: "CANCELLED", label: "İptal Edildi" },
];

export default function StatusUpdater({
    letterId,
    currentStatus,
}: {
    letterId: string;
    currentStatus: string;
}) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === currentStatus) return;

        setIsUpdating(true);
        try {
            await updateLetterStatus(letterId, newStatus);
            toast.success("Durum güncellendi");
        } catch (error) {
            toast.error("Güncelleme başarısız oldu");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <select
            value={currentStatus}
            disabled={isUpdating}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
            {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                    {s.label}
                </option>
            ))}
        </select>
    );
}
