'use client';
import Seo from '@/components/Seo';
import { abs } from '@/utils/abs';

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Seo
        title="আমাদের সম্পর্কে"
        description="মাদরাসা/মসজিদ/ইসলামিক প্রতিষ্ঠানের জন্য খেদমত প্ল্যাটফর্ম।"
        canonical={abs('/about')}
        ogImage={abs('/api/og/site')}
      />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold">আমাদের সম্পর্কে</h1>
        <p className="mt-3 text-slate-700">KhedmatBD হলো…</p>
      </section>
    </main>
  );
}
