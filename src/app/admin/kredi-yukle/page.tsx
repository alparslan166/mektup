import React from "react";
import AddCreditForm from "@/components/admin/AddCreditForm";
import { Coins } from "lucide-react";

export const metadata = {
    title: "Kredi Yükle | Admin Paneli",
};

export default function AdminCreditPage() {
    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Coins className="text-seal" />
                        Kullanıcı Cüzdanına Kredi Yükle
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">İstediğiniz kullanıcının hesabına e-posta ile bakiye gönderin.</p>
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
                        <Coins className="text-emerald-500" size={24} />
                        Kredi Yükleme Bilgilendirmesi
                    </h4>
                    <ul className="space-y-4 text-sm text-slate-600">
                        <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">1</span>
                            <p>Yükleme işlemi geri alınamaz. Kredi doğrudan kullanıcının bakiyesine eklenir.</p>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">2</span>
                            <p>Tüm işlemler güvenli şifreleme algoritması ile veritabanına kaydedilir.</p>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">3</span>
                            <p>Aynı anda çoklu yükleme talebi yollamaktan kaçının, çift gönderimler veritabanında Row-Lock (Kuyruk) mantığıyla işlenir.</p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
