'use client';
import Seo from '@/components/Seo';
import { abs } from '@/utils/abs';

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <Seo title="টার্মস অফ সার্ভিস" description="সেবার শর্তাবলী।" canonical={abs('/terms')} ogImage={abs('/api/og/site')} />
      <section className="mx-auto max-w-3xl px-4 py-10 prose">
        <h1>টার্মস অফ সার্ভিস</h1>
        <p>…</p>
      </section>
    </main>
  );
}
