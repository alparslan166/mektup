"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getCreditBalanceAction, getCreditTransactionsAction } from "@/app/actions/creditActions";
import { Loader2, ArrowLeft, Wallet, Plus, ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useUIStore } from "@/store/uiStore";

export default function CuzdanPage() {
    const { data: session, status } = useSession();
    const [balance, setBalance] = useState<number | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const setGlobalCreditBalance = useUIStore(state => state.setCreditBalance);

    useEffect(() => {
        if (session) {
            fetchData();
        } else if (status === "unauthenticated") {
            setLoading(false);
        }
    }, [session, status]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [balanceRes, txRes] = await Promise.all([
                getCreditBalanceAction(),
                getCreditTransactionsAction()
            ]);

            if (balanceRes.success && balanceRes.balance !== undefined) {
                setBalance(balanceRes.balance);
                setGlobalCreditBalance(balanceRes.balance);
            }
            if (txRes.success) setTransactions(txRes.transactions!);
        } catch (error) {
            console.error("Veri çekilemedi", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-paper/30">
                <Loader2 size={32} className="animate-spin text-seal" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-slate-500 mb-4">Cüzdanınıza erişmek için giriş yapmalısınız.</p>
                <Link href="/auth/login" className="bg-seal text-white px-6 py-2 rounded-xl font-medium">Giriş Yap</Link>
            </div>
        );
    }

    return (
        <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/app" className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
                    <ArrowLeft size={20} className="text-slate-600" />
                </Link>
                <h1 className="text-2xl font-bold font-playfair text-wood-dark">Cüzdan & Kutu</h1>
            </div>

            {/* Bakiye Kartı */}
            <div className="bg-gradient-to-br from-slate-900 to-wood-dark rounded-3xl p-6 md:p-10 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>

                <div className="relative z-10 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-white/70 mb-2 font-medium">
                        <Wallet size={18} />
                        <span>Güncel Bakiyeniz</span>
                    </div>
                    <div className="text-5xl md:text-6xl font-bold font-playfair flex items-center justify-center md:justify-start gap-3">
                        {balance !== null ? balance : "0"} <span className="text-3xl md:text-4xl text-gold">🪙</span>
                    </div>
                </div>

                <div className="relative z-10 w-full md:w-auto">
                    <button className="w-full md:w-auto bg-gold hover:bg-gold/90 text-wood-dark font-bold px-8 py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group">
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                        Kredi Yükle
                    </button>
                    <p className="text-xs text-white/50 text-center mt-3 font-medium">Kredi yükleme paneli yakında aktif edilecek.</p>
                </div>
            </div>

            {/* İşlem Geçmişi */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800">İşlem Geçmişi</h2>
                    <button onClick={fetchData} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
                        <RefreshCcw size={18} />
                    </button>
                </div>

                {transactions.length === 0 ? (
                    <div className="p-10 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <RefreshCcw size={24} className="text-slate-300" />
                        </div>
                        <p className="font-medium text-slate-600">Henüz hiçbir işlem bulunmuyor.</p>
                        <p className="text-sm text-slate-400 mt-1">Yaptığınız bakiye yüklemeleri ve harcamalar burada listelenir.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'DEPOSIT' || tx.type === 'REFUND'
                                        ? 'bg-emerald-100 text-emerald-600'
                                        : 'bg-rose-100 text-rose-600'
                                        }`}>
                                        {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? (
                                            <ArrowDownRight size={20} />
                                        ) : (
                                            <ArrowUpRight size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm sm:text-base">{tx.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                            <span>{new Date(tx.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                            {tx.referenceId && (
                                                <>
                                                    <span>•</span>
                                                    <span className="truncate max-w-[100px] sm:max-w-none" title={tx.referenceId}>Ref: {tx.referenceId.slice(0, 8)}...</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={`font-bold text-lg whitespace-nowrap ${tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? 'text-emerald-600' : 'text-slate-800'
                                    }`}>
                                    {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '+' : ''}{tx.amount} 🪙
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
