"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Mail, Home, PenLine, MessageSquare, Menu, HelpCircle, User, LogOut, X, LogIn, UserPlus, ShieldCheck, Gift, GitGraphIcon, Truck } from "lucide-react";
import { useLetterStore } from "@/store/letterStore";
import Image from "next/image";
import SignOutModal from "./SignOutModal";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
    const [adminMenus, setAdminMenus] = useState(false);
    const { data: session, status } = useSession();
    const resetStore = useLetterStore(state => state.resetStore);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    const handleAdminMenusClick = () => {
        setAdminMenus(!adminMenus);
    };

    const handleSignOutClick = () => {
        setIsSignOutModalOpen(true);
    };

    const handleConfirmSignOut = () => {
        signOut();
        setIsSignOutModalOpen(false);
        closeMenu();
    };

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
                    {(session?.user as any)?.role === "ADMIN" && (
                        <button onClick={handleAdminMenusClick} className="cursor-pointer text-paper/90 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all flex flex-col items-center">
                            <svg width="24" height="24" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
                                <path d="M983.727 5.421 1723.04 353.62c19.765 9.374 32.414 29.252 32.414 51.162v601.525c0 489.6-424.207 719.774-733.779 887.943l-34.899 18.975c-8.47 4.517-17.731 6.889-27.105 6.889-9.262 0-18.523-2.372-26.993-6.89l-34.9-18.974C588.095 1726.08 164 1495.906 164 1006.306V404.78c0-21.91 12.65-41.788 32.414-51.162L935.727 5.42c15.134-7.228 32.866-7.228 48 0ZM757.088 383.322c-176.075 0-319.285 143.323-319.285 319.398 0 176.075 143.21 319.285 319.285 319.285 1.92 0 3.84 0 5.76-.113l58.504 58.503h83.689v116.781h116.781v83.803l91.595 91.482h313.412V1059.05l-350.57-350.682c.114-1.807.114-3.727.114-5.647 0-176.075-143.21-319.398-319.285-319.398Zm0 112.942c113.732 0 206.344 92.724 205.327 216.62l-3.953 37.271 355.426 355.652v153.713h-153.713l-25.412-25.299v-149.986h-116.78v-116.78H868.108l-63.812-63.7-47.209 5.309c-113.732 0-206.344-92.5-206.344-206.344 0-113.732 92.612-206.456 206.344-206.456Zm4.98 124.98c-46.757 0-84.705 37.948-84.705 84.706s37.948 84.706 84.706 84.706c46.757 0 84.706-37.948 84.706-84.706s-37.949-84.706-84.706-84.706Z" fill-rule="evenodd" />
                            </svg>
                        </button>
                    )}
                    {adminMenus ? (
                        <>
                            <Link href="/admin/mektuplar" onClick={resetStore} className="flex items-center gap-1.5 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                                <PenLine size={18} />
                                <span>Mektuplar</span>
                            </Link>
                            <Link href="/admin/gifts" className="flex items-center gap-1.5 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                                <Gift size={18} />
                                <span>Hediyeler</span>
                            </Link>
                            <Link href="/yorumlar" className="flex items-center gap-1.5 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                                <GitGraphIcon size={18} />
                                <span>Analizler</span>
                            </Link>
                            {/* <Link href="/sss" className="flex items-center gap-1.5 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                                <HelpCircle size={18} />
                                <span>SIKÇA SORULAN SORULAR</span>
                            </Link> */}
                        </>
                    ) :
                        (
                            <>
                                <Link href="/" className="flex items-center gap-1.5 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                                    <Home size={18} />
                                    <span>ANASAYFA</span>
                                </Link>
                                <Link href={status === "unauthenticated" ? "/auth/login" : "/mektup-yaz"} onClick={resetStore} className="flex items-center gap-1.5 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                                    <PenLine size={18} />
                                    <span>MEKTUP YAZ</span>
                                </Link>
                                {/* {status === "authenticated" && (
                                    <Link href="/gonderilenler" className="flex items-center gap-1.5 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                                        <Truck size={18} />
                                        <span>GÖNDERİLENLER</span>
                                    </Link>
                                )} */}
                                <Link href="/yorumlar" className="flex items-center gap-1.5 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                                    <MessageSquare size={18} />
                                    <span>YORUMLAR</span>
                                </Link>
                                <Link href="/sss" className="flex items-center gap-1.5 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                                    <HelpCircle size={18} />
                                    <span>SIKÇA SORULAN SORULAR</span>
                                </Link>
                            </>)}

                </nav>

                {/* Desktop User Actions */}
                <div className="hidden md:flex items-center gap-3 shrink-0">
                    {status === "authenticated" ? (
                        <>
                            <Link href="/" className="flex items-center gap-2 bg-paper/10 backdrop-blur-md text-paper border border-paper/20 hover:border-paper/40 hover:bg-paper/20 px-4 py-2 rounded-md font-bold text-[13px] transition-all shadow-sm">
                                <User size={16} />
                                <span>{session.user?.name || "Profilim"}</span>
                            </Link>
                            {(session.user as any)?.role === "ADMIN" ? (
                                <Link href="/admin/mektuplar" className="flex items-center gap-2 bg-seal/10 backdrop-blur-md text-seal border border-seal/20 hover:border-seal/40 hover:bg-seal/20 px-4 py-2 rounded-md font-bold text-[13px] transition-all shadow-sm">
                                    <ShieldCheck size={16} />
                                    <span>Admin Paneli</span>
                                </Link>
                            ) : (
                                <button
                                    onClick={handleSignOutClick}
                                    className="flex items-center gap-2 bg-paper/10 backdrop-blur-md text-paper border border-paper/20 hover:border-paper/40 hover:bg-paper/20 px-4 py-2 rounded-md font-bold text-[13px] transition-all shadow-sm"
                                >
                                    <LogOut size={16} />
                                    <span>Çıkış</span>
                                </button>

                            )}


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
                        {adminMenus ? (
                            <>
                                <Link href="/admin/mektuplar" onClick={() => { resetStore(); closeMenu(); }} className="flex items-center gap-4 py-2 border-b border-paper/10 hover:text-white">
                                    <PenLine size={22} />
                                    <span>Mektuplar</span>
                                </Link>
                                <Link href="/admin/gifts" onClick={closeMenu} className="flex items-center gap-4 py-2 border-b border-paper/10 hover:text-white">
                                    <Gift size={22} />
                                    <span>Hediyeler</span>
                                </Link>
                                <Link href="/yorumlar" onClick={closeMenu} className="flex items-center gap-4 py-2 border-b border-paper/10 hover:text-white">
                                    <GitGraphIcon size={22} />
                                    <span>Analizler</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/" onClick={closeMenu} className="flex items-center gap-4 py-2 border-b border-paper/10 hover:text-white">
                                    <Home size={22} />
                                    <span>ANASAYFA</span>
                                </Link>
                                <Link href={status === "unauthenticated" ? "/auth/login" : "/mektup-yaz"} onClick={() => { resetStore(); closeMenu(); }} className="flex items-center gap-4 py-2 border-b border-paper/10 hover:text-white">
                                    <PenLine size={22} />
                                    <span>MEKTUP YAZ</span>
                                </Link>
                                {status === "authenticated" && (
                                    <Link href="/gonderilenler" onClick={closeMenu} className="flex items-center gap-4 py-2 border-b border-paper/10 hover:text-white">
                                        <Truck size={22} />
                                        <span>GÖNDERİLENLER</span>
                                    </Link>
                                )}
                                <Link href="/yorumlar" onClick={closeMenu} className="flex items-center gap-4 py-2 border-b border-paper/10 hover:text-white">
                                    <MessageSquare size={22} />
                                    <span>YORUMLAR</span>
                                </Link>
                                <Link href="/sss" onClick={closeMenu} className="flex items-center gap-4 py-2 border-b border-paper/10 hover:text-white">
                                    <HelpCircle size={22} />
                                    <span>SIKÇA SORULAN SORULAR</span>
                                </Link>
                            </>
                        )}
                        {(session?.user as any)?.role === "ADMIN" && (
                            <button onClick={handleAdminMenusClick} className="cursor-pointer text-paper/90 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all flex flex-col items-center">
                                <svg fill="#000000" width="24" height="24" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M983.727 5.421 1723.04 353.62c19.765 9.374 32.414 29.252 32.414 51.162v601.525c0 489.6-424.207 719.774-733.779 887.943l-34.899 18.975c-8.47 4.517-17.731 6.889-27.105 6.889-9.262 0-18.523-2.372-26.993-6.89l-34.9-18.974C588.095 1726.08 164 1495.906 164 1006.306V404.78c0-21.91 12.65-41.788 32.414-51.162L935.727 5.42c15.134-7.228 32.866-7.228 48 0ZM757.088 383.322c-176.075 0-319.285 143.323-319.285 319.398 0 176.075 143.21 319.285 319.285 319.285 1.92 0 3.84 0 5.76-.113l58.504 58.503h83.689v116.781h116.781v83.803l91.595 91.482h313.412V1059.05l-350.57-350.682c.114-1.807.114-3.727.114-5.647 0-176.075-143.21-319.398-319.285-319.398Zm0 112.942c113.732 0 206.344 92.724 205.327 216.62l-3.953 37.271 355.426 355.652v153.713h-153.713l-25.412-25.299v-149.986h-116.78v-116.78H868.108l-63.812-63.7-47.209 5.309c-113.732 0-206.344-92.5-206.344-206.344 0-113.732 92.612-206.456 206.344-206.456Zm4.98 124.98c-46.757 0-84.705 37.948-84.705 84.706s37.948 84.706 84.706 84.706c46.757 0 84.706-37.948 84.706-84.706s-37.949-84.706-84.706-84.706Z" fill-rule="evenodd" />
                                </svg>
                                <span>Admin Menüleri</span>
                            </button>
                        )}

                        <div className="mt-4 flex flex-col gap-4">
                            {status === "authenticated" ? (
                                <>
                                    {(session.user as any)?.role === "ADMIN" && (
                                        <Link href="/admin/mektuplar" onClick={closeMenu} className="flex items-center justify-center gap-2 bg-seal/10 text-seal border border-seal/20 px-6 py-4 rounded-xl font-bold transition-all shadow-sm">
                                            <ShieldCheck size={20} />
                                            <span>Admin Paneli</span>
                                        </Link>
                                    )}
                                    <Link href="/" onClick={closeMenu} className="flex items-center justify-center gap-2 bg-paper/10 text-paper border border-paper/20 px-6 py-4 rounded-xl font-bold transition-all shadow-sm">
                                        <User size={20} />
                                        <span>{session.user?.name || "Profilim"}</span>
                                    </Link>
                                    <button
                                        onClick={handleSignOutClick}
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
                </div>
            )}

            <SignOutModal
                isOpen={isSignOutModalOpen}
                onClose={() => setIsSignOutModalOpen(false)}
                onConfirm={handleConfirmSignOut}
            />
        </header>
    );
};

export default Navbar;
