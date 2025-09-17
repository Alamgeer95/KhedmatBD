'use client';
import Seo from '@/components/Seo';
import { abs } from '@/utils/abs';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <Seo title="প্রাইভেসি পলিসি" description="ব্যবহারকারীর তথ্যের গোপনীয়তা নীতিমালা।" canonical={abs('/privacy')} ogImage={abs('/api/og/site')} />
      <section className="mx-auto max-w-3xl px-4 py-10 prose">
        <h1>প্রাইভেসি পলিসি</h1>
        <p>…</p>
      </section>
    </main>
  );
}
