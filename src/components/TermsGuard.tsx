"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    MESAFELI_SATIS_SOZLESMESI,
    KISISEL_VERILERIN_KORUNMASI_SOZLESMESI,
    UYELIK_SOZLESMESI
} from "@/lib/contracts/groups";
import { acceptTermsAction } from "@/app/actions/userActions";
import { toast } from "react-hot-toast";
import { Loader2, Check, ExternalLink, ShieldCheck, ScrollText } from "lucide-react";

export default function TermsGuard() {
    const { data: session, status, update } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [accepted, setAccepted] = useState({
        sales: false,
        kvkk: false,
        membership: false
    });

    const [viewingContract, setViewingContract] = useState<string | null>(null);

    const isUserLoggedIn = status === "authenticated";
    const termsAccepted = (session?.user as any)?.termsAccepted;

    useEffect(() => {
        // Debug log for checking why it might not show up
        console.log("TermsGuard Check:", { isUserLoggedIn, termsAccepted, status });

        if (isUserLoggedIn && !termsAccepted) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [isUserLoggedIn, termsAccepted, status]);

    const handleAccept = async () => {
        if (!accepted.sales || !accepted.kvkk || !accepted.membership) return;

        setIsSubmitting(true);
        try {
            const res = await acceptTermsAction();
            if (res.success) {
                // Update local session so it reflects the change immediately
                await update({ termsAccepted: true });
                setIsOpen(false);
                toast.success("Sözleşmeler onaylandı.");
            } else {
                toast.error(res.message || "Bir hata oluştu.");
            }
        } catch (error) {
            toast.error("İşlem sırasında bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const contracts = [
        { id: "membership", title: "Üyelik Sözleşmesi", content: UYELIK_SOZLESMESI },
        { id: "kvkk", title: "KVKK Aydınlatma Metni", content: KISISEL_VERILERIN_KORUNMASI_SOZLESMESI },
        { id: "sales", title: "Mesafeli Satış Sözleşmesi", content: MESAFELI_SATIS_SOZLESMESI }
    ];

    const ContractViewer = ({ title, content, onClose }: { title: string, content: string, onClose: () => void }) => (
        <div className="flex flex-col gap-2 mb-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-wood-dark flex items-center gap-2">
                    <ScrollText size={16} />
                    {title}
                </h4>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onClose();
                    }}
                    className="text-xs text-wood hover:text-wood-dark underline"
                >
                    Kapat
                </button>
            </div>
            <div className="bg-paper-light border border-wood/20 rounded-lg p-4 h-60 overflow-y-auto text-xs text-ink-light leading-relaxed whitespace-pre-wrap shadow-inner">
                {content}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300">
            <div className="bg-paper w-full max-w-xl rounded-2xl shadow-2xl border border-wood/20 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-wood p-5 text-paper flex items-center gap-4 border-b border-wood-dark/20">
                    <div className="bg-paper/20 p-2 rounded-xl shrink-0">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-playfair font-bold">Yasal Onaylar</h2>
                        <p className="text-[11px] text-paper/70">Lütfen sözleşmeleri inceleyerek onaylayınız.</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 md:p-8 space-y-4">
                    {/* Compact View Instructions */}
                    {!viewingContract && (
                        <p className="text-xs text-ink-light/80 italic mb-2">
                            Siyah yazılara tıklayarak sözleşme metinlerini okuyabilirsiniz.
                        </p>
                    )}

                    {/* Active Contract View */}
                    {viewingContract && (
                        <ContractViewer
                            title={contracts.find(c => c.id === viewingContract)?.title || ""}
                            content={contracts.find(c => c.id === viewingContract)?.content || ""}
                            onClose={() => setViewingContract(null)}
                        />
                    )}

                    {/* Checkboxes */}
                    <div className="space-y-3">
                        {contracts.map((contract) => (
                            <div key={contract.id} className="flex items-start gap-3 group">
                                <div className="relative mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={(accepted as any)[contract.id]}
                                        onChange={(e) => setAccepted(prev => ({ ...prev, [contract.id]: e.target.checked }))}
                                        className="peer sr-only"
                                        id={`check-${contract.id}`}
                                    />
                                    <label
                                        htmlFor={`check-${contract.id}`}
                                        className="block w-5 h-5 border-2 border-wood/30 rounded-md bg-paper-light cursor-pointer transition-all peer-checked:bg-seal peer-checked:border-seal group-hover:border-wood/50"
                                    >
                                        <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-paper opacity-0 peer-checked:opacity-100 transition-opacity" size={14} />
                                    </label>
                                </div>
                                <span className="text-sm text-ink-light leading-tight">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setViewingContract(viewingContract === contract.id ? null : contract.id);
                                        }}
                                        className="font-bold text-wood-dark hover:text-seal transition-colors underline decoration-wood/20 underline-offset-2"
                                    >
                                        {contract.title}
                                    </button>
                                    {' '}'nı okudum ve onaylıyorum.
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 bg-paper-light border-t border-wood/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <p className="text-[10px] text-ink-light/60 max-w-[240px] text-center sm:text-left">
                        Tüm maddeler onaylandığında "Devam Et" butonu aktif olacaktır.
                    </p>
                    <button
                        onClick={handleAccept}
                        disabled={!accepted.sales || !accepted.kvkk || !accepted.membership || isSubmitting}
                        className="w-full sm:w-auto bg-seal hover:bg-seal-hover text-paper px-8 py-3 rounded-xl font-bold shadow-lg shadow-seal/20 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 text-sm"
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>Onayla ve Devam Et</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
