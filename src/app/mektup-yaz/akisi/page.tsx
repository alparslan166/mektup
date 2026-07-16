"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, FileText, ArrowLeft, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import Stepper from "@/components/Stepper";
import Editor from "@/components/Editor";
import ExtrasStep from "@/components/ExtrasStep";
import InfoStep from "@/components/InfoStep";
import ReviewStep from "@/components/ReviewStep";
import PaymentStep from "@/components/PaymentStep";
import SuccessStep from "@/components/SuccessStep";
import AutoSave from "@/components/AutoSave";

import { useLetterStore } from "@/store/letterStore";
import { useSession } from "next-auth/react";
import { saveDraft } from "@/app/actions/draftActions";
import { getPricingSettings } from "@/app/actions/settingsActions";

export default function Home() {
  const currentStep = useLetterStore((state) => state.currentStep);
  const nextStep = useLetterStore((state) => state.nextStep);
  const prevStep = useLetterStore((state) => state.prevStep);
  const letter = useLetterStore((state) => state.letter);
  const address = useLetterStore((state) => state.address);
  const updateLetter = useLetterStore((state) => state.updateLetter);

  const { data: session, status } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [envelopePrice, setEnvelopePrice] = useState(10);
  const [paperPrice, setPaperPrice] = useState(10);
  const isAddressComplete = address.isPrison
    ? Boolean(
        address.senderName.trim() &&
        address.senderCity.trim() &&
        address.senderAddress.trim() &&
        address.receiverName.trim() &&
        address.receiverCity.trim() &&
        address.prisonName?.trim() &&
        address.receiverAddress.trim() &&
        address.wardNumber?.trim(),
      )
    : Boolean(
        address.senderName.trim() &&
        address.senderCity.trim() &&
        address.senderAddress.trim() &&
        address.receiverName.trim() &&
        address.receiverPhone.trim() &&
        address.receiverCity.trim() &&
        address.receiverAddress.trim(),
      );

  React.useEffect(() => {
    getPricingSettings().then((res) => {
      if (res.success && res.data) {
        setEnvelopePrice(res.data.envelopeColorPrice || 10);
        setPaperPrice(res.data.paperColorPrice || 10);
      }
    });
  }, []);

  const handleProceed = async () => {
    const state = useLetterStore.getState();
    const currentAddress = state.address;
    const canProceed = currentAddress.isPrison
      ? Boolean(
          currentAddress.senderName.trim() &&
          currentAddress.senderCity.trim() &&
          currentAddress.senderAddress.trim() &&
          currentAddress.receiverName.trim() &&
          currentAddress.receiverCity.trim() &&
          currentAddress.prisonName?.trim() &&
          currentAddress.receiverAddress.trim() &&
          currentAddress.wardNumber?.trim(),
        )
      : Boolean(
          currentAddress.senderName.trim() &&
          currentAddress.senderCity.trim() &&
          currentAddress.senderAddress.trim() &&
          currentAddress.receiverName.trim() &&
          currentAddress.receiverPhone.trim() &&
          currentAddress.receiverCity.trim() &&
          currentAddress.receiverAddress.trim(),
        );

    if (!canProceed) return;

    if (session?.user) {
      setIsSaving(true);
      try {
        const result = await saveDraft(
          {
            orderNumber: state.orderNumber,
            letter: state.letter,
            extras: state.extras,
            address: state.address,
          },
          state.draftId,
        );

        if (
          result.success &&
          result.draftId &&
          result.draftId !== state.draftId
        ) {
          state.setDraftId(result.draftId);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsSaving(false);
      }
    }

    state.setCurrentStep(4);
  };

  // Map color names to actual CSS colors for the editor background
  const paperColors: Record<string, string> = {
    Beyaz: "#ffffff",
    Saman: "#f4e4bc",
    Pembe: "#fdf1f4",
    "Açık Mavi": "#eef7fd",
  };

  const currentBgColor = paperColors[letter.paperColor] || "#ffffff";

  // Step Controllers
  if (currentStep === 6) {
    return <SuccessStep />;
  }

  if (currentStep === 5) {
    return (
      <PaymentStep
        goBack={() => useLetterStore.getState().setCurrentStep(1)}
        onComplete={nextStep}
      />
    );
  }

  if (currentStep === 4) {
    return (
      <ReviewStep
        goBack={() => useLetterStore.getState().setCurrentStep(1)}
        goNext={nextStep}
      />
    );
  }

  // Fallback to Step 1 (Editor)
  // Merged Step 1, 2, 3 into a single scrolling view layout
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl flex-1 flex flex-col gap-8 animate-in fade-in duration-300">
      {status === "unauthenticated" && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-500/10 backdrop-blur-md border border-amber-500/30 shadow-lg flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full"
        >
          <div className="p-3 bg-amber-500/20 text-amber-300 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-amber-200 text-base">Misafir Olarak Mektup Yazıyorsunuz</h4>
            <p className="text-paper/85 text-sm mt-1 font-medium">
              Giriş yapmadığınız için üyelik kampanyalarından, indirimlerden (örneğin 5 mektup sonrası hediye mektup) faydalanamazsınız ve taslağınız kaydedilmez.
            </p>
          </div>
          <Link
            href="/auth/login?callbackUrl=/mektup-yaz/akisi"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap animate-pulse hover:animate-none"
          >
            Giriş Yap / Üye Ol
          </Link>
        </motion.div>
      )}
      {/* 1. EDITOR SECTION */}
      <div className="bg-paper shadow-sm border border-paper-dark rounded-xl p-6 sm:p-10 flex-col flex relative overflow-hidden">
        {/* Subtle decorative background piece */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex justify-center mb-2">
          <h2 className="font-playfair text-3xl font-bold text-wood-dark">
            {useLetterStore.getState().address.isPrison
              ? "Cezaevine Mektup"
              : "Mektup Yazın"}
          </h2>
        </div>
        <p className="text-ink-light text-center text-sm sm:text-base">
          Aşağıdaki boş alana mektubunuzu yazabilirsiniz. Ek olarak zarf ve
          kağıt rengini buradan seçebilirsiniz.
        </p>
        <p className="text-seal/80 text-center text-xs sm:text-sm mt-2 italic font-medium">
          * İlhamınız yarım kalır diye korkmayın; yazdıklarınız otomatik
          kaydedilir ve "Taslaklar" sayfasından her zaman devam edebilirsiniz.
        </p>

        {/* Options Row */}
        <div className="flex flex-wrap gap-4 mt-8 mb-4">
          <div className="flex items-center border border-paper-dark rounded-md bg-paper-light overflow-hidden focus-within:border-wood focus-within:ring-1 focus-within:ring-wood transition-all shadow-sm">
            <div className="px-3 bg-paper-dark text-ink-light flex items-center gap-2 py-2 border-r border-paper-dark">
              <Mail size={18} />
              <span className="text-sm font-medium">Zarf Rengi :</span>
            </div>
            <select
              value={letter.envelopeColor}
              onChange={(e) => updateLetter({ envelopeColor: e.target.value })}
              className="bg-transparent text-ink text-sm font-medium px-4 py-2 outline-none cursor-pointer appearance-none min-w-[120px]"
            >
              <option value="Beyaz">Beyaz</option>
              <option value="Saman">Saman (+{envelopePrice} ₺)</option>
              <option value="Kırmızı">Kırmızı (+{envelopePrice} ₺)</option>
              <option value="Siyah">Siyah (+{envelopePrice} ₺)</option>
            </select>
          </div>

          <div className="flex items-center border border-paper-dark rounded-md bg-paper-light overflow-hidden focus-within:border-wood focus-within:ring-1 focus-within:ring-wood transition-all shadow-sm">
            <div className="px-3 bg-paper-dark text-ink-light flex items-center gap-2 py-2 border-r border-paper-dark">
              <FileText size={18} />
              <span className="text-sm font-medium">Kağıt Rengi :</span>
            </div>
            <select
              value={letter.paperColor}
              onChange={(e) => updateLetter({ paperColor: e.target.value })}
              className="bg-transparent text-ink text-sm font-medium px-4 py-2 outline-none cursor-pointer appearance-none min-w-[120px]"
            >
              <option value="Beyaz">Beyaz</option>
              <option value="Saman">Saman (+{paperPrice} ₺)</option>
              <option value="Pembe">Pembe (+{paperPrice} ₺)</option>
              <option value="Açık Mavi">Açık Mavi (+{paperPrice} ₺)</option>
            </select>
          </div>
        </div>

        {/* Editor */}
        <Editor paperColor={currentBgColor} />
      </div>

      {/* 2. EXTRAS SECTION */}
      <ExtrasStep />

      {/* 3. INFO SECTION */}
      <InfoStep />

      {/* FINAL ACTION BUTTON */}
      <div className="flex flex-col items-center mt-4 mb-12 gap-3">
        <button
          onClick={handleProceed}
          disabled={isSaving || !isAddressComplete}
          className="bg-seal hover:bg-seal-hover text-paper w-full max-w-md py-4 rounded-xl font-bold text-lg shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
        >
          {isSaving ? "Kaydediliyor..." : "Postaya Ver"}
          {isSaving ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <ArrowRight size={24} />
          )}
        </button>
        {!isAddressComplete && (
          <p className="text-xl text-black font-semibold text-center">
            Postaya vermeden önce gönderici ve alıcı bilgilerini eksiksiz
            doldurun.
          </p>
        )}
      </div>

      <AutoSave />
    </div>
  );
}
