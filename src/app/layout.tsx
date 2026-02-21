import type { Metadata } from "next";
import { Inter, Playfair_Display, Kurale } from "next/font/google";
import Link from "next/link";
import { Mail, Home, PenLine, MessageSquare, Menu, HelpCircle, User, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageLoader from "@/components/PageLoader";
import { Suspense } from "react";
import "./globals.css";

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
  title: "Geleceğe Mektup | Mektup Gönder",
  description: "Sevdiklerinize veya geleceğe nostaljik, hisli mektuplar yazın.",
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
        style={{ backgroundImage: `url('${process.env.NODE_ENV === 'production' ? '/mektup' : ''}/images/home.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
      >
        <div className="absolute inset-0 bg-[#1c1917]/50 backdrop-blur-[2px] z-[-1] pointer-events-none fixed"></div>

        <Suspense fallback={null}>
          <PageLoader />
        </Suspense>

        <Navbar />

        <main className="flex-1 flex flex-col items-stretch relative z-10">
          {children}
        </main>

        <footer className="bg-[#1c1917] text-paper/70 py-10 mt-auto border-t border-wood/10 relative z-10">
          <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="font-playfair text-xl text-paper mb-2">Söz uçar, mektup kalır.</p>
              <p className="text-sm">© {new Date().getFullYear()} Mextup. Tüm hakları saklıdır.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-5 text-sm font-medium">
              <Link href="/hakkimizda" className="hover:text-paper transition-colors">Hakkımızda</Link>
              <Link href="/sss" className="hover:text-paper transition-colors">S.S.S.</Link>
              <Link href="/gizlilik-ve-guvenlik" className="hover:text-paper transition-colors">Gizlilik Politikası</Link>
              <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-paper transition-colors">Mesafeli Satış Sözleşmesi</Link>
              <Link href="/iletisim" className="hover:text-paper transition-colors">İletişim</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
