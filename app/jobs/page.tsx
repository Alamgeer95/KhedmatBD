// app/jobs/page.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import Seo from '@/components/Seo';
import { abs } from '@/utils/abs';

const SITE_NAME = 'KhedmatBD';
const PAGE_URL = abs('/jobs');
const PAGE_TITLE = `সকল খেদমত — ${SITE_NAME}`;
const PAGE_DESC =
  'বাংলাদেশের মাদরাসা, মসজিদ, ইসলামিক স্কুল ও সংস্থায় সর্বশেষ খেদমতের তালিকা দেখুন। ক্যাটেগরি, লোকেশন ও কীওয়ার্ডে খুঁজুন।';

// ---- Mock data (পরে API/DB যুক্ত করবেন) ----
const jobs = Array.from({ length: 9 }).map((_, i) => ({
  slug: `sample-${i + 1}`,
  title: ['আরবি শিক্ষক', 'কুরআন শিক্ষক', 'অফিস অ্যাডমিন', 'আইটি সাপোর্ট', 'ফান্ডরেইজিং অফিসার', 'ইমাম'][i % 6],
  org: ['আন-নূর মাদরাসা', 'দারুস সালাম', 'ইকরা একাডেমি', 'রহমা ট্রাস্ট', 'নূর মসজিদ', 'আল-ফালাহ ইনস্টিটিউট'][i % 6],
  location: ['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'মক্কা', 'মাদিনা', 'জেদ্দা'][i % 6],
  logo: '/placeholders/org-logo.png'
}));

export default function JobsListingPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ✅ SEO Helmet */}
      <Seo
        title={PAGE_TITLE}
        description={PAGE_DESC}
        canonical={PAGE_URL}
        ogImage={abs('/og/jobs.jpg')}
      />

      {/* Header */}
<header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur">
  <div className="mx-auto max-w-7xl px-4 md:px-6 h-16 flex items-center justify-between">

    {/* Left: Logo + Brand */}
    <Link href="/" className="flex items-center gap-3 group">
      {/* Logo badge */}
      <div className="w-10 h-10 rounded-xl bg-slate-900/60 ring-1 ring-white/10 shadow-sm backdrop-blur grid place-items-center overflow-hidden">
        <Image
          src="/site-logo-2025-09-21.png"   // <- আপনার নতুন লোগো ফাইলনেম
          alt="KhedmatBD"
          width={24}
          height={24}
          className="block object-contain"
          priority
        />
      </div>
      {/* Wordmark */}
      <span className="font-semibold tracking-tight group-hover:opacity-90">
        KhedmatBD
      </span>
    </Link>

    {/* Center: Nav */}
    <nav className="hidden md:flex items-center gap-6 text-sm">
      <Link href="/jobs" className="text-emerald-700 font-medium">খেদমতসমূহ</Link>
      <Link href="/about">আমাদের সম্পর্কে</Link>
      <Link href="/contact">যোগাযোগ</Link>
    </nav>

    {/* Right: CTA */}
    <Link
      href="/post-job"
      className="h-9 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
    >
      খেদমত পোস্ট করুন
    </Link>
  </div>
</header>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-8">
        <h1 className="text-2xl md:text-3xl font-semibold">সকল খেদমত</h1>

        {/* Filter bar (ডেমো) */}
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          <input placeholder="কীওয়ার্ড..." className="h-10 rounded-xl border px-3 bg-white/80 dark:bg-slate-900/60" />
          <select className="h-10 rounded-xl border px-3 bg-white/80 dark:bg-slate-900/60">
            <option>সব ক্যাটেগরি</option>
            <option>আরবি শিক্ষক</option>
            <option>কুরআন শিক্ষক</option>
            <option>ইমাম</option>
            <option>আইটি</option>
          </select>
          <select className="h-10 rounded-xl border px-3 bg-white/80 dark:bg-slate-900/60">
            <option>সব লোকেশন</option>
            <option>ঢাকা</option>
            <option>চট্টগ্রাম</option>
            <option>সিলেট</option>
          </select>
        </div>

        {/* Grid */}
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((j) => (
            <article
              key={j.slug}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-5 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <Image src={j.logo} alt={j.org} width={40} height={40} className="rounded-lg" />
                <div>
                  <h3 className="font-semibold line-clamp-1">{j.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{j.org} • {j.location}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  নতুন
                </span>
                <Link href={`/jobs/${j.slug}`} className="text-sm text-emerald-700 hover:underline">ডিটেইল</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
