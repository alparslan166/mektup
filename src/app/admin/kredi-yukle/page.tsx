import React from "react";
import AddCreditForm from "@/components/admin/AddCreditForm";
import { Info } from "lucide-react";

export const metadata = {
  title: "Doğrudan Ödeme Modeli | Admin Paneli",
};

export default function AdminCreditPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Info className="text-seal" />
            Kredi Modülü Kaldırıldı
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Sistem doğrudan ödeme modeline geçtiği için manuel kredi yönetimi
            kapatılmıştır.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sol Taraf: Form */}
        <div>
          <AddCreditForm />
        </div>

        {/* Sağ Taraf: Bilgilendirme */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col justify-center h-fit">
          <h4 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
            <Info className="text-emerald-500" size={24} />
            Geçiş Bilgilendirmesi
          </h4>
          <ul className="space-y-4 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                1
              </span>
              <p>
                Mektup, gelen kutusu kilidi ve hediyeler artık işlem bazlı ödeme
                modeliyle ilerler.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                2
              </span>
              <p>
                Kredi bakiyesi üzerinden manuel yükleme veya düşüm işlemleri
                devre dışıdır.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                3
              </span>
              <p>
                Ödeme sağlayıcısı entegrasyonu tamamlandığında bu akış gerçek
                tahsilat ile çalışacaktır.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
