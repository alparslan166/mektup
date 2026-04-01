"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getCreditBalanceAction,
  getCreditTransactionsAction,
} from "@/app/actions/creditActions";
import {
  Loader2,
  ArrowLeft,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import { useUIStore } from "@/store/uiStore";

export default function CuzdanPage() {
  const { data: session, status } = useSession();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const setGlobalCreditBalance = useUIStore((state) => state.setCreditBalance);

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
        getCreditTransactionsAction(),
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
      <div className="flex items-center justify-center flex-1 bg-paper/30">
        <Loader2 size={32} className="animate-spin text-seal" />
      </div>
    );
  }

  // if (!session) {
  //     return (
  //         <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
  //             <p className="mb-4 text-slate-500">Cüzdanınıza erişmek için giriş yapmalısınız.</p>
  //             <Link href="/auth/login" className="px-6 py-2 font-medium text-white bg-seal rounded-xl">Giriş Yap</Link>
  //         </div>
  //     );
  // }

  return (
    <div className="flex-1 w-full max-w-4xl p-4 mx-auto md:p-8">
      {/* <div className="flex items-center gap-4 mb-6">
                <Link href="/app" className="p-2 transition-colors bg-white border shadow-sm rounded-xl border-slate-200 hover:bg-slate-50">
                    <ArrowLeft size={20} className="text-slate-600" />
                </Link>
                <h1 className="text-2xl font-bold font-playfair text-wood-dark">Cüzdan & Kutu</h1>
            </div> */}

      {/* Bakiye Kartı */}
      <div className="relative flex flex-col items-center justify-between gap-6 p-6 mb-8 overflow-hidden text-white shadow-xl bg-gradient-to-br from-slate-900 to-wood-dark rounded-3xl md:p-10 md:flex-row">
        <div className="absolute top-0 right-0 w-64 h-64 -translate-y-1/2 rounded-full bg-white/5 translate-x-1/3 blur-3xl"></div>

        <div className="relative z-10 text-center md:text-left">
          <div className="flex items-center justify-center gap-2 mb-2 font-medium md:justify-start text-white/70">
            <Wallet size={18} />
            <span>Güncel Bakiyeniz</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-5xl font-bold md:text-6xl font-playfair md:justify-start">
            {balance !== null ? balance : "0"}{" "}
            <span className="text-3xl md:text-4xl text-gold">🪙</span>
          </div>
        </div>

        <div className="relative z-10 w-full md:w-auto">
          <button className="flex items-center justify-center w-full gap-2 px-8 py-4 font-bold transition-all shadow-lg md:w-auto bg-gold hover:bg-gold/90 text-wood-dark rounded-xl group">
            <Plus
              size={20}
              className="transition-transform group-hover:rotate-90"
            />
            Kredi Yükle
          </button>
          <p className="mt-3 text-xs font-medium text-center text-white/50">
            Kredi yükleme paneli yakında aktif edilecek.
          </p>
        </div>
      </div>

      {/* İşlem Geçmişi */}
      <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">İşlem Geçmişi</h2>
          <button
            onClick={fetchData}
            className="p-2 transition-colors rounded-lg hover:bg-slate-50 text-slate-500"
          >
            <RefreshCcw size={18} />
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center p-10 text-center">
            <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-slate-50">
              <RefreshCcw size={24} className="text-slate-300" />
            </div>
            <p className="font-medium text-slate-600">
              Henüz hiçbir işlem bulunmuyor.
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Yaptığınız bakiye yüklemeleri ve harcamalar burada listelenir.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 transition-colors sm:p-5 hover:bg-slate-50/50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === "DEPOSIT" || tx.type === "REFUND"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-rose-100 text-rose-600"
                    }`}
                  >
                    {tx.type === "DEPOSIT" || tx.type === "REFUND" ? (
                      <ArrowDownRight size={20} />
                    ) : (
                      <ArrowUpRight size={20} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 sm:text-base">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>
                        {new Date(tx.createdAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {tx.referenceId && (
                        <>
                          <span>•</span>
                          <span
                            className="truncate max-w-[100px] sm:max-w-none"
                            title={tx.referenceId}
                          >
                            Ref: {tx.referenceId.slice(0, 8)}...
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className={`font-bold text-lg whitespace-nowrap ${
                    tx.type === "DEPOSIT" || tx.type === "REFUND"
                      ? "text-emerald-600"
                      : "text-slate-800"
                  }`}
                >
                  {tx.type === "DEPOSIT" || tx.type === "REFUND" ? "+" : ""}
                  {tx.amount} 🪙
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
