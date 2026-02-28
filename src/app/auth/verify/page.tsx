"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Geçersiz doğrulama bağlantısı.");
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch(`/api/auth/verify?token=${token}`);
                if (res.ok) {
                    setStatus("success");
                    setMessage("E-posta adresiniz başarıyla doğrulandı! Artık giriş yapabilirsiniz.");
                } else {
                    const data = await res.json();
                    setStatus("error");
                    setMessage(data.message || "Doğrulama sırasında bir hata oluştu.");
                }
            } catch (err) {
                setStatus("error");
                setMessage("Sunucuya bağlanılamadı.");
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 sm:p-10 bg-paper-light">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white border border-wood/20 rounded-3xl shadow-xl overflow-hidden p-8 sm:p-12 text-center">
                    {status === "loading" && (
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-seal/5 rounded-2xl flex items-center justify-center mx-auto text-seal">
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                            <h1 className="font-playfair text-2xl font-bold text-ink">Doğrulanıyor...</h1>
                            <p className="text-ink-light text-sm">Lütfen bekleyin, e-posta adresiniz doğrulanıyor.</p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                                <CheckCircle2 size={32} />
                            </div>
                            <h1 className="font-playfair text-2xl font-bold text-ink">Başarılı!</h1>
                            <p className="text-ink-light text-sm">{message}</p>
                            <Link
                                href="/auth/login"
                                className="w-full bg-seal hover:bg-seal-hover text-paper py-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 mt-8"
                            >
                                Giriş Yap <ArrowRight size={20} />
                            </Link>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-600">
                                <XCircle size={32} />
                            </div>
                            <h1 className="font-playfair text-2xl font-bold text-ink">Hata Oluştu</h1>
                            <p className="text-ink-light text-sm">{message}</p>
                            <Link
                                href="/auth/register"
                                className="w-full bg-wood hover:bg-wood-dark text-paper py-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 mt-8"
                            >
                                Tekrar Kayıt Ol <ArrowRight size={20} />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-wood/50" /></div>}>
            <VerifyContent />
        </Suspense>
    );
}
