"use client";

import React from "react";

const steps = [
    { id: 1, label: "Mektup" },
    { id: 2, label: "Ekstralar" },
    { id: 3, label: "Bilgiler" },
    { id: 4, label: "Kontrol" },
    { id: 5, label: "Ödeme" },
];

export default function Stepper({ currentStep }: { currentStep: number }) {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative">
                {/* Background Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-paper-dark -z-10" />

                {steps.map((step, index) => {
                    const isActive = currentStep === step.id;
                    const isPassed = currentStep > step.id;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-paper px-2">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${isActive
                                        ? "bg-wood text-paper border-wood shadow-md scale-110"
                                        : isPassed
                                            ? "bg-wood-dark text-paper border-wood-dark"
                                            : "bg-paper-dark text-ink-light border-paper-dark"
                                    }`}
                            >
                                {step.id}
                            </div>
                            <span
                                className={`text-xs sm:text-sm font-medium ${isActive || isPassed ? "text-ink" : "text-ink-light"
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
