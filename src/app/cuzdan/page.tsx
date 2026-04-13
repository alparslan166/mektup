"use client";

import React from "react";
import { Info } from "lucide-react";

export default function CuzdanPage() {
  return (
    <div className="flex-1 w-full max-w-3xl p-4 mx-auto md:p-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10 shadow-sm text-center">
        <div className="w-14 h-14 rounded-full bg-seal/10 text-seal flex items-center justify-center mx-auto mb-4">
          <Info size={26} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Cüzdan Kaldırıldı
        </h1>
        <p className="text-slate-600 leading-relaxed">
          Uygulama kredi modelinden doğrudan ödeme modeline geçmiştir. Ödemeler
          artık her sipariş adımında işlem bazlı olarak alınır.
        </p>
      </div>
    </div>
  );
}
