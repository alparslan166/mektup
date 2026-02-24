"use client";

import { useEffect, useRef, useState } from "react";
import { useLetterStore } from "@/store/letterStore";
import { saveDraft, getDraft } from "@/app/actions/draftActions";
import { useSession } from "next-auth/react";
import { CheckCircle2, Loader2, CloudOff } from "lucide-react";

export default function AutoSave() {
    const { draftId, setDraftId, letter, extras, address } = useLetterStore();
    const { status } = useSession();

    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const isFirstRender = useRef(true);
    const saveTimeout = useRef<NodeJS.Timeout | null>(null);

    // Save Logic
    useEffect(() => {
        // Don't save on the very first render to prevent overwriting DB immediately
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (status !== "authenticated") return;

        // Debouncing
        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        setSaveStatus("saving");

        saveTimeout.current = setTimeout(async () => {
            const dataToSave = { letter, extras, address };
            const result = await saveDraft(dataToSave, draftId);

            if (result.success) {
                // If it was a new draft, set the ID in the store so future saves update it
                if (result.draftId && result.draftId !== draftId) {
                    setDraftId(result.draftId);
                }

                setSaveStatus("saved");
                // Reset to idle after 3 seconds
                setTimeout(() => setSaveStatus("idle"), 3000);
            } else {
                setSaveStatus("error");
            }
        }, 2000); // 2 second delay

        return () => {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
        };
    }, [letter, extras, address, status, draftId, setDraftId]);

    if (status !== "authenticated") return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
            <div className="bg-paper shadow-lg border border-wood/20 rounded-full px-4 py-2 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {saveStatus === "saving" && (
                    <>
                        <Loader2 className="animate-spin text-wood" size={14} />
                        <span className="text-[11px] font-bold text-wood-dark tracking-tighter uppercase">Kaydediliyor...</span>
                    </>
                )}
                {saveStatus === "saved" && (
                    <>
                        <CheckCircle2 className="text-emerald-500" size={14} />
                        <span className="text-[11px] font-bold text-emerald-600 tracking-tighter uppercase">Kaydedildi</span>
                    </>
                )}
                {saveStatus === "error" && (
                    <>
                        <CloudOff className="text-red-500" size={14} />
                        <span className="text-[11px] font-bold text-red-600 tracking-tighter uppercase">Hata! Kaydedilemedi</span>
                    </>
                )}
                {saveStatus === "idle" && (
                    <>
                        <CheckCircle2 className="text-wood/30" size={14} />
                        <span className="text-[11px] font-bold text-wood-dark/40 tracking-tighter uppercase">Bulut Senkronize</span>
                    </>
                )}
            </div>
        </div>
    );
}
