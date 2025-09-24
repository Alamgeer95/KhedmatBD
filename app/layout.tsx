// app/layout.tsx
import Image from "next/image";
import logo from "components/site-logo.png"; 
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import './globals.css'
import Providers from './providers'
import Navbar from '@/components/Navbar'
import { Tiro_Bangla } from 'next/font/google'
import Link from "next/link";



const SITE_NAME = "KhedmatBD";

const tiroBangla = Tiro_Bangla({
  subsets: ['bengali'],
  weight: '400',
  variable: '--font-bn',
  display: 'swap',
  adjustFontFallback: true
})

export const metadata: Metadata = {
  title: 'KhedmatBD',
  description: 'মাদরাসা, মসজিদ, ইসলামিক স্কুল ও সংস্থার জন্য খেদমত প্ল্যাটফর্ম',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="bn"
      
      className={`${tiroBangla.variable} h-full bg-[#fcf8e8] overscroll-y-none`}
    >
      <body className="min-h-screen bg-[#fcf8e8] text-[#2c3e50] antialiased flex flex-col">
        <Navbar />
        <Providers>{children}</Providers>

        {/* GLOBAL FOOTER */}
        {/* GLOBAL FOOTER */}
<footer className="border-t border-white/10 mt-12 bg-[#0e1a30] text-[#f0f5ff]">
  <div className="container-app py-12 grid md:grid-cols-4 gap-8 text-center md:text-left">
    {/* Logo & Description */}
    <div className="md:col-span-1">
      <Link href="/" className="flex items-center justify-center md:justify-start gap-2 font-bold text-xl">
        <span className="w-8 h-8 rounded-lg bg-[#b88a4e] text-white flex items-center justify-center">
          <Image
            src={logo}
            alt="KhedmatBD"
            width={40}
            height={40}
            className="object-contain"
          />
        </span>
        {SITE_NAME}
      </Link>
      <p className="text-[#a1b2d4] mt-4 text-sm">
        মাদরাসা, মসজিদ ও ইসলামিক শিক্ষা প্রতিষ্ঠানে খেদমতের বিশ্বমানের প্ল্যাটফর্ম।
      </p>
    </div>

    {/* Links */}
    <div>
      <div className="font-semibold text-lg mb-2">লিংকস</div>
      <ul className="flex flex-wrap justify-center md:block mt-4 space-x-4 md:space-x-0 md:space-y-2 text-sm">
        <li>
          <Link href="/jobs" className="text-[#a1b2d4] hover:text-[#b88a4e]">
            খেদমতসমূহ
          </Link>
        </li>
        <li>
          <Link href="/post-job" className="text-[#a1b2d4] hover:text-[#b88a4e]">
            খেদমত পোস্ট
          </Link>
        </li>
        <li>
          <Link href="/about" className="text-[#a1b2d4] hover:text-[#b88a4e]">
            আমাদের সম্পর্কে
          </Link>
        </li>
        <li>
          <Link href="/contact" className="text-[#a1b2d4] hover:text-[#b88a4e]">
            যোগাযোগ
          </Link>
        </li>
      </ul>
    </div>

    {/* Legal */}
    <div>
      <div className="font-semibold text-lg mb-2">লিগ্যাল</div>
      <ul className="flex flex-wrap justify-center md:block mt-4 space-x-4 md:space-x-0 md:space-y-2 text-sm">
        <li>
          <Link href="/privacy" className="text-[#a1b2d4] hover:text-[#b88a4e]">
            প্রাইভেসি
          </Link>
        </li>
        <li>
          <Link href="/terms" className="text-[#a1b2d4] hover:text-[#b88a4e]">
            টার্মস
          </Link>
        </li>
      </ul>
    </div>

    {/* Follow Us */}
    <div>
      <div className="font-semibold text-lg mb-2">ফলো করুন</div>
      <div className="mt-4 flex justify-center md:justify-start gap-3 text-2xl">
        <Link
          href="https://facebook.com"
          aria-label="Facebook"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#b88a4e]/20 transition-colors"
        >
          👍
        </Link>
        <Link
          href="https://twitter.com"
          aria-label="Twitter"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#b88a4e]/20 transition-colors"
        >
          🐦
        </Link>
        <Link
          href="https://linkedin.com"
          aria-label="LinkedIn"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#b88a4e]/20 transition-colors"
        >
          🔗
        </Link>
      </div>
    </div>
  </div>

  {/* Bottom Bar */}
  <div className="border-t border-white/10">
    <div className="text-sm text-[#a1b2d4] text-center py-6 container-app">
      <p className="mb-3 text-lg"></p>
      <p className="text-sm mt-2">
        © {new Date().getFullYear()} {SITE_NAME}. কতৃক সর্বস্বত্ব সংরক্ষিত।
      </p>
      <p className="text-sm mt-2">
        Developed by{" "}
        <a
          href="https://wa.me/8801735260227?text=আসসালামু%20আলাইকুম%20ওয়া%20রাহমাতুল্লাহ।%20আমি%20আপনার%20সাইট%20থেকে%20যোগাযোগ%20করছি।"
          className="text-[#6495ED] hover:underline"
        >
          A. Hussain
        </a>
      </p>
    </div>
  </div>
</footer>

      </body>
    </html>
  );
}