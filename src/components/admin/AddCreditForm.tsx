"use client";

import React from "react";
import { Info } from "lucide-react";

export default function AddCreditForm() {
  return (
    <div className="p-6 overflow-hidden bg-white border shadow-sm border-slate-200 rounded-xl sm:p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-seal/10 text-seal">
        <Info size={28} />
      </div>
      <h3 className="text-xl font-bold text-slate-900">
        Kredi Yükleme Kapatıldı
      </h3>
      <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
        Platform doğrudan ödeme modeline geçtiği için manuel kredi yükleme
        özelliği kaldırıldı.
      </p>
    </div>
  );
}
