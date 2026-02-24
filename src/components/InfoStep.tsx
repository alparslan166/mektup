"use client";

import React from "react";
import Stepper from "@/components/Stepper";
import { useLetterStore } from "@/store/letterStore";
import { ArrowLeft, ArrowRight, User, Phone } from "lucide-react";

export default function InfoStep() {
    const address = useLetterStore(state => state.address);
    const updateAddress = useLetterStore(state => state.updateAddress);

    return (
        <div className="bg-paper shadow-sm border border-paper-dark rounded-xl p-6 sm:p-10 flex-col flex relative overflow-hidden">
            {/* Soft Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

            <div className="text-center space-y-2 mb-10 mt-2">
                <h3 className="font-playfair text-2xl font-bold text-wood-dark">Gönderici ve Alıcı Bilgileri</h3>
                <p className="text-ink-light text-sm max-w-xl mx-auto">
                    Mektubunuzun kime gideceğini ve kimden gittiğini belirteceğiniz alan. Lütfen bilgileri eksiksiz doldurunuz.
                </p>
            </div>

            {/* Form Container */}
            <div className="flex flex-col md:flex-row gap-12 md:gap-8 lg:gap-16">

                {/* SENDER INFO (Left) */}
                <div className="flex-1 space-y-6">
                    <div className="text-center mb-6">
                        <h3 className="font-playfair text-xl font-bold text-wood flex items-center justify-center gap-2">
                            <span className="text-lg">»</span> Gönderen Bilgileri <span className="text-lg">«</span>
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {/* Sender Name */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-ink-light block">Ad Soyad</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Gönderen Ad Soyad"
                                    value={address.senderName}
                                    onChange={(e) => updateAddress({ senderName: e.target.value })}
                                    className="w-full bg-paper text-ink text-sm px-4 py-3 pl-10 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all"
                                />
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light/50" />
                            </div>
                            <p className="text-xs text-ink-light/70 ml-1 text-right">↑ Lütfen tam adınızı ve soyadınızı giriniz.</p>
                        </div>

                        {/* Sender City */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-ink-light block">Şehir / İlçe</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Örn: Kadıköy, İstanbul"
                                    value={address.senderCity}
                                    onChange={(e) => updateAddress({ senderCity: e.target.value })}
                                    className="w-full bg-paper text-ink text-sm px-4 py-3 border border-paper-dark rounded-md outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all"
                                />
                            </div>
                        </div>

                        {/* Sender Address */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-seal ml-1">Kendi Adresiniz :</label>
                            <textarea
                                rows={4}
                                placeholder="Örnek: Güneş Mah. Yıldız Sok. No:9 Kat:1 Daire:1"
                                className="w-full bg-paper-light text-ink text-sm px-4 py-3 border border-paper-dark rounded-md outline-none focus:border-wood transition-all shadow-sm resize-none"
                                value={address.senderAddress}
                                onChange={(e) => updateAddress({ senderAddress: e.target.value })}
                            ></textarea>
                            <p className="text-xs text-ink-light/70 ml-1 text-right">↑ Lütfen bu alana kendi adresinizi doğru şekilde giriniz.</p>
                        </div>
                    </div>
                </div>


                {/* RECEIVER INFO (Right) */}
                <div className="flex-1 space-y-6">
                    <div className="text-center mb-6">
                        <h3 className="font-playfair text-xl font-bold text-seal flex items-center justify-center gap-2">
                            <span className="text-lg text-wood">»</span> Alıcı Bilgileri <span className="text-lg text-wood">«</span>
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {/* Receiver Name */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-ink-light block">Ad Soyad</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Alıcı Ad Soyad"
                                    value={address.receiverName}
                                    onChange={(e) => updateAddress({ receiverName: e.target.value })}
                                    className="w-full bg-paper text-ink text-sm px-4 py-3 pl-10 border border-seal/40 rounded-md outline-none focus:border-seal focus:ring-1 focus:ring-seal transition-all"
                                />
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-seal/50" />
                            </div>
                        </div>

                        {/* Receiver Phone */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-ink-light block">Telefon Numarası</label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    placeholder="0(5XX) XXX XX XX"
                                    value={address.receiverPhone}
                                    onChange={(e) => updateAddress({ receiverPhone: e.target.value })}
                                    className="w-full bg-paper text-ink text-sm px-4 py-3 pl-10 border border-seal/40 rounded-md outline-none focus:border-seal focus:ring-1 focus:ring-seal transition-all tracking-wider"
                                />
                                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-seal/50" />
                            </div>
                            <p className="text-xs text-seal/70 mt-1">Mektup teslimatında zorunludur.</p>
                        </div>

                        {/* Receiver City */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-ink-light block">Şehir / İlçe</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Örn: Çankaya, Ankara"
                                    value={address.receiverCity}
                                    onChange={(e) => updateAddress({ receiverCity: e.target.value })}
                                    className="w-full bg-paper text-ink text-sm px-4 py-3 border border-seal/40 rounded-md outline-none focus:border-seal focus:ring-1 focus:ring-seal transition-all"
                                />
                            </div>
                        </div>

                        {/* Receiver Address */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-ink-light block">Açık Adres</label>
                            <textarea
                                rows={4}
                                placeholder="Mahalle, sokak, apartman ve kapı numarası..."
                                value={address.receiverAddress}
                                onChange={(e) => updateAddress({ receiverAddress: e.target.value })}
                                className="w-full bg-paper text-ink text-sm px-4 py-3 border border-seal/40 rounded-md outline-none focus:border-seal focus:ring-1 focus:ring-seal transition-all resize-none"
                            ></textarea>
                            <p className="text-xs text-seal/80 font-medium ml-1 text-right">
                                ↑ Anlaşılmayan bir adres girilirse mektup teslim edilemeyecektir.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
