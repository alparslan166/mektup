"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    color: string; // e.g., 'seal', 'wood', 'ink'
    delay?: number;
    onClick?: () => void;
}

export default function DashboardCard({ title, description, icon: Icon, href, color, delay = 0, onClick }: DashboardCardProps) {
    const colorClasses: Record<string, string> = {
        seal: "border-seal/20 bg-[#f3ead1]/95",
        wood: "border-wood/20 bg-[#f3ead1]/95",
        ink: "border-ink/20 bg-[#f3ead1]/95",
        paper: "border-paper-dark/30 bg-[#f3ead1]/95",
        gold: "border-yellow-600/20 bg-[#f3ead1]/95",
    };

    const iconBgClasses: Record<string, string> = {
        seal: "bg-seal/10 text-seal",
        wood: "bg-wood/10 text-wood-dark",
        ink: "bg-ink/10 text-ink",
        paper: "bg-paper-dark text-wood-dark",
        gold: "bg-yellow-500/10 text-yellow-700",
    };

    const accentBorderClasses: Record<string, string> = {
        seal: "bg-seal",
        wood: "bg-wood",
        ink: "bg-ink",
        paper: "bg-wood/40",
        gold: "bg-yellow-600",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="h-full"
        >
            <Link href={href} onClick={onClick} className="group block h-full">
                <div className={`h-full min-h-[160px] p-4 sm:p-8 rounded-2xl border-2 transition-all duration-300 group-hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md shadow-xl ${colorClasses[color]} flex flex-col items-center justify-center text-center relative overflow-hidden`}>
                    {/* Top Accent Bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 sm:h-1.5 ${accentBorderClasses[color]}`} />

                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${iconBgClasses[color]} shadow-sm`}>
                        <Icon size={20} className="sm:hidden" />
                        <Icon size={28} className="hidden sm:block" />
                    </div>

                    <h3 className="font-playfair text-base sm:text-2xl font-bold mb-1.5 sm:mb-3 tracking-tight text-wood-dark capitalize px-1 leading-tight">
                        {title}
                    </h3>

                    <p className="text-[11px] sm:text-[15px] text-ink font-medium leading-tight sm:leading-relaxed opacity-90 px-1">
                        {description}
                    </p>

                    <div className={`mt-3 sm:mt-auto pt-2 sm:pt-6 opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-1 ${iconBgClasses[color].split(' ')[1]}`}>
                        <span className="hidden sm:inline">Devam Et</span> <span className="text-lg">→</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
