import type { Metadata } from "next";
import { Inter, Playfair_Display, Kurale } from "next/font/google";
import Link from "next/link";
import { Mail, Home, PenLine, MessageSquare, Menu, HelpCircle, User, LogOut } from "lucide-react";
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

        <header className="bg-transparent border-b border-paper/10 py-3 w-full z-10 relative">
          <div className="container mx-auto px-6 max-w-7xl flex justify-between items-center gap-4">

            <Link href="/" className="flex flex-col hover:opacity-90 transition-opacity shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-paper/20 backdrop-blur-sm text-paper p-1.5 rounded-sm border border-paper/10">
                  <Mail size={24} strokeWidth={2.5} />
                </div>
                <h1 className="font-playfair text-2xl lg:text-3xl font-bold tracking-widest text-paper drop-shadow-md">MEXTUP</h1>
              </div>
              <span className="text-[10px] lg:text-[12px] font-semibold tracking-widest text-paper/70 mt-1 italic drop-shadow-sm">&quot;Söz Uçar, Mextup Kalır.&quot;</span>
            </Link>

            <nav className="text-[11px] lg:text-[13px] font-bold tracking-wider text-paper/90 gap-4 lg:gap-8 hidden md:flex items-center flex-1 justify-center">
              <Link href="/" className="flex items-center gap-1.5 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                <Home size={18} />
                <span>ANASAYFA</span>
              </Link>
              <Link href="/mektup-yaz" className="flex items-center gap-1.5 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
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

            <div className="hidden md:flex items-center gap-3 shrink-0">
              <Link href="#" className="flex items-center gap-2 bg-paper/10 backdrop-blur-md text-paper border border-paper/20 hover:border-paper/40 hover:bg-paper/20 px-4 py-2 rounded-md font-bold text-[13px] transition-all shadow-sm">
                <User size={16} />
                <span>Hesabım</span>
              </Link>
              <button className="flex items-center gap-2 bg-paper/10 backdrop-blur-md text-paper border border-paper/20 hover:border-paper/40 hover:bg-paper/20 px-4 py-2 rounded-md font-bold text-[13px] transition-all shadow-sm">
                <LogOut size={16} />
                <span>Çıkış</span>
              </button>
            </div>

            <button className="md:hidden text-paper p-2 hover:bg-paper/10 rounded-md transition-colors shrink-0">
              <Menu size={26} />
            </button>
          </div>
        </header>

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
