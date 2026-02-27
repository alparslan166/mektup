"use client";

import React from "react";
import Stepper from "@/components/Stepper";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Mail, ImageIcon, Calendar, Eye, X as CloseIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useLetterStore } from "@/store/letterStore";
import { getPricingSettings } from "@/app/actions/settingsActions";

export default function ReviewStep({ goBack, goNext }: { goBack: () => void, goNext: () => void }) {
    const { letter, extras, address, setCurrentStep } = useLetterStore();
    const [showPreview, setShowPreview] = React.useState(false);

    // Pricing States
    const [pricingKeys, setPricingKeys] = React.useState({
        letterSendPrice: 100,
        photoCreditPrice: 10,
        postcardCreditPrice: 15,
        scentCreditPrice: 20,
        docCreditPrice: 5,
        calendarCreditPrice: 30,
        envelopeColorPrice: 10,
        paperColorPrice: 10
    });

    React.useEffect(() => {
        const fetchPrices = async () => {
            const res = await getPricingSettings();
            if (res.success && res.data) {
                setPricingKeys({
                    letterSendPrice: res.data.letterSendPrice || 100,
                    photoCreditPrice: res.data.photoCreditPrice || 10,
                    postcardCreditPrice: res.data.postcardCreditPrice || 15,
                    scentCreditPrice: res.data.scentCreditPrice || 20,
                    docCreditPrice: res.data.docCreditPrice || 5,
                    calendarCreditPrice: res.data.calendarCreditPrice || 30,
                    envelopeColorPrice: res.data.envelopeColorPrice || 10,
                    paperColorPrice: res.data.paperColorPrice || 10,
                });
            }
        };
        fetchPrices();
    }, []);

    // Zarf ve Kağıt Renk Farkı
    const envelopePriceDelta = letter.envelopeColor !== "Beyaz" ? pricingKeys.envelopeColorPrice : 0;
    const paperPriceDelta = letter.paperColor !== "Beyaz" ? pricingKeys.paperColorPrice : 0;

    // Calculate dynamic pricing based on selections
    const baseLetterPrice = pricingKeys.letterSendPrice + envelopePriceDelta + paperPriceDelta;
    const scentPrice = extras.scent === "Yok" ? 0 : pricingKeys.scentCreditPrice;

    // Fotoğraf Fiyat Algoritması
    const photoCreditPrice = pricingKeys.photoCreditPrice;
    let actualPhotoCount = extras.photos.length;
    let photoPriceText = "";

    if (actualPhotoCount >= 10) {
        // En az 10 fotoğraf varsa: 2 tanesi bedava
        actualPhotoCount = actualPhotoCount - 2;
        photoPriceText = "(2 Hediye!)";
    } else if (actualPhotoCount >= 5) {
        // En az 5 fotoğraf varsa: 1 tanesi bedava
        actualPhotoCount = actualPhotoCount - 1;
        photoPriceText = "(1 Hediye!)";
    }

    let photoPrice = actualPhotoCount * photoCreditPrice;

    // Eğer tam 3 fotoğraf veya tam 3'ün katsayısı gelirse fiyattan %20 düşürülebilir 
    // veya sadece "3. fotoğrafa %20 indirim" kuralını harmanlamak için:
    if (extras.photos.length === 3 || extras.photos.length === 4) {
        // İlk 2 fotoğraf 10 + 10 = 20, 3.'sü %20 indirimle 8. Yani Toplam = 28. (4 fotoğrafsa 38)
        let discountedPhotoIndex = 8; // %20 indirimli hali
        photoPrice = (extras.photos.length - 1) * photoCreditPrice + discountedPhotoIndex;
        photoPriceText = "(%20 İndirim!)";
    }

    const docPrice = extras.documents.length * pricingKeys.docCreditPrice;

    // Kartpostal Fiyat Algoritması
    const postcardCreditPrice = pricingKeys.postcardCreditPrice;
    let actualPostcardCount = extras.postcards.length;
    let postcardPriceText = "";

    if (actualPostcardCount >= 10) {
        // En az 10 kartpostal varsa: 2 tanesi bedava
        actualPostcardCount = actualPostcardCount - 2;
        postcardPriceText = "(2 Hediye!)";
    } else if (actualPostcardCount >= 5) {
        // En az 5 kartpostal varsa: 1 tanesi bedava
        actualPostcardCount = actualPostcardCount - 1;
        postcardPriceText = "(1 Hediye!)";
    }

    let postcardPrice = actualPostcardCount * postcardCreditPrice;

    // %20 indirim kuralı (3 fotoğrafta 1 tanesine %20 indirim)
    if (extras.postcards.length === 3 || extras.postcards.length === 4) {
        let discountedPostcardIndex = Math.round(postcardCreditPrice * 0.8); // 15 * 0.8 = 12
        postcardPrice = (extras.postcards.length - 1) * postcardCreditPrice + discountedPostcardIndex;
        postcardPriceText = "(%20 İndirim!)";
    }
    const calendarPrice = extras.includeCalendar ? (extras.photos.length >= 3 ? 0 : pricingKeys.calendarCreditPrice) : 0;
    const shippingPrice = 0; // Krediye Dahil

    const totalPrice = baseLetterPrice + scentPrice + photoPrice + docPrice + postcardPrice + calendarPrice + shippingPrice;

    const orderDetails = {
        letter,
        extras: {
            ...extras,
            photoCount: extras.photos.length,
            photoPriceText,
            docCount: extras.documents.length,
            postcardCount: extras.postcards.length,
            postcardPriceText,
            calendar: extras.includeCalendar
        },
        sender: {
            name: address.senderName || "Belirtilmemiş",
            city: address.senderCity || "Belirtilmemiş",
            address: address.senderAddress || "Belirtilmemiş"
        },
        receiver: {
            name: address.receiverName || "Belirtilmemiş",
            city: address.receiverCity || "Belirtilmemiş",
            address: address.receiverAddress || "Belirtilmemiş",
            phone: address.receiverPhone || "Belirtilmemiş"
        },
        pricing: {
            baseLetter: baseLetterPrice,
            scent: scentPrice,
            photos: photoPrice,
            docs: docPrice,
            postcards: postcardPrice,
            calendar: calendarPrice,
            shipping: shippingPrice,
            total: totalPrice
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl flex-1 flex flex-col animate-in fade-in duration-300">
            <div className="bg-paper shadow-sm border border-paper-dark rounded-xl p-6 sm:p-10 flex-col flex relative overflow-hidden">
                {/* Soft Background Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-seal/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                    <button onClick={goBack} className="p-2 hover:bg-paper-dark rounded-full transition-colors group">
                        <ArrowLeft className="text-ink-light group-hover:text-ink transition-colors" size={24} />
                    </button>
                    <h2 className="font-playfair text-3xl font-bold text-wood-dark">Geleceğe Mektup</h2>
                </div>
                <p className="text-ink-light ml-12 text-sm sm:text-base">
                    Mektubunuz neredeyse hazır! Lütfen ödeme adımına geçmeden önce girdiğiniz bilgileri son kez kontrol edin.
                </p>

                {/* Stepper */}
                <div className="mt-8 mb-10">
                    <Stepper currentStep={4} />
                </div>

                {/* Review Content */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Details Column (Left - 2/3 width) */}
                    <div className="flex-[2] space-y-6">

                        {/* Letter & Extras Summary Box */}
                        <div className="bg-paper-light border border-paper-dark rounded-xl p-6">
                            <h3 className="font-playfair text-lg font-bold text-wood border-b border-paper-dark pb-3 mb-4 flex items-center gap-2">
                                <Mail size={20} className="text-seal" /> Mektup & Ekstra Detayları
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs text-ink-light uppercase tracking-wider font-semibold">Zarf / Kağıt</span>
                                        <button
                                            onClick={() => setShowPreview(true)}
                                            className="text-xs font-bold text-seal hover:text-seal-hover flex items-center gap-1 transition-colors"
                                        >
                                            <Eye size={12} />
                                            Mektup Önizlemesi
                                        </button>
                                    </div>
                                    <p className="text-ink font-medium">{orderDetails.letter.envelopeColor} Zarf, {orderDetails.letter.paperColor} Kağıt</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-ink-light uppercase tracking-wider font-semibold">Kelime Sayısı</span>
                                    <p className="text-ink font-medium">{orderDetails.letter.wordCount} Kelime</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-ink-light uppercase tracking-wider font-semibold">Gönderim Tarihi</span>
                                    <p className="text-ink font-medium flex items-center gap-1">
                                        <Calendar size={14} className="text-wood-dark" /> {orderDetails.extras.deliveryDate}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-ink-light uppercase tracking-wider font-semibold">Seçilen Koku</span>
                                    <p className="text-ink font-medium text-seal">{orderDetails.extras.scent}</p>
                                </div>
                                <div className="col-span-1 sm:col-span-2 space-y-1 mt-2">
                                    <span className="text-xs text-ink-light uppercase tracking-wider font-semibold">Eklenen Medyalar</span>
                                    <div className="flex flex-wrap gap-3 mt-1">
                                        {orderDetails.extras.photoCount > 0 && (
                                            <span className="bg-paper border border-paper-dark px-3 py-1 rounded text-sm font-medium text-wood-dark flex items-center gap-1.5 shadow-sm">
                                                <ImageIcon size={14} /> {orderDetails.extras.photoCount} Fotoğraf
                                            </span>
                                        )}
                                        {orderDetails.extras.docCount > 0 && (
                                            <span className="bg-paper border border-paper-dark px-3 py-1 rounded text-sm font-medium text-wood-dark flex items-center gap-1.5 shadow-sm">
                                                {orderDetails.extras.docCount} Belge
                                            </span>
                                        )}
                                        {orderDetails.extras.postcardCount > 0 && (
                                            <span className="bg-paper border border-paper-dark px-3 py-1 rounded text-sm font-medium text-wood-dark flex items-center gap-1.5 shadow-sm">
                                                {orderDetails.extras.postcardCount} Kartpostal
                                            </span>
                                        )}
                                        {orderDetails.extras.calendar && (
                                            <span className="bg-seal/10 border border-seal/20 px-3 py-1 rounded text-sm font-medium text-seal flex items-center gap-1.5 shadow-sm">
                                                <CheckCircle2 size={14} /> 2026 Takvim
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Addresses Summary Box */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Sender */}
                            <div className="bg-paper-light border border-paper-dark rounded-xl p-6">
                                <h3 className="font-playfair text-lg font-bold text-wood border-b border-paper-dark pb-3 mb-4 flex items-center gap-2">
                                    <MapPin size={20} className="text-ink-light" /> Gönderen
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs text-ink-light block mb-0.5">Ad Soyad</span>
                                        <p className="text-ink font-medium">{orderDetails.sender.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-ink-light block mb-0.5">Şehir</span>
                                        <p className="text-ink font-medium">{orderDetails.sender.city}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-ink-light block mb-0.5">Açık Adres</span>
                                        <p className="text-ink text-sm leading-relaxed">{orderDetails.sender.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Receiver */}
                            <div className="bg-paper-light border border-seal/30 rounded-xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-2 h-full bg-seal/20"></div>
                                <h3 className="font-playfair text-lg font-bold text-seal border-b border-paper-dark pb-3 mb-4 flex items-center gap-2">
                                    <MapPin size={20} className="text-seal" /> Alıcı
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs text-ink-light block mb-0.5">Ad Soyad</span>
                                        <p className="text-ink font-medium">{orderDetails.receiver.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-ink-light block mb-0.5">Telefon</span>
                                        <p className="text-ink font-medium">{orderDetails.receiver.phone}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-ink-light block mb-0.5">Şehir</span>
                                        <p className="text-ink font-medium">{orderDetails.receiver.city}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-ink-light block mb-0.5">Açık Adres</span>
                                        <p className="text-ink text-sm leading-relaxed">{orderDetails.receiver.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Pricing Column (Right - 1/3 width) sticky */}
                    <div className="flex-1">
                        <div className="bg-paper-dark/10 border border-wood/20 rounded-xl p-6 sticky top-8 shadow-sm">
                            <h3 className="font-playfair text-xl font-bold text-wood-dark border-b border-wood/20 pb-4 mb-4 text-center">
                                Harcanacak Kredi Özeti
                            </h3>

                            <div className="space-y-3 text-sm mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-ink-light">Mektup Ücreti</span>
                                    <span className="font-medium text-ink">{orderDetails.pricing.baseLetter} 🪙</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-ink-light">Koku Seçimi ({orderDetails.extras.scent})</span>
                                    <span className="font-medium text-ink">+{orderDetails.pricing.scent} 🪙</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-ink-light flex items-center gap-1">
                                        Fotoğraflar ({orderDetails.extras.photoCount}x)
                                        {orderDetails.extras.photoPriceText && <span className="bg-seal/10 text-seal font-bold text-[10px] px-1.5 rounded-full">{orderDetails.extras.photoPriceText}</span>}
                                    </span>
                                    <span className="font-medium text-ink">+{orderDetails.pricing.photos} 🪙</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-ink-light">Belgeler ({orderDetails.extras.docCount}x)</span>
                                    <span className="font-medium text-ink">+{orderDetails.pricing.docs} 🪙</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-ink-light flex items-center gap-1">
                                        Kartpostallar ({orderDetails.extras.postcardCount}x)
                                        {orderDetails.extras.postcardPriceText && <span className="bg-seal/10 text-seal font-bold text-[10px] px-1.5 rounded-full">{orderDetails.extras.postcardPriceText}</span>}
                                    </span>
                                    <span className="font-medium text-ink">+{orderDetails.pricing.postcards} 🪙</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-ink-light flex items-center gap-1">Takvim <span className="bg-seal text-white text-[10px] px-1.5 rounded-full">HEDİYE</span></span>
                                    <span className="font-medium text-wood-dark line-through opacity-70">{pricingKeys.calendarCreditPrice} 🪙</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-paper-dark/50 pt-3 mt-3">
                                    <span className="text-ink-light">Kargo Ücreti</span>
                                    <span className="font-medium text-ink">Ücretsiz / Krediye Dahil</span>
                                </div>
                            </div>

                            <div className="bg-paper-light border border-wood-dark/20 rounded-lg p-4 mb-6">
                                <div className="flex justify-between items-end">
                                    <span className="text-wood-dark font-bold">Toplam Kredi</span>
                                    <span className="text-3xl font-playfair font-bold text-seal">{orderDetails.pricing.total - orderDetails.pricing.shipping} 🪙</span>
                                </div>
                                <p className="text-[11px] text-ink-light/70 text-right mt-1">KDV Dahildir</p>
                            </div>

                            <button
                                onClick={goNext}
                                className="w-full bg-seal hover:bg-seal-hover text-paper py-4 rounded-xl font-bold shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] text-lg"
                            >
                                Kredi ile Gönder
                                <ArrowRight size={20} />
                            </button>
                            <p className="text-xs text-center text-ink-light mt-4 flex items-center justify-center gap-1">
                                <CheckCircle2 size={12} className="text-wood" /> Bakiye Sistemimizle Hızlı Gönderim
                            </p>
                        </div>
                    </div>

                </div>

                {/* Bottom Actions (Only Back button needed here since Next is in the summary box, but we can keep it for consistency or standard mobile flow) */}
                <div className="mt-8 pt-4 border-t border-paper-dark/30">
                    <button
                        onClick={goBack}
                        className="text-ink-light hover:text-ink px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Bilgilere Geri Dön
                    </button>
                </div>

            </div>

            {/* Letter Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPreview(false)}
                            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
                        ></motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-paper rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-paper-dark flex items-center justify-between bg-paper-light">
                                <h3 className="font-playfair text-xl font-bold text-wood-dark flex items-center gap-2">
                                    <Mail className="text-seal" size={20} />
                                    Mektup Önizlemesi
                                </h3>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="p-2 hover:bg-paper-dark rounded-full transition-colors text-ink-light"
                                >
                                    <CloseIcon size={20} />
                                </button>
                            </div>

                            {/* Modal Content - The Letter */}
                            <div className="flex-1 overflow-y-auto p-8 sm:p-12">
                                <div
                                    className="prose prose-stone max-w-none font-serif text-ink leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: letter.content }}
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-paper-light border-t border-paper-dark flex items-center justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowPreview(false);
                                        setCurrentStep(1);
                                    }}
                                    className="px-6 py-2.5 rounded-lg font-bold text-ink-light hover:text-ink hover:bg-paper-dark transition-all flex items-center gap-2"
                                >
                                    Düzenle
                                </button>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="px-8 py-2.5 bg-seal hover:bg-seal-hover text-white rounded-lg font-bold shadow-md transition-all active:scale-[0.98]"
                                >
                                    Tamam
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
