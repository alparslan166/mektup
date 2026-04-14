"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Shield,
  UserCheck,
  Scale,
  Loader2,
  Pencil,
} from "lucide-react";
import { getContractSettings } from "@/app/actions/settingsActions";
import { useSession } from "next-auth/react";
import {
  MESAFELI_SATIS_SOZLESMESI,
  KISISEL_VERILERIN_KORUNMASI_SOZLESMESI,
  UYELIK_SOZLESMESI,
  GIZLILIK_VE_GUVENLIK_POLITIKASI,
  TESLIMAT_VE_IADE_SARTLARI,
  CONTRACT_KEYS,
} from "@/lib/contracts/groups";

const initialContracts = [
  {
    id: "uyelik",
    dbKey: CONTRACT_KEYS.UYELIK,
    title: "Üyelik Sözleşmesi",
    icon: <UserCheck size={20} />,
    fallbackContent: UYELIK_SOZLESMESI,
  },
  {
    id: "kvkk",
    dbKey: CONTRACT_KEYS.KVKK,
    title: "KVKK Aydınlatma Metni",
    icon: <Shield size={20} />,
    fallbackContent: KISISEL_VERILERIN_KORUNMASI_SOZLESMESI,
  },
  {
    id: "mesafeli-satis",
    dbKey: CONTRACT_KEYS.MESAFELI_SATIS,
    title: "Mesafeli Satış Sözleşmesi",
    icon: <Scale size={20} />,
    fallbackContent: MESAFELI_SATIS_SOZLESMESI,
  },
  {
    id: "gizlilik",
    dbKey: CONTRACT_KEYS.GIZLILIK,
    title: "Gizlilik ve Güvenlik Politikası",
    icon: <FileText size={20} />,
    fallbackContent: GIZLILIK_VE_GUVENLIK_POLITIKASI,
  },
  {
    id: "teslimat-iade",
    dbKey: CONTRACT_KEYS.TESLIMAT_IADE,
    title: "Teslimat ve İade Şartları",
    icon: <FileText size={20} />,
    fallbackContent: TESLIMAT_VE_IADE_SARTLARI,
  },
];

export default function SozlesmelerPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const [activeTab, setActiveTab] = useState(initialContracts[0].id);
  const [contents, setContents] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchContracts() {
      const res = await getContractSettings();
      if (res.success && res.data) {
        setContents(res.data);
      }
      setIsLoading(false);
    }
    fetchContracts();
  }, []);

  const getContractContent = (dbKey: string, fallback: string) => {
    return contents[dbKey] || fallback;
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl flex-1 flex flex-col animate-in fade-in duration-500">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-ink-light hover:text-ink transition-colors mb-8 w-fit bg-paper/60 px-4 py-2 rounded-full backdrop-blur-sm border border-wood/10 shadow-sm group"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="font-medium text-sm">Ana Sayfaya Dön</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="font-playfair text-2xl font-bold text-wood-dark mb-6 px-2">
            Sözleşmelerimiz
          </h2>
          {initialContracts.map((contract) => (
            <button
              key={contract.id}
              onClick={() => setActiveTab(contract.id)}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                activeTab === contract.id
                  ? "bg-wood text-paper shadow-lg shadow-wood/20"
                  : "hover:bg-paper-light text-ink-light hover:text-wood-dark"
              }`}
            >
              {contract.icon}
              <span className="text-sm font-semibold">{contract.title}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-paper shadow-xl border border-wood/10 rounded-2xl p-6 md:p-10 relative overflow-hidden min-h-[600px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-wood/40 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="text-sm font-medium">Yükleniyor...</p>
              </div>
            ) : (
              initialContracts.map((contract) => (
                <div
                  key={contract.id}
                  className={`animate-in fade-in slide-in-from-bottom-4 duration-500 ${activeTab === contract.id ? "block" : "hidden"}`}
                >
                  <div className="flex justify-between items-center mb-8 border-b border-paper-dark pb-6">
                    <h1 className="font-playfair text-3xl font-bold text-wood-dark">
                      {contract.title}
                    </h1>
                    {isAdmin && (
                      <Link
                        href="/admin/sozlesmeler"
                        className="p-2 bg-paper-dark/50 hover:bg-wood hover:text-paper rounded-full transition-all group/edit"
                        title="Sözleşmeyi Düzenle"
                      >
                        <Pencil
                          size={18}
                          className="group-hover/edit:scale-110 transition-transform"
                        />
                      </Link>
                    )}
                  </div>
                  <div className="prose prose-sm sm:prose-base text-ink max-w-none whitespace-pre-wrap leading-relaxed font-kurale">
                    {getContractContent(
                      contract.dbKey,
                      contract.fallbackContent,
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
