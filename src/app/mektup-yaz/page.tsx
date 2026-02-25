"use client";

import React from "react";
import Link from "next/link";
import { Bird, Hourglass, Plane, Heart, Mail } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLetterStore } from "@/store/letterStore";


export default function CategorySelection() {
  const router = useRouter();
  const updateAddress = useLetterStore(state => state.updateAddress);

  const categories = [
    {
      id: "cezaevi",
      title: "Cezaevine Mektup",
      icon: <Image src="/images/kus-logo.png" alt="Logo" width={60} height={60} />,
      color: "border-cyan-600/20 hover:border-cyan-600",
      textColor: "text-cyan-600",
      bg: "bg-cyan-600/5",
      href: "/mektup-yaz/akisi"
    },
    {
      id: "gelecek",
      title: "Geleceğe Mektup",
      icon: <Hourglass className="text-yellow-600 mb-2" size={48} />,
      color: "border-yellow-600/20 hover:border-yellow-600",
      textColor: "text-yellow-600",
      bg: "bg-yellow-600/5",
      href: "/mektup-yaz/akisi"
    },
    {
      id: "asker",
      title: "Askere Mektup",
      icon: <Plane className="text-green-600 mb-2" size={48} />,
      color: "border-green-600/20 hover:border-green-600",
      textColor: "text-green-600",
      bg: "bg-green-600/5",
      href: "/mektup-yaz/akisi"
    },
    {
      id: "sevgili",
      title: "Sevgiliye Mektup",
      icon: <Heart className="text-red-700 mb-2" size={48} />,
      color: "border-red-700/20 hover:border-red-700",
      textColor: "text-red-700",
      bg: "bg-red-700/5",
      href: "/mektup-yaz/akisi"
    },
    {
      id: "normal",
      title: "Normal Mektup",
      icon: <Mail className="text-stone-600 mb-2" size={48} />,
      color: "border-stone-600/20 hover:border-stone-600",
      textColor: "text-stone-600",
      bg: "bg-stone-600/5",
      href: "/mektup-yaz/akisi"
    }
  ];

  const handleCategorySelect = (id: string, href: string) => {
    updateAddress({ isPrison: id === "cezaevi" });
    router.push(href);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl flex-1 flex flex-col justify-center animate-in fade-in duration-500">
      <h1 className="font-playfair text-4xl md:text-5xl font-bold text-center text-paper mb-4 drop-shadow-lg">
        Mektup Yaz, Kolayca Gönder!
      </h1>
      <p className="text-paper/80 text-center mb-16 max-w-2xl mx-auto text-lg md:text-xl font-light">
        Kime mektup göndermek istiyorsunuz? Kategorinizi seçin, biz sizin için her şeyi halledelim.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center max-w-5xl mx-auto">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cat.id === "normal" ? "md:col-span-2 flex justify-center" : "w-full"}
          >
            <button
              onClick={() => handleCategorySelect(cat.id, cat.href)}
              className={`flex items-center gap-6 p-10 bg-paper/10 backdrop-blur-md border border-paper/20 rounded-3xl shadow-2xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden text-left ${cat.id === "normal" ? "w-full md:max-w-2xl" : "w-full"}`}
            >
              <div className={`absolute top-0 right-0 w-48 h-48 ${cat.bg} rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-150 transition-transform duration-500`}></div>

              <div className="relative z-10 p-5 bg-paper/5 backdrop-blur-sm border border-paper/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                {cat.icon}
              </div>

              <div className="relative z-10 flex-1">
                <h3 className={`font-playfair text-3xl font-bold ${cat.textColor} brightness-150 drop-shadow-md group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all`}>
                  {cat.title}
                </h3>
                <p className="text-paper/90 text-lg mt-2 font-medium">Hemen yazmaya başla</p>
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
