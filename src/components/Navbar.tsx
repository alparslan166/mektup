"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Mail, Home, PenLine, MessageSquare, Menu, HelpCircle, User, LogOut, X, LogIn, UserPlus } from "lucide-react";
import { useLetterStore } from "@/store/letterStore";
import Image from "next/image";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session, status } = useSession();
    const resetStore = useLetterStore(state => state.resetStore);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <header className="bg-transparent border-b border-paper/10 py-3 w-full z-50 relative">
            <div className="container mx-auto px-6 max-w-7xl flex justify-between items-center gap-4">
                {/* Logo */}
                <Link href="/" onClick={closeMenu} className="flex flex-col hover:opacity-90 transition-opacity shrink-0">
                    <div className="flex items-center gap-1">
                        <div className="text-paper p-1.5 rounded-sm">
                            <Image src="/images/kus-logo.png" alt="Logo" width={40} height={40} />
                        </div>
                        <h1 className="font-playfair text-2xl lg:text-3xl font-bold tracking-widest text-paper drop-shadow-md">Mektuplaş</h1>
                    </div>
                    <span className="text-[10px] lg:text-[12px] font-semibold tracking-widest text-paper/70 mt-1 italic drop-shadow-sm">&quot;Söz kulağa, yazı uzağa gider...&quot;</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="text-[11px] lg:text-[13px] font-bold tracking-wider text-paper/90 gap-4 lg:gap-8 hidden md:flex items-center flex-1 justify-center">
                    <Link href="/" className="flex items-center gap-1.5 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                        <Home size={18} />
                        <span>ANASAYFA</span>
                    </Link>
                    <Link href="/mektup-yaz" onClick={resetStore} className="flex items-center gap-1.5 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                        <PenLine size={18} />
                        <span>MEKTUP YAZ</span>
                    </Link>
                    <Link href="/yorumlar" className="flex items-center gap-1.5 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                        <MessageSquare size={18} />
                        <span>YORUMLAR</span>
                    </Link>
                    <Link href="/sss" className="flex items-center gap-1.5 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                        <HelpCircle size={18} />
                        <span>SIKÇA SORULAN SORULAR</span>
                    </Link>
                </nav>

                {/* Desktop User Actions */}
                <div className="hidden md:flex items-center gap-3 shrink-0">
                    {status === "authenticated" ? (
                        <>
                            <Link href="/profil" className="flex items-center gap-2 bg-paper/10 backdrop-blur-md text-paper border border-paper/20 hover:border-paper/40 hover:bg-paper/20 px-4 py-2 rounded-md font-bold text-[13px] transition-all shadow-sm">
                                <User size={16} />
                                <span>{session.user?.name || "Profilim"}</span>
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="flex items-center gap-2 bg-paper/10 backdrop-blur-md text-paper border border-paper/20 hover:border-paper/40 hover:bg-paper/20 px-4 py-2 rounded-md font-bold text-[13px] transition-all shadow-sm"
                            >
                                <LogOut size={16} />
                                <span>Çıkış</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/login" className="flex items-center gap-2 bg-paper text-wood-dark border border-paper hover:bg-paper/90 px-4 py-2 rounded-md font-bold text-[13px] transition-all shadow-md">
                                <LogIn size={16} />
                                <span>Giriş Yap</span>
                            </Link>
                            <Link href="/auth/register" className="flex items-center gap-2 bg-seal text-paper border border-seal hover:bg-seal-hover px-4 py-2 rounded-md font-bold text-[13px] transition-all shadow-md">
                                <UserPlus size={16} />
                                <span>Kayıt Ol</span>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden text-paper p-2 hover:bg-paper/10 rounded-md transition-colors shrink-0 z-50"
                >
                    {isOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-[#1c1917]/95 backdrop-blur-lg z-40 md:hidden flex flex-col pt-24 px-8 overflow-y-auto animate-in fade-in slide-in-from-top duration-300">
                    <nav className="flex flex-col gap-6 text-paper text-lg font-bold tracking-widest">
                        <Link href="/" onClick={closeMenu} className="flex items-center gap-4 py-2 border-b border-paper/10 hover:text-white">
                            <Home size={22} />
                            <span>ANASAYFA</span>
                        </Link>
                        <Link href="/mektup-yaz" onClick={() => { resetStore(); closeMenu(); }} className="flex items-center gap-4 py-2 border-b border-paper/10 hover:text-white">
                            <PenLine size={22} />
                            <span>MEKTUP YAZ</span>
                        </Link>
                        <Link href="/yorumlar" onClick={closeMenu} className="flex items-center gap-4 py-2 border-b border-paper/10 hover:text-white">
                            <MessageSquare size={22} />
                            <span>YORUMLAR</span>
                        </Link>
                        <Link href="/sss" onClick={closeMenu} className="flex items-center gap-4 py-2 border-b border-paper/10 hover:text-white">
                            <HelpCircle size={22} />
                            <span>SIKÇA SORULAN SORULAR</span>
                        </Link>

                        <div className="mt-4 flex flex-col gap-4">
                            {status === "authenticated" ? (
                                <>
                                    <Link href="/profil" onClick={closeMenu} className="flex items-center justify-center gap-2 bg-paper/10 text-paper border border-paper/20 px-6 py-4 rounded-xl font-bold transition-all shadow-sm">
                                        <User size={20} />
                                        <span>{session.user?.name || "Profilim"}</span>
                                    </Link>
                                    <button
                                        onClick={() => { signOut(); closeMenu(); }}
                                        className="flex items-center justify-center gap-2 bg-paper/10 text-paper border border-paper/20 px-6 py-4 rounded-xl font-bold transition-all shadow-sm"
                                    >
                                        <LogOut size={20} />
                                        <span>Çıkış</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/login" onClick={closeMenu} className="flex items-center justify-center gap-2 bg-paper text-wood-dark border border-paper px-6 py-4 rounded-xl font-bold transition-all shadow-md">
                                        <LogIn size={20} />
                                        <span>Giriş Yap</span>
                                    </Link>
                                    <Link href="/auth/register" onClick={closeMenu} className="flex items-center justify-center gap-2 bg-seal text-paper border border-seal px-6 py-4 rounded-xl font-bold transition-all shadow-md">
                                        <UserPlus size={20} />
                                        <span>Kayıt Ol</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>

                    <div className="mt-auto mb-12 text-center">
                        <p className="font-playfair text-paper/40 text-sm italic">&quot;Söz Uçar, Mektuplaş Kalır.&quot;</p>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
