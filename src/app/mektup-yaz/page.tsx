"use client";

import React, { useState } from "react";
import { Mail, FileText, ArrowLeft, ArrowRight } from "lucide-react";
import Stepper from "@/components/Stepper";
import Editor from "@/components/Editor";
import ExtrasStep from "@/components/ExtrasStep";
import InfoStep from "@/components/InfoStep";
import ReviewStep from "@/components/ReviewStep";
import PaymentStep from "@/components/PaymentStep";
import SuccessStep from "@/components/SuccessStep";

import { useLetterStore } from "@/store/letterStore";

export default function Home() {
  const currentStep = useLetterStore(state => state.currentStep);
  const nextStep = useLetterStore(state => state.nextStep);
  const prevStep = useLetterStore(state => state.prevStep);
  const letter = useLetterStore(state => state.letter);
  const updateLetter = useLetterStore(state => state.updateLetter);

  // Map color names to actual CSS colors for the editor background
  const paperColors: Record<string, string> = {
    "Beyaz": "#ffffff",
    "Saman": "#f4e4bc",
    "Pembe": "#fdf1f4",
    "Açık Mavi": "#eef7fd",
  };

  const currentBgColor = paperColors[letter.paperColor] || "#ffffff";

  // Step Controllers
  if (currentStep === 6) {
    return <SuccessStep />;
  }

  if (currentStep === 5) {
    return <PaymentStep goBack={prevStep} onComplete={nextStep} />;
  }

  if (currentStep === 4) {
    return <ReviewStep goBack={prevStep} goNext={nextStep} />;
  }

  if (currentStep === 3) {
    return <InfoStep goBack={prevStep} goNext={nextStep} />;
  }

  if (currentStep === 2) {
    return <ExtrasStep goBack={prevStep} goNext={nextStep} />;
  }

  // Fallback to Step 1 (Editor)
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl flex-1 flex flex-col animate-in fade-in duration-300">
      <div className="bg-paper shadow-sm border border-paper-dark rounded-xl p-6 sm:p-10 flex-col flex relative overflow-hidden">
        {/* Subtle decorative background piece */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          {/* Step 1 has no previous back step logically unless going back to home page entirely */}
          <button className="p-2 hover:bg-paper-dark rounded-full transition-colors group opacity-50 cursor-not-allowed">
            <ArrowLeft className="text-ink-light" size={24} />
          </button>
          <h2 className="font-playfair text-3xl font-bold text-wood-dark">Geleceğe Mektup</h2>
        </div>
        <p className="text-ink-light ml-12 text-sm sm:text-base">
          Aşağıdaki boş alana mektubunuzu yazabilirsiniz. Ek olarak zarf ve kağıt rengini buradan seçebilirsiniz.
        </p>

        {/* Stepper */}
        <div className="mt-8 mb-6">
          <Stepper currentStep={1} />
        </div>

        {/* Options Row */}
        <div className="flex flex-wrap gap-4 mb-2 mt-4">
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
              <option value="Saman">Saman</option>
              <option value="Kırmızı">Kırmızı</option>
              <option value="Siyah">Siyah</option>
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
              <option value="Saman">Saman</option>
              <option value="Pembe">Pembe</option>
              <option value="Açık Mavi">Açık Mavi</option>
            </select>
          </div>
        </div>

        {/* Editor */}
        <Editor paperColor={currentBgColor} />

        {/* Bottom Actions */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={nextStep}
            className="bg-seal hover:bg-seal-hover text-paper px-8 py-3 rounded-md font-medium shadow-md transition-all hover:shadow-lg flex items-center gap-2 active:scale-[0.98]">
            Ekstralara Geç
            <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
