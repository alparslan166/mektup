"use client";

import React from 'react';
import Link from 'next/link';
import {
  PenTool, Feather, Mail, Settings, Clock, Send,
  Smile, Star, Archive, ArrowDown, BookOpen,
  Wallet, Sparkles, PlusCircle, Inbox, HelpCircle, Gift
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import DashboardCard from '@/components/DashboardCard';
import { useLetterStore } from '@/store/letterStore';
import Image from "next/image";
import { getCreditBalanceAction } from '@/app/actions/creditActions';
import { getUnreadInboxCount } from '@/app/actions/inboxActions';
import { getSentLetterCount } from '@/app/actions/letterActions';


export default function LandingPage() {
  const { data: session, status } = useSession();
  const resetStore = useLetterStore(state => state.resetStore);
  const isLoading = status === "loading";
  const [balance, setBalance] = React.useState<number | null>(null);
  const [unreadCount, setUnreadCount] = React.useState<number>(0);
  const [sentLetterCount, setSentLetterCount] = React.useState<number>(0);

  React.useEffect(() => {
    const userId = (session?.user as any)?.id;
    if (userId) {
      getCreditBalanceAction().then(res => {
        if (res.success && res.balance !== undefined) {
          setBalance(res.balance);
        }
      });
      getUnreadInboxCount().then(count => {
        setUnreadCount(count);
      });
      getSentLetterCount().then(count => {
        setSentLetterCount(count);
      });
    }
  }, [session]);

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const features = [
    {
      icon: <Settings size={28} />,
      title: "Ekstra Özellikler",
      description: "Kağıt ve zarf rengi seçimi, nostaljik kokular, kartpostal, fotoğraf ve belge ekleme gibi birçok özelliği kolayca kullanabilirsiniz."
    },
    {
      icon: <Clock size={28} />,
      title: "Zamandan Tasarruf",
      description: "Mektup ile oturduğunuz yerden online olarak mektup yazıp gönderebilirsiniz. Sıra beklemenize gerek yoktur."
    },
    {
      icon: <Send size={28} />,
      title: "Takip Edilebilir",
      description: "Siparişiniz ilk iş gününde kargoya verilir. Mektubunuz yola çıktığında takip kodunuz SMS veya e-posta ile gönderilir."
    },
    {
      icon: <Smile size={28} />,
      title: "Emoji Desteği",
      description: "Mektubunuzda emojileri kullanabilirsiniz. Alıcı renkli bir şekilde eklemiş olduğunuz emojileri de görecektir."
    },
    {
      icon: <Star size={28} />,
      title: "Yüksek Kalite",
      description: "Kullanılan kağıt ve mürekkebler yüksek kalitede olup mektuplarınız son teknoloji baskı cihazlarıyla basılır."
    },
    {
      icon: <Archive size={28} />,
      title: "Sürekli Erişim",
      description: "Sistemde kayıtlı mektuplarınız dijital bir anı kutusunda saklanır, seneler sonra bile tekrar okuyabilirsiniz."
    }
  ];

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isLoading && session) {
    return (
      <div className="flex-1 container max-w-6xl mx-auto px-6 py-6 sm:py-10 animate-in fade-in duration-700">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4 pb-4 border-b border-wood/10">
          <div>
            <div className="flex items-center gap-3 text-seal mb-3">
              <Sparkles size={20} className="animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Hoş Geldiniz</span>
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-wood-dark">
              Merhaba, <span className="text-seal capitalize">{session.user?.name || "Değerli Üyemiz"}</span>
            </h1>
            <p className="text-black mt-4 text-lg">
              Mektubunuzun hikayesi burada başlar. Bugün kime yazıyoruz?
            </p>
          </div>
          <Link href="/mektup-yaz" onClick={resetStore} className="bg-seal hover:bg-seal-hover text-paper px-8 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 group">
            <PenTool size={20} className="group-hover:rotate-90 transition-transform" />
            Yeni Mektup Oluştur
          </Link>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          <DashboardCard
            title="Taslaklar"
            description="Yarım bıraktığınız mektuplarınıza buradan ulaşabilir, yazmaya devam edebilirsiniz."
            href="/taslaklar"
            icon={Archive}
            color="paper"
            delay={0.2}
          />
          <DashboardCard
            title="Gönderilenler"
            description="Anı kutunuza eklenen, daha önce gönderdiğiniz mektupları inceleyin."
            href="/gonderilenler"
            icon={Send}
            color="ink"
            delay={0.3}
          />
          <DashboardCard
            title="Hediye Gönder"
            description="Sevdiklerinize mektubun yanında sürpriz hediyeler ekleyerek onları şaşırtın."
            href="/hediyeler"
            icon={Gift}
            color="seal"
            delay={0.4}
          />
          <DashboardCard
            title="Gelen Kutusu"
            description={unreadCount > 0 ? `Yeni mektubunuz var! (${unreadCount} okunmamış)` : "Size gönderilen mektupları ve dijital mesajları buradan takip edin."}
            href="/gelen-kutusu"
            icon={Inbox}
            color={unreadCount > 0 ? "red" : "paper"}
            delay={0.5}
            className={unreadCount > 0 ? "ring-4 ring-red-500 ring-offset-4 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.6)]" : ""}
          />
          <DashboardCard
            title="Adres Defteri"
            description="Sevdiklerinizin adreslerini kaydedin, bir sonraki mektupta zaman kazanın."
            href="/adresler"
            icon={BookOpen}
            color="wood"
            delay={0.6}
          />
          <DashboardCard
            title="Cüzdan & Kutu"
            description={balance !== null ? `Bakiyeniz: ${balance} 🪙 • İşlemlerinizi yönetin.` : "Kredinizi yönetin ve avantajlı paketleri inceleyin."}
            href="/cuzdan"
            icon={Wallet}
            color="gold"
            delay={0.7}
          />
        </div>

        {/* Quote of the Day - Signature Style */}
        <div className="mt-20 text-center max-w-2xl mx-auto flex flex-col items-center justify-center px-4">
          <div className="text-[#e2c19e]/80 mb-3 drop-shadow-sm">
            <Feather size={28} />
          </div>
          <p className="font-kurale text-2xl md:text-3xl text-paper/90 leading-relaxed drop-shadow-md tracking-wide">
            "Bir mektup, sadece kağıt ve mürekkep değil;<br className="hidden sm:block" /> kalpten kalbe uzanan ince bir köprüdür."
          </p>
        </div>

        {/* Stats Section or Bottom Note */}
        <div className="mt-20 p-8 rounded-3xl bg-wood text-paper flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="relative z-10 text-center md:text-left">
            <h3 className="font-playfair text-2xl font-bold mb-2">
              {(sentLetterCount % 6) === 5 ? "Hediye Mektup HAKKINIZ HAZIR! 🎁" : "Hediye Mektup Yolunda..."}
            </h3>
            <p className="text-paper/70 font-medium">Toplam her 5 mektup gönderiminde bir sonraki mektubunuz bizden hediye!</p>
          </div>
          <div className="relative z-10 flex gap-4">
            {[1, 2, 3, 4, 5].map(i => {
              const currentStep = sentLetterCount % 6;
              const isFilled = i <= currentStep;
              return (
                <div key={i} className={`w-10 h-10 rounded-full border-2 transition-all duration-500 flex items-center justify-center ${isFilled ? 'bg-seal/60 border-seal shadow-[0_0_15px_rgba(196,138,92,0.4)] scale-110' : 'border-paper/30'}`}>
                  <Mail size={16} className={isFilled ? 'text-white' : 'text-white/20'} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-0 relative overflow-hidden">

      {/* HER0 SECTION */}
      <div
        className="w-full relative flex flex-col items-center justify-center pt-16 pb-32 md:pb-48 min-h-[85vh]"
      >

        <motion.div
          className="container max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center px-4"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className="mb-8 flex justify-center">
            <div className="bg-paper/10 p-5 rounded-full shadow-lg relative backdrop-blur-md">
              <Image src="/images/kus-logo.png" alt="Logo" width={80} height={80} />
              <div className="absolute -bottom-2 -right-2 bg-paper/10 border border-paper/20 rounded-full p-2 shadow-lg">
                <Feather size={24} className="text-paper" />
              </div>
            </div>
          </motion.div>

          <motion.h1 variants={fadeIn} className="font-playfair text-5xl md:text-7xl font-bold text-paper mb-6 tracking-tight drop-shadow-xl">
            Geleceğe & <span className="text-[#e2c19e] italic drop-shadow-lg">Cezaevine</span> Mektup
          </motion.h1>

          <motion.p variants={fadeIn} className="text-lg md:text-xl text-paper/90 max-w-2xl mb-12 leading-relaxed font-light drop-shadow-md">
            Kağıdın dokusunu, mürekkebin hissini ve nostaljik kokuları dijital dünyadan koparıp sevdiklerinize fiziksel olarak ulaştırıyoruz. İster sevdiklerinize, ister cezaevine, ister yıllar sonrasına... Onlarla aranızdaki en somut bağ mektubunuz olsun.
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-5 mb-16">
            <button
              onClick={scrollToFeatures}
              className="bg-paper/10 backdrop-blur-md border border-paper/30 hover:bg-paper/20 hover:border-paper/50 text-paper px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              Nasıl Çalışır?
            </button>
            <Link
              href={session ? "/mektup-yaz" : "/auth/login?callbackUrl=/mektup-yaz"}
              className="bg-seal hover:bg-seal-hover text-paper px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 group border border-seal-hover"
            >
              <PenTool size={22} className="group-hover:rotate-12 transition-transform" />
              Mektup Yazmaya Başla
            </Link>
          </motion.div>

          <motion.div
            variants={fadeIn}
            className="absolute bottom-1 -mb-20 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer text-paper/60 hover:text-paper transition-colors drop-shadow-md"
            onClick={scrollToFeatures}
          >
            <ArrowDown size={32} />
          </motion.div>
        </motion.div>

        {/* Curved SVG Divider connecting to the dark section */}
        <svg className="absolute bottom-[-1px] left-0 w-full h-[8vw] md:h-[120px]" preserveAspectRatio="none" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120H1440V0.5C1440 0.5 1060.5 120 720 120C379.5 120 0 0.5 0 0.5V120Z" fill="#1c1917" />
        </svg>
      </div>

      {/* DARK FEATURES SECTION */}
      <div id="features" className="w-full bg-[#1c1917] pt-12 pb-24 px-4 text-paper relative z-10">
        <div className="container max-w-6xl mx-auto flex flex-col gap-16 mt-8">

          {/* First Row (3 items) */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={staggerContainer}
          >
            {features.slice(0, 3).map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="flex flex-col items-center text-center group"
              >
                <div className="mb-6 p-4 rounded-full bg-paper/5 text-wood group-hover:bg-wood/20 group-hover:text-seal transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-playfair text-2xl font-bold text-paper mb-3">{feature.title}</h3>
                <p className="text-[#a8a29e] leading-relaxed text-[15px] px-2">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Second Row (3 items) */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={staggerContainer}
          >
            {features.slice(3, 6).map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="flex flex-col items-center text-center group"
              >
                <div className="mb-6 p-4 rounded-full bg-paper/5 text-wood group-hover:bg-wood/20 group-hover:text-seal transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-playfair text-2xl font-bold text-paper mb-3">{feature.title}</h3>
                <p className="text-[#a8a29e] leading-relaxed text-[15px] px-2">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>

    </div>
  );
}
