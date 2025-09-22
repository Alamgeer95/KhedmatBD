import type { Metadata } from 'next'
import { ReactNode } from 'react'
import './globals.css'
import Providers from './providers'
import Navbar from '@/components/Navbar'
import { Tiro_Bangla } from 'next/font/google'

const tiroBangla = Tiro_Bangla({
  subsets: ['bengali'],
  weight: '400',
  variable: '--font-bn',
  display: 'swap',
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
      <body className="min-h-screen bg-[#fcf8e8] text-[#2c3e50] antialiased">
        <Navbar />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
