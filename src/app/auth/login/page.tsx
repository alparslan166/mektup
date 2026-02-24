"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const isRegistered = searchParams.get("registered") === "true";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("E-posta veya şifre hatalı.");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("Bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-paper border border-wood/20 rounded-2xl shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                    <div className="p-8 sm:p-10">
                        <div className="text-center mb-8">
                            <h1 className="font-playfair text-3xl font-bold text-wood-dark mb-2">Hoş Geldiniz</h1>
                            <p className="text-ink-light text-sm">Devam etmek için giriş yapın.</p>
                        </div>

                        {isRegistered && (
                            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm p-4 rounded-xl mb-6 flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-emerald-600" />
                                Kaydınız başarıyla oluşturuldu. Şimdi giriş yapabilirsiniz.
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-ink-light ml-1">E-posta Adresi</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ornek@mail.com"
                                        className="w-full bg-paper-light border border-wood/20 focus:border-wood focus:ring-1 focus:ring-wood rounded-xl py-3 pl-11 pr-4 outline-none transition-all placeholder:text-ink-light/40"
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-wood/50" size={18} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-semibold text-ink-light">Şifre</label>
                                    <Link href="#" className="text-xs text-seal hover:underline">Şifremi Unuttum</Link>
                                </div>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-paper-light border border-wood/20 focus:border-wood focus:ring-1 focus:ring-wood rounded-xl py-3 pl-11 pr-4 outline-none transition-all placeholder:text-ink-light/40"
                                    />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-wood/50" size={18} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-seal hover:bg-seal-hover text-paper py-4 rounded-xl font-bold shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>Giriş Yap <ArrowRight size={20} /></>
                                )}
                            </button>
                        </form>

                        <div className="my-6 flex items-center gap-3">
                            <div className="h-[1px] flex-1 bg-wood/10"></div>
                            <span className="text-[10px] font-bold text-ink-light/40 tracking-widest uppercase">veya</span>
                            <div className="h-[1px] flex-1 bg-wood/10"></div>
                        </div>

                        <button
                            onClick={() => signIn("google", { callbackUrl: "/mektup-yaz/akisi" })}
                            className="w-full bg-paper border border-wood/20 hover:border-wood/40 text-wood-dark py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-3 hover:bg-paper-light active:scale-[0.98]"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                                />
                            </svg>
                            Google ile Devam Et
                        </button>

                        <div className="mt-8 pt-6 border-t border-wood/10 text-center">
                            <p className="text-sm text-ink-light">
                                Hesabınız yok mu?{" "}
                                <Link href="/auth/register" className="text-seal font-bold hover:underline underline-offset-4">Kayıt Olun</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center p-6"><Loader2 className="animate-spin text-wood/50" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
