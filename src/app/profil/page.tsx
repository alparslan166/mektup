import React from "react";
import { User, Settings, Package, Heart } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    return (
        <main className="min-h-screen pt-24 pb-20 px-6 bg-paper-light">
            <div className="container mx-auto max-w-4xl">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-paper-dark">
                    {/* Cover / Header */}
                    <div className="h-32 bg-seal/10 relative">
                        <div className="absolute -bottom-16 left-8">
                            <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-lg border border-paper-dark">
                                <div className="w-full h-full rounded-xl bg-paper-dark flex items-center justify-center text-wood">
                                    <User size={64} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="pt-20 pb-8 px-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-playfair font-bold text-ink">{session.user?.name || "Kullanıcı"}</h1>
                                <p className="text-ink-light">{session.user?.email}</p>
                            </div>
                            <button className="flex items-center gap-2 bg-paper-dark text-wood px-4 py-2 rounded-lg font-bold hover:bg-paper duration-300">
                                <Settings size={18} />
                                <span>Profili Düzenle</span>
                            </button>
                        </div>

                        {/* Stats / Tabs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                            <div className="bg-paper-light p-6 rounded-2xl border border-paper-dark text-center space-y-2">
                                <div className="w-12 h-12 bg-seal/10 rounded-full flex items-center justify-center mx-auto text-seal">
                                    <Package size={24} />
                                </div>
                                <div className="text-2xl font-black text-ink">0</div>
                                <div className="text-sm font-bold text-ink-light uppercase tracking-widest">Siparişlerim</div>
                            </div>
                            <div className="bg-paper-light p-6 rounded-2xl border border-paper-dark text-center space-y-2">
                                <div className="w-12 h-12 bg-seal/10 rounded-full flex items-center justify-center mx-auto text-seal">
                                    <Heart size={24} />
                                </div>
                                <div className="text-2xl font-black text-ink">0</div>
                                <div className="text-sm font-bold text-ink-light uppercase tracking-widest">Favorilerim</div>
                            </div>
                            <div className="bg-paper-light p-6 rounded-2xl border border-paper-dark text-center space-y-2">
                                <div className="w-12 h-12 bg-seal/10 rounded-full flex items-center justify-center mx-auto text-seal">
                                    <User size={24} />
                                </div>
                                <div className="text-2xl font-black text-ink">0</div>
                                <div className="text-sm font-bold text-ink-light uppercase tracking-widest">Adreslerim</div>
                            </div>
                        </div>

                        {/* Empty State */}
                        <div className="mt-12 py-20 text-center border-2 border-dashed border-paper-dark rounded-3xl">
                            <p className="text-ink-light italic">Henüz bir aktivite bulunmuyor.</p>
                            <a href="/hediyeler" className="text-seal font-bold mt-4 inline-block hover:underline">Hemen alışverişe başla &rarr;</a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
