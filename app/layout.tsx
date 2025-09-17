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
  description: 'মাদরাসা, মসজিদ, ইসলামিক স্কুল ও এনজিওর জন্য খেদমত প্ল্যাটফর্ম',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn" className={tiroBangla.variable}>
      <body>
        <Navbar />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
