"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, Save, X, Loader2, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addFAQ, updateFAQ, deleteFAQ, seedFAQs } from "@/app/actions/faqActions";
import { toast } from "react-hot-toast";

interface FAQ {
    id: string;
    question: string;
    answer: string;
    order: number;
}

interface FAQClientProps {
    initialFaqs: FAQ[];
    isAdmin: boolean;
}

export default function FAQClient({ initialFaqs, isAdmin }: FAQClientProps) {
    const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs);
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        question: "",
        answer: "",
        order: 0
    });

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleAdd = async () => {
        if (!formData.question || !formData.answer) return;
        setIsSubmitting(true);
        const res = await addFAQ(formData.question, formData.answer, formData.order);
        setIsSubmitting(false);
        if (res.success) {
            toast.success("SSS eklendi!");
            setIsAdding(false);
            setFaqs([...faqs, res.data as FAQ].sort((a, b) => a.order - b.order));
            setFormData({ question: "", answer: "", order: 0 });
        } else {
            toast.error(res.error || "Hata oluştu.");
        }
    };

    const handleUpdate = async (id: string) => {
        setIsSubmitting(true);
        const res = await updateFAQ(id, formData.question, formData.answer, formData.order);
        setIsSubmitting(false);
        if (res.success) {
            toast.success("Güncellendi!");
            setIsEditing(null);
            setFaqs(faqs.map(f => f.id === id ? (res.data as FAQ) : f).sort((a, b) => a.order - b.order));
        } else {
            toast.error(res.error || "Hata oluştu.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;
        const res = await deleteFAQ(id);
        if (res.success) {
            toast.success("Silindi!");
            setFaqs(faqs.filter(f => f.id !== id));
        } else {
            toast.error(res.error || "Hata oluştu.");
        }
    };

    return (
        <div className="space-y-6 px-4 sm:px-0">
            {isAdmin && (
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => {
                            setIsAdding(true);
                            setFormData({ question: "", answer: "", order: faqs.length + 1 });
                        }}
                        className="flex items-center gap-2 bg-wood text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-wood-dark transition-all shadow-sm"
                    >
                        <Plus size={16} />
                        Yeni Soru Ekle
                    </button>
                </div>
            )}

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white border-2 border-wood/20 rounded-xl p-6 shadow-md space-y-4"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-ink">Yeni Soru Ekle</h3>
                            <button onClick={() => setIsAdding(false)} className="text-ink-light hover:text-ink"><X size={20} /></button>
                        </div>
                        <input
                            type="text"
                            placeholder="Soru"
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            className="w-full border border-wood/20 p-3 rounded-lg outline-none focus:border-wood"
                        />
                        <textarea
                            placeholder="Cevap"
                            value={formData.answer}
                            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                            className="w-full border border-wood/20 p-3 rounded-lg outline-none focus:border-wood min-h-[120px]"
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Sıra"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                className="w-24 border border-wood/20 p-3 rounded-lg outline-none focus:border-wood"
                            />
                            <button
                                onClick={handleAdd}
                                disabled={isSubmitting}
                                className="flex-1 bg-seal text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Kaydet
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div
                        key={faq.id}
                        className={`border ${isEditing === faq.id ? "border-wood" : "border-paper-dark"} rounded-lg overflow-hidden transition-all bg-paper-light`}
                    >
                        {isEditing === faq.id ? (
                            <div className="p-4 space-y-4 bg-white">
                                <input
                                    type="text"
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    className="w-full border border-wood/20 p-2 rounded-lg outline-none focus:border-wood text-sm font-bold"
                                />
                                <textarea
                                    value={formData.answer}
                                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                    className="w-full border border-wood/20 p-2 rounded-lg outline-none focus:border-wood text-sm min-h-[100px]"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="w-20 border border-wood/20 p-2 rounded-lg outline-none focus:border-wood text-sm"
                                    />
                                    <button
                                        onClick={() => handleUpdate(faq.id)}
                                        disabled={isSubmitting}
                                        className="bg-seal text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"
                                    >
                                        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        Güncelle
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(null)}
                                        className="bg-paper text-ink-light px-4 py-2 rounded-lg text-sm font-bold"
                                    >
                                        İptal
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between group">
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="flex-1 text-left px-6 py-4 flex items-center justify-between font-bold text-ink hover:text-wood transition-colors focus:outline-none focus:bg-paper-dark/10"
                                    >
                                        <span>{faq.question}</span>
                                        {openIndex === index ? (
                                            <ChevronUp size={20} className="text-wood flex-shrink-0" />
                                        ) : (
                                            <ChevronDown size={20} className="text-ink-light flex-shrink-0" />
                                        )}
                                    </button>
                                    {isAdmin && (
                                        <div className="flex items-center gap-1 pr-4 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsEditing(faq.id);
                                                    setFormData({
                                                        question: faq.question,
                                                        answer: faq.answer,
                                                        order: faq.order
                                                    });
                                                }}
                                                className="p-1.5 text-wood hover:bg-wood/10 rounded-md transition-colors"
                                                title="Düzenle"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(faq.id);
                                                }}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <AnimatePresence initial={false}>
                                    {openIndex === index && (
                                        <motion.div
                                            key="content"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 text-ink-light leading-relaxed">
                                                <div className="pt-2 border-t border-paper-dark whitespace-pre-wrap">
                                                    {faq.answer}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </div>
                ))}

                {faqs.length === 0 && !isAdding && (
                    <div className="text-center py-20 bg-paper-light border-2 border-dashed border-paper-dark rounded-xl">
                        <Database size={48} className="mx-auto text-paper-dark mb-4" />
                        <p className="text-ink-light">Henüz soru eklenmemiş.</p>
                        {isAdmin && <p className="text-xs text-ink-light mt-1">"Yeni Soru Ekle" butonu ile eklemeye başlayabilirsiniz.</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
