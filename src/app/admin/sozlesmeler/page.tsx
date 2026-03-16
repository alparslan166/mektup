"use client";

import React, { useState, useEffect } from "react";
import { getContractSettings, updateContractSetting } from "@/app/actions/settingsActions";
import { 
    MESAFELI_SATIS_SOZLESMESI, 
    KISISEL_VERILERIN_KORUNMASI_SOZLESMESI, 
    UYELIK_SOZLESMESI, 
    GIZLILIK_VE_GUVENLIK_POLITIKASI,
    CONTRACT_KEYS
} from "@/lib/contracts/groups";
import { toast } from "react-hot-toast";
import { Loader2, Save, FileText, Scale, UserCheck, Shield } from "lucide-react";

const contractIcons: Record<string, React.ReactNode> = {
    [CONTRACT_KEYS.UYELIK]: <UserCheck size={20} />,
    [CONTRACT_KEYS.KVKK]: <Shield size={20} />,
    [CONTRACT_KEYS.MESAFELI_SATIS]: <Scale size={20} />,
    [CONTRACT_KEYS.GIZLILIK]: <FileText size={20} />,
};

const contractTitles: Record<string, string> = {
    [CONTRACT_KEYS.UYELIK]: "Üyelik Sözleşmesi",
    [CONTRACT_KEYS.KVKK]: "KVKK Aydınlatma Metni",
    [CONTRACT_KEYS.MESAFELI_SATIS]: "Mesafeli Satış Sözleşmesi",
    [CONTRACT_KEYS.GIZLILIK]: "Gizlilik ve Güvenlik Politikası",
};

const initialContents: Record<string, string> = {
    [CONTRACT_KEYS.MESAFELI_SATIS]: MESAFELI_SATIS_SOZLESMESI,
    [CONTRACT_KEYS.KVKK]: KISISEL_VERILERIN_KORUNMASI_SOZLESMESI,
    [CONTRACT_KEYS.UYELIK]: UYELIK_SOZLESMESI,
    [CONTRACT_KEYS.GIZLILIK]: GIZLILIK_VE_GUVENLIK_POLITIKASI,
};

export default function AdminContractsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState(CONTRACT_KEYS.UYELIK);
    const [contents, setContents] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        const res = await getContractSettings();
        if (res.success && res.data) {
            const mergedContents = { ...initialContents };
            Object.entries(res.data).forEach(([key, value]) => {
                mergedContents[key] = value;
            });
            setContents(mergedContents);
        } else {
            setContents(initialContents);
            toast.error("Sözleşmeler yüklenirken bir sorun oluştu, varsayılan değerler gösteriliyor.");
        }
        setIsLoading(false);
    };

    const handleContentChange = (newContent: string) => {
        setContents(prev => ({ ...prev, [activeTab]: newContent }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const res = await updateContractSetting(activeTab, contents[activeTab]);
        if (res.success) {
            toast.success("Sözleşme başarıyla kaydedildi.");
        } else {
            toast.error(res.error || "Kaydedilemedi.");
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Sözleşme Yönetimi</h2>
                    <p className="text-slate-500 mt-1">Sistemdeki yasal sözleşmelerin içeriğini buradan düzenleyebilirsiniz.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all disabled:opacity-50 shadow-sm"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>Değişiklikleri Kaydet</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1 space-y-2">
                    {Object.values(CONTRACT_KEYS).map((key) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === key
                                    ? "bg-slate-900 text-white shadow-md"
                                    : "bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200"
                                }`}
                        >
                            {contractIcons[key]}
                            <span className="text-sm font-semibold">{contractTitles[key]}</span>
                        </button>
                    ))}
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[700px] flex flex-col">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-bold text-slate-800">{contractTitles[activeTab]}</h3>
                        </div>
                        <div className="flex-1 p-6 relative">
                            <textarea
                                value={contents[activeTab] || ""}
                                onChange={(e) => handleContentChange(e.target.value)}
                                className="w-full h-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none font-mono text-sm resize-none"
                                placeholder="Sözleşme içeriğini buraya giriniz..."
                            />
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-slate-400 italic">
                        * Not: İçerik düz metin (plain text) olarak saklanmaktadır. Satır başları ve paragraf boşlukları korunur.
                    </p>
                </div>
            </div>
        </div>
    );
}
