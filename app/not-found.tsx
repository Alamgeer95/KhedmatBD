'use client';
import Seo from '@/components/Seo';
import { abs } from '@/utils/abs';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] grid place-items-center px-4">
      <Seo title="পেজ পাওয়া যায়নি" description="আপনি যে পেজটি খুঁজছেন তা নেই।" canonical={abs('/404')} noindex />
      <div className="text-center">
        <h1 className="text-2xl font-semibold">আপনার কাঙ্ক্ষিত পেজটি পাওয়া যায়নি</h1>
        <Link href="/" className="inline-block mt-4 px-5 h-11 rounded-xl bg-emerald-600 text-white">হোমপেজে ফিরুন</Link>
      </div>
    </main>
  );
}
