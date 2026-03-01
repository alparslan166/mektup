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

    const ContractViewer = ({ title, content }: { title: string, content: string }) => (
        <div className="flex flex-col gap-2 mb-4">
            <h4 className="font-semibold text-wood-dark flex items-center gap-2">
                <ScrollText size={16} />
                {title}
            </h4>
            <div className="bg-paper-light border border-wood/20 rounded-lg p-4 h-60 overflow-y-auto text-xs text-ink-light leading-relaxed whitespace-pre-wrap">
                {content}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-paper w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-wood/20 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-wood p-6 text-paper flex items-center gap-4 border-b border-wood-dark/20">
                    <div className="bg-paper/20 p-2 rounded-xl">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-playfair font-bold">Yasal Bilgilendirme ve Onay</h2>
                        <p className="text-xs text-paper/70">Devam etmek için aşağıdaki sözleşmeleri inceleyip onaylamanız gerekmektedir.</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                    <ContractViewer title="Üyelik Sözleşmesi" content={UYELIK_SOZLESMESI} />
                    <ContractViewer title="KVKK Aydınlatma Metni" content={KISISEL_VERILERIN_KORUNMASI_SOZLESMESI} />
                    <ContractViewer title="Mesafeli Satış Sözleşmesi" content={MESAFELI_SATIS_SOZLESMESI} />

                    {/* Checkboxes */}
                    <div className="space-y-4 pt-4 border-t border-wood/10">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative mt-1">
                                <input
                                    type="checkbox"
                                    checked={accepted.membership}
                                    onChange={(e) => setAccepted(prev => ({ ...prev, membership: e.target.checked }))}
                                    className="peer sr-only"
                                />
                                <div className="w-5 h-5 border-2 border-wood/30 rounded-md bg-paper-light transition-all peer-checked:bg-seal peer-checked:border-seal group-hover:border-wood/50"></div>
                                <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-paper opacity-0 peer-checked:opacity-100 transition-opacity" size={14} />
                            </div>
                            <span className="text-sm text-ink-light group-hover:text-wood-dark transition-colors">
                                <span className="font-bold">Üyelik Sözleşmesi</span>'ni okudum ve onaylıyorum.
                            </span>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative mt-1">
                                <input
                                    type="checkbox"
                                    checked={accepted.kvkk}
                                    onChange={(e) => setAccepted(prev => ({ ...prev, kvkk: e.target.checked }))}
                                    className="peer sr-only"
                                />
                                <div className="w-5 h-5 border-2 border-wood/30 rounded-md bg-paper-light transition-all peer-checked:bg-seal peer-checked:border-seal group-hover:border-wood/50"></div>
                                <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-paper opacity-0 peer-checked:opacity-100 transition-opacity" size={14} />
                            </div>
                            <span className="text-sm text-ink-light group-hover:text-wood-dark transition-colors">
                                <span className="font-bold">KVKK Aydınlatma Metni</span>'ni okudum ve verilerimin işlenmesine onay veriyorum.
                            </span>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative mt-1">
                                <input
                                    type="checkbox"
                                    checked={accepted.sales}
                                    onChange={(e) => setAccepted(prev => ({ ...prev, sales: e.target.checked }))}
                                    className="peer sr-only"
                                />
                                <div className="w-5 h-5 border-2 border-wood/30 rounded-md bg-paper-light transition-all peer-checked:bg-seal peer-checked:border-seal group-hover:border-wood/50"></div>
                                <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-paper opacity-0 peer-checked:opacity-100 transition-opacity" size={14} />
                            </div>
                            <span className="text-sm text-ink-light group-hover:text-wood-dark transition-colors">
                                <span className="font-bold">Mesafeli Satış Sözleşmesi</span>'ni okudum ve kabul ediyorum.
                            </span>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-paper-light border-t border-wood/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <p className="text-[10px] text-ink-light/60 max-w-[300px] text-center sm:text-left">
                        Tüm kutucukları işaretlediğinizde "Onayla ve Devam Et" butonu aktif olacaktır.
                    </p>
                    <button
                        onClick={handleAccept}
                        disabled={!accepted.sales || !accepted.kvkk || !accepted.membership || isSubmitting}
                        className="w-full sm:w-auto bg-seal hover:bg-seal-hover text-paper px-10 py-3.5 rounded-xl font-bold shadow-lg shadow-seal/20 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
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
