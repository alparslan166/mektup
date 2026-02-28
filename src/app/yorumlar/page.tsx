"use client";

import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Reply, ArrowLeft, Loader2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { getComments, createComment, replyToComment, deleteComment } from '@/app/actions/commentActions';
import { getPricingSettings } from '@/app/actions/settingsActions';
import { toast } from 'react-hot-toast';

export default function YorumlarPage() {
    const { data: session } = useSession();
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [comments, setComments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rewardAmount, setRewardAmount] = useState(50);

    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyBody, setReplyBody] = useState("");
    const [isReplySubmitting, setIsReplySubmitting] = useState(false);
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [isMounted, setIsMounted] = useState(false);

    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const [commentRes, settingsRes] = await Promise.all([
            getComments(),
            getPricingSettings()
        ]);

        if (commentRes.success) {
            setComments(commentRes.data || []);
        }
        if (settingsRes.success && settingsRes.data) {
            setRewardAmount(settingsRes.data.commentRewardAmount);
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            toast.error("Yorum yapmak için giriş yapmalısınız.");
            return;
        }
        if (!body.trim()) {
            toast.error("Lütfen bir yorum yazın.");
            return;
        }

        setIsSubmitting(true);
        const res = await createComment({ title, body, rating });
        if (res.success) {
            toast.success("Yorumunuz başarıyla gönderildi.");
            if (res.rewardApplied) {
                toast.success(`${res.rewardAmount} Kredi ödül hesabınıza tanımlandı! 🪙`, { duration: 5000 });
            }
            setBody("");
            setTitle("");
            setRating(5);
            fetchData(); // Refresh comments
        } else {
            toast.error(res.error || "Yorum gönderilemedi.");
        }
        setIsSubmitting(false);
    };

    const handleReply = async (parentId: string) => {
        if (!session) {
            toast.error("Yanıt vermek için giriş yapmalısınız.");
            return;
        }
        if (!replyBody.trim()) {
            toast.error("Lütfen bir yanıt yazın.");
            return;
        }

        setIsReplySubmitting(true);
        const res = await replyToComment({ parentId, body: replyBody });
        if (res.success) {
            toast.success("Yanıtınız gönderildi.");
            setReplyBody("");
            setReplyingTo(null);
            fetchData();
        } else {
            toast.error(res.error || "Yanıt gönderilemedi.");
        }
        setIsReplySubmitting(false);
    };

    const toggleReplies = (commentId: string) => {
        setExpandedComments(prev => {
            const next = new Set(prev);
            if (next.has(commentId)) {
                next.delete(commentId);
            } else {
                next.add(commentId);
            }
            return next;
        });
    };

    const averageRating = comments.length > 0
        ? (comments.reduce((acc, curr) => acc + curr.rating, 0) / comments.length).toFixed(1)
        : "5.0";

    const totalCommentsCount = comments.reduce((acc, curr) => acc + 1 + (curr.replies?.length || 0), 0);

    const handleDelete = async () => {
        if (!commentToDelete) return;

        setIsDeleting(true);
        const res = await deleteComment(commentToDelete);
        if (res.success) {
            toast.success("Yorum silindi.");
            setCommentToDelete(null);
            fetchData();
        } else {
            toast.error(res.error || "Yorum silinemedi.");
        }
        setIsDeleting(false);
    };

    const isAdmin = (session?.user as any)?.role === "ADMIN";

    const getAvatarColor = (email: string) => {
        const colors = [
            'bg-blue-100 text-blue-700',
            'bg-emerald-100 text-emerald-700',
            'bg-rose-100 text-rose-700',
            'bg-amber-100 text-amber-700',
            'bg-indigo-100 text-indigo-700',
            'bg-violet-100 text-violet-700',
            'bg-cyan-100 text-cyan-700',
            'bg-orange-100 text-orange-700'
        ];
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
            hash = email.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const getInitials = (user: any) => {
        if (user.name) {
            return user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
        }
        return user.email?.substring(0, 2).toUpperCase() || '?';
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl flex-1 flex flex-col">
            <Link href="/" className="inline-flex items-center gap-2 text-ink-light hover:text-ink transition-colors mb-6 w-fit bg-paper/60 px-4 py-2 rounded-full backdrop-blur-sm border border-wood/10 shadow-sm">
                <ArrowLeft size={16} />
                <span className="font-medium text-sm">Ana Sayfaya Dön</span>
            </Link>

            <div className="bg-paper shadow-md border border-paper-dark rounded-xl p-8 sm:p-12 relative overflow-hidden mb-12">
                <div className="absolute top-0 left-0 w-64 h-64 bg-wood/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none"></div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    {/* Left Score Section */}
                    <div className="md:col-span-5 lg:col-span-4 flex flex-col items-center text-center">
                        <h2 className="text-wood font-playfair font-bold text-xl mb-6 uppercase tracking-widest drop-shadow-sm">Ortalama Puan</h2>

                        <div className="border border-wood/50 border-dashed rounded-lg p-8 w-full flex flex-col items-center justify-center bg-paper-light/50 relative shadow-inner">
                            <div className="absolute top-0 right-0 left-0 bottom-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #8b5a2b 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.1 }}></div>

                            <div className="text-5xl font-playfair font-bold text-ink mb-4 relative z-10">{averageRating.replace('.', ',')}</div>
                            <div className="flex text-wood mb-3 relative z-10">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={24} fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} strokeWidth={1} />
                                ))}
                            </div>
                            <div className="text-sm font-bold text-ink-light relative z-10">Toplam : <span className="text-ink">{totalCommentsCount} Yorum</span></div>
                        </div>

                        <p className="mt-6 text-sm text-ink-light leading-relaxed">
                            Bu sayfada kullanıcılarımızın Mektuplaş hakkındaki yorumlarını okuyabilir veya yeni yorum yazabilirsiniz.
                            <br />
                            <span className="text-emerald-600 font-bold mt-2 block">İlk yorumunuza {rewardAmount} Kredi hediye! 🪙</span>
                        </p>
                    </div>

                    {/* Right Form Section */}
                    <div className="md:col-span-7 lg:col-span-8 flex flex-col">
                        <div className="mb-8 p-4 bg-[#effdf4] border border-[#bbf7d0] rounded-lg">
                            <p className="text-ink font-medium text-[13px] mb-2">Soru ve sorunlarınızı lütfen WhatsApp hattımıza yazınız.</p>
                            <a href="https://wa.me/908503058135" className="inline-flex items-center text-[#166534] hover:text-[#14532d] font-bold text-[15px] transition-colors">
                                <MessageCircle size={18} className="mr-2" /> WhatsApp Yardım ( +90 850 305 81 35 )
                            </a>
                        </div>

                        {!session ? (
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-paper-dark rounded-xl bg-paper-light/30">
                                <p className="text-ink-light font-medium mb-4">Yorum yazmak için giriş yapmalısınız.</p>
                                <Link href="/api/auth/signin" className="bg-wood hover:bg-wood-dark text-paper font-bold py-2.5 px-8 rounded-md transition-colors shadow-sm text-sm">
                                    Giriş Yap
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[13px] font-bold text-ink">Puanınız (1-5) :</span>
                                    <div className="flex gap-1 cursor-pointer">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <motion.div
                                                key={star}
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <Star
                                                    size={20}
                                                    fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
                                                    className={(hoverRating || rating) >= star ? "text-wood" : "text-ink-light"}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setRating(star)}
                                                    strokeWidth={1.5}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <input
                                        type="text"
                                        placeholder="Yorum Başlığınız"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-paper-light text-ink placeholder:text-ink-light/70 px-4 py-3.5 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all text-sm font-medium"
                                    />
                                    <textarea
                                        rows={4}
                                        placeholder="Yorumunuzu buraya yazınız."
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        className="w-full bg-paper-light text-ink placeholder:text-ink-light/70 px-4 py-3.5 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all resize-none text-sm font-medium"
                                    ></textarea>

                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="bg-wood hover:bg-wood-dark text-paper font-bold py-2.5 px-8 rounded-md transition-colors shadow-sm text-sm tracking-wide disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                            Gönder
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Comments List */}
            <div className="flex flex-col gap-8">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-10 h-10 animate-spin text-wood/40" />
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {isMounted && comments.map((comment, index) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 22,
                                    delay: 1
                                }}
                                className="flex flex-col gap-4"
                            >
                                <div className="flex flex-col sm:flex-row gap-4 align-start">
                                    {/* Avatar and Info */}
                                    <div className="flex flex-col items-center justify-center p-4 w-full sm:w-28 shrink-0 bg-paper shadow-sm border border-paper-dark rounded-xl h-fit">
                                        <div className={`w-12 h-12 rounded-full border border-wood/20 flex items-center justify-center font-playfair font-bold text-lg mb-2 shadow-inner overflow-hidden ${getAvatarColor(comment.user.email || 'guest')}`}>
                                            {getInitials(comment.user)}
                                        </div>
                                        <div className="flex text-wood mb-1.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={10} fill={i < comment.rating ? "currentColor" : "none"} className={i < comment.rating ? "text-wood" : "text-ink-light"} strokeWidth={1.5} />
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-ink-light font-medium text-center">
                                            {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>

                                    {/* Comment Content */}
                                    <div className="flex-1 bg-paper shadow-sm border border-paper-dark rounded-xl p-5 sm:p-6 relative group flex flex-col justify-start">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-playfair italic font-bold text-lg text-wood-dark">{comment.title || "Deneyim Paylaşımı"}</h4>
                                            <div className="flex items-center gap-3">
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => setCommentToDelete(comment.id)}
                                                        className="text-red-400 hover:text-red-600 transition-colors p-1"
                                                        title="Yorumu Sil"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                    className="text-ink-light hover:text-wood transition-colors flex items-center gap-1.5 text-xs font-bold"
                                                >
                                                    <Reply size={14} />
                                                    Yanıtla
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-ink leading-relaxed text-[15px] mb-4">
                                            {comment.body}
                                        </p>

                                        {/* Show/Hide Replies Toggle */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="flex justify-end mt-4">
                                                <button
                                                    onClick={() => toggleReplies(comment.id)}
                                                    className="text-[11px] font-bold text-wood hover:text-wood-dark transition-colors flex items-center gap-1.5 bg-wood/5 px-4 py-2 rounded-full border border-wood/10 outline-none"
                                                >
                                                    {expandedComments.has(comment.id) ? (
                                                        <>Yanıtları Gizle <ChevronUp size={14} /></>
                                                    ) : (
                                                        <>Yanıtları Göster ({comment.replies.length}) <ChevronDown size={14} /></>
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {/* Replies Display */}
                                        <AnimatePresence>
                                            {comment.replies && comment.replies.length > 0 && expandedComments.has(comment.id) && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="overflow-hidden border-t border-paper-dark pt-4"
                                                >
                                                    <div className="space-y-4">
                                                        {comment.replies.map((reply: any) => (
                                                            <div key={reply.id} className="flex gap-3 bg-paper-light/50 p-3 rounded-lg border border-paper-dark/30">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border border-paper-dark/50 ${getAvatarColor(reply.user.email || 'guest')}`}>
                                                                    {getInitials(reply.user)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs font-bold text-ink">{reply.user.name}</span>
                                                                            {isAdmin && (
                                                                                <button
                                                                                    onClick={() => setCommentToDelete(reply.id)}
                                                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                                                >
                                                                                    <Trash2 size={12} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-[10px] text-ink-light">{new Date(reply.createdAt).toLocaleDateString('tr-TR')}</span>
                                                                    </div>
                                                                    <p className="text-sm text-ink-light leading-snug">{reply.body}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Reply Input Area */}
                                        <AnimatePresence>
                                            {replyingTo === comment.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden mt-4 pt-4 border-t border-paper-dark"
                                                >
                                                    <textarea
                                                        rows={3}
                                                        placeholder={`${comment.user.name} kişisine yanıt yazın...`}
                                                        value={replyBody}
                                                        onChange={(e) => setReplyBody(e.target.value)}
                                                        className="w-full bg-paper-light text-ink placeholder:text-ink-light/70 px-4 py-3 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all resize-none text-sm font-medium mb-3"
                                                        autoFocus
                                                    ></textarea>
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setReplyingTo(null)}
                                                            className="px-4 py-2 rounded-md font-bold text-xs text-ink-light hover:bg-paper-dark transition-colors"
                                                        >
                                                            İptal
                                                        </button>
                                                        <button
                                                            onClick={() => handleReply(comment.id)}
                                                            disabled={isReplySubmitting}
                                                            className="bg-wood hover:bg-wood-dark text-paper px-4 py-2 rounded-md font-bold text-xs shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                                                        >
                                                            {isReplySubmitting && <Loader2 size={12} className="animate-spin" />}
                                                            Yanıtı Gönder
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {commentToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-paper border border-wood/20 rounded-2xl p-8 max-w-sm w-full shadow-2xl"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                                    <Trash2 size={32} />
                                </div>
                                <h3 className="text-xl font-playfair font-bold text-ink mb-2">Yorumu Sil</h3>
                                <p className="text-sm text-ink-light mb-8 italic">
                                    Bu yorumu ve varsa tüm yanıtlarını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                                </p>
                                <div className="flex w-full gap-3">
                                    <button
                                        onClick={() => setCommentToDelete(null)}
                                        className="flex-1 px-4 py-3 rounded-xl border border-wood/10 font-bold text-sm text-ink-light hover:bg-paper-dark transition-colors"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-50"
                                    >
                                        {isDeleting && <Loader2 size={16} className="animate-spin" />}
                                        Evet, Sil
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
