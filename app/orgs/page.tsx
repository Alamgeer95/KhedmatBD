'use client';
import Seo from '@/components/Seo';
import { abs } from '@/utils/abs';

export default function OrgsPage() {
  return (
    <main className="min-h-screen">
      <Seo
        title="প্রতিষ্ঠানসমূহ"
        description="মাদরাসা/মসজিদ/এনজিও প্রতিষ্ঠান তালিকা।"
        canonical={abs('/orgs')}
        ogImage={abs('/api/og/site')}
      />
      {/* আপনার লিস্ট UI */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold">প্রতিষ্ঠানসমূহ</h1>
      </section>
    </main>
  );
}
