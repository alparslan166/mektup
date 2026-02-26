"use client";

import React, { useState } from "react";
import { useLetterStore } from "@/store/letterStore";
import { useRouter } from "next/navigation";
import { Clock, Trash2, Edit3, ArrowRight, AlertTriangle, Loader2, AtSign, Mail } from "lucide-react";
import { deleteDraft } from "@/app/actions/draftActions";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface DraftClientProps {
    drafts: any[];
}

export default function DraftListClient({ drafts }: DraftClientProps) {
    const router = useRouter();
    const hydrateStore = useLetterStore(state => state.hydrateStore);

    const [draftToDelete, setDraftToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleResume = (draft: any) => {
        // Load draft data into Zustand, including the specific draftId
        hydrateStore({
            draftId: draft.id,
            letter: draft.data.letter,
            extras: draft.data.extras,
            address: draft.data.address
        });

        router.push("/mektup-yaz/akisi");
    };

    const confirmDelete = async () => {
        if (!draftToDelete) return;

        setIsDeleting(true);
        const res = await deleteDraft(draftToDelete);

        if (res.success) {
            toast.success("Taslak silindi.");
        } else {
            toast.error(res.error || "Silinirken bir hata oluştu.");
        }

        setIsDeleting(false);
        setDraftToDelete(null);
    };

    if (drafts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-wood/20 rounded-2xl bg-paper/50 mt-8">
                <div className="w-16 h-16 bg-wood/10 rounded-full flex items-center justify-center mb-4">
                    <Edit3 size={32} className="text-wood" />
                </div>
                <h3 className="text-xl font-bold text-wood-dark mb-2 font-playfair">Henüz bir taslağınız yok</h3>
                <p className="text-ink-light mb-6">Yarım bıraktığınız mektuplar otomatik olarak burada görünür.</p>
                <button
                    onClick={() => router.push("/mektup-yaz")}
                    className="bg-seal text-paper px-6 py-3 rounded-lg font-bold hover:bg-seal-hover transition-colors"
                >
                    Yeni Mektup Yaz
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {drafts.map((draft) => {
                    // Determine preview text from the rich text content
                    const rawContent = draft.data?.letter?.content || "";
                    // Simple regex to strip HTML for the preview
                    const previewText = rawContent.replace(/<[^>]+>/g, "").slice(0, 100) + "...";
                    const wordCount = draft.data?.letter?.wordCount || 0;

                    const dateOptions: Intl.DateTimeFormatOptions = {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    };
                    const formattedDate = new Date(draft.updatedAt).toLocaleDateString('tr-TR', dateOptions);

                    const isDM = draft.data?.address?.receiverCity === "Dijital";

                    return (
                        <div
                            key={draft.id}
                            onClick={() => handleResume(draft)}
                            className="group flex flex-col p-6 rounded-2xl border-2 border-wood/20 bg-[#f3ead1]/95 backdrop-blur-md shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-paper-dark" />

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-wood-dark bg-paper-dark/30 px-3 py-1.5 rounded-full">
                                    <Clock size={14} />
                                    {formattedDate}
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDraftToDelete(draft.id);
                                    }}
                                    className="p-2 text-wood/40 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
                                    title="Taslağı Sil"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-xl border ${isDM ? 'bg-seal/10 text-seal border-seal/20' : 'bg-paper text-wood border-wood/20'}`}>
                                    {isDM ? <AtSign size={20} /> : <Mail size={20} />}
                                </div>
                                <h4 className="font-playfair text-xl font-bold text-wood-dark">
                                    {draft.data?.address?.receiverName ?
                                        (isDM ? `Dijital Mektup: ${draft.data.address.receiverName}` : `Alıcı: ${draft.data.address.receiverName}`)
                                        : "İsimsiz Mektup"}
                                </h4>
                            </div>

                            <p className="text-sm text-ink leading-relaxed italic line-clamp-2 mb-4 flex-1">
                                "{previewText}"
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-wood/10">
                                <span className="text-xs font-bold text-ink-light bg-paper/50 px-3 py-1 rounded-md">
                                    {wordCount} Kelime
                                </span>
                                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-wood group-hover:text-seal transition-colors">
                                    Devam Et <ArrowRight size={14} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {draftToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => !isDeleting && setDraftToDelete(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-paper p-6 sm:p-8 rounded-2xl border border-wood/20 shadow-2xl max-w-sm w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-12 h-12 bg-red-100/50 rounded-full flex items-center justify-center mb-5 mx-auto">
                                <AlertTriangle size={24} className="text-red-600" />
                            </div>

                            <h3 className="text-xl font-playfair font-bold text-center text-wood-dark mb-2">
                                Taslağı Sil
                            </h3>
                            <p className="text-center text-ink-light text-sm mb-8 leading-relaxed">
                                Bu taslağı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDraftToDelete(null)}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold text-wood-dark bg-paper-dark hover:bg-wood/20 transition-colors disabled:opacity-50 text-sm"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Siliniyor...
                                        </>
                                    ) : (
                                        "Evet, Sil"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
