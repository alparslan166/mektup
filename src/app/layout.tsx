import type { Metadata } from "next";
import { Inter, Playfair_Display, Kurale } from "next/font/google";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PageLoader from "@/components/PageLoader";
import { NextAuthProvider } from "@/providers/NextAuthProvider";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Image from "next/image";
import TermsGuard from "@/components/TermsGuard";
import { Instagram, Twitter } from "lucide-react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
});

const kurale = Kurale({
  variable: "--font-kurale",
  weight: "400",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Cezaevine Mektup Gönder | Tespih, Saat, Hediye Gönder",
  description:
    "Cezaevine mektup gönder! Sevdiklerinize en güvenilir şekilde fotoğraflı, kokulu mektup ve hediye (Tespih, Saat vb.) gönderimi yapın.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${inter.variable} ${playfair.variable} ${kurale.variable} font-sans antialiased text-ink min-h-screen flex flex-col relative`}
        style={{
          backgroundImage: `url('/images/home.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-paper/5 z-[-1] pointer-events-none"></div>

        <Suspense fallback={null}>
          <PageLoader />
        </Suspense>

        <NextAuthProvider>
          <Toaster position="top-center" />
          <Navbar />
          <TermsGuard />
          <main className="relative z-10 flex flex-col items-stretch flex-1">
            {children}
          </main>
        </NextAuthProvider>

        <footer className="bg-[#1c1917] text-paper/70 py-10 mt-auto border-t border-wood/10 relative z-10">
          <div className="container flex flex-col items-center justify-between max-w-6xl gap-6 px-6 mx-auto md:flex-row">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 mb-2 rounded-sm text-paper">
                <Image
                  src="/images/kus-logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                />
                <p className="text-xl font-playfair text-paper">
                  Söz kulağa, yazı uzağa gider...
                </p>
              </div>
              <p className="text-sm">
                © {new Date().getFullYear()} EHM DİJİTAL ÇÖZÜMLER YAZILIM VE
                TİCARET LİMİTED ŞİRKETİ. Tüm hakları saklıdır.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 md:items-end">
              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/mektuplascom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 transition-all rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 text-paper"
                  title="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="https://x.com/MektuplasCom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 transition-all rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 text-paper"
                  title="X"
                >
                  <Twitter size={20} />
                </a>
              </div>
              <div className="flex flex-wrap justify-center text-xs font-medium tracking-wider uppercase md:justify-end gap-x-5 gap-y-2">
                <Link
                  href="/hakkimizda"
                  className="transition-colors hover:text-paper"
                >
                  Hakkımızda
                </Link>
                <Link
                  href="/sss"
                  className="transition-colors hover:text-paper"
                >
                  S.S.S.
                </Link>
                <Link
                  href="/sozlesmeler"
                  className="transition-colors hover:text-paper"
                >
                  Mesafeli Satış Sözleşmesi
                </Link>
                <Link
                  href="/sozlesmeler"
                  className="transition-colors hover:text-paper"
                >
                  Gizlilik Politikası
                </Link>
                <Link
                  href="/sozlesmeler"
                  className="transition-colors hover:text-paper"
                >
                  Üyelik Sözleşmesi
                </Link>
                <Link
                  href="/sozlesmeler"
                  className="transition-colors hover:text-paper"
                >
                  KVKK
                </Link>
                <Link
                  href="/iletisim"
                  className="transition-colors hover:text-paper"
                >
                  İletişim
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2 md:justify-end">
                {/* <Image 
                  src="/logo_band_colored.svg" 
                  alt="Ödeme Yöntemleri" 
                  width={300} 
                  height={40} 
                  className="transition-opacity opacity-80 hover:opacity-100"
                />
                <Image 
                  src="/iyzico_ile_ode_colored.png" 
                  alt="iyzico ile Öde" 
                  width={100} 
                  height={40} 
                  className="object-contain transition-opacity opacity-80 hover:opacity-100"
                /> */}
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
