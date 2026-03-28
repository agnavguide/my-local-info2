import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = 'https://my-local-info2.pages.dev';

export const metadata: Metadata = {
  title: "성남시 생활 정보 | 행사·혜택·지원금 안내",
  description: "성남시 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보를 매일 업데이트합니다.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "성남시 생활 정보 | 행사·혜택·지원금 안내",
    description: "성남시 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보를 매일 업데이트합니다.",
    url: BASE_URL,
    siteName: "성남시 생활 정보",
    locale: "ko_KR",
    type: "website",
  },
};

import Link from 'next/link';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="bg-slate-900 text-white py-4 px-6 shadow-md w-full shrink-0">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
             <Link href="/" className="font-bold text-lg tracking-wider hover:text-blue-300 transition-colors">Local Info</Link>
             <div className="flex gap-6">
                <Link href="/about" className="text-slate-300 hover:text-white font-bold transition-colors">소개</Link>
                <Link href="/blog" className="text-slate-300 hover:text-white font-bold transition-colors">블로그</Link>
             </div>
          </div>
        </nav>
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
