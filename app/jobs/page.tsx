// app/jobs/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import Seo from '@/components/Seo';
import { abs } from '@/utils/abs';

// ডেমো ডাটা
const jobs = Array.from({ length: 9 }).map((_, i) => ({
  slug: `sample-${i + 1}`,
  title: ['আরবি শিক্ষক','কুরআন শিক্ষক','অফিস অ্যাডমিন','আইটি সাপোর্ট','ফান্ডরেইজিং অফিসার','ইমাম'][i%6],
  org: ['আন-নূর মাদরাসা','দারুস সালাম','ইকরা একাডেমি','রহমা ট্রাস্ট','নূর মসজিদ','আল-ফালাহ ইনস্টিটিউট'][i%6],
  location: ['ঢাকা','চট্টগ্রাম','সিলেট','মক্কা','মাদিনা','জেদ্দা'][i%6],
  logo: '/placeholders/org-logo.png'
}));

export default function JobsListingPage() {
  const title = 'সকল চাকরি';
  const desc = 'বাংলাদেশের মাদরাসা, মসজিদ, ইসলামিক স্কুল ও এনজিওতে সর্বশেষ চাকরি।';

  return (
    <>
      <Seo title={title} description={desc} canonical={abs('/jobs')} ogImage={abs('/og/jobs.jpg')} />
      <main className="min-h-screen">
        <section className="mx-auto max-w-7xl px-4 md:px-6 py-8">
          <h1 className="text-2xl md:text-3xl font-semibold">{title}</h1>

          {/* Filter bar (ডেমো) */}
          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <input placeholder="কীওয়ার্ড..." className="h-10 rounded-xl border px-3" />
            <select className="h-10 rounded-xl border px-3">
              <option>সব ক্যাটেগরি</option><option>আরবি শিক্ষক</option><option>কুরআন শিক্ষক</option><option>ইমাম</option><option>আইটি</option>
            </select>
            <select className="h-10 rounded-xl border px-3">
              <option>সব লোকেশন</option><option>ঢাকা</option><option>চট্টগ্রাম</option><option>সিলেট</option>
            </select>
          </div>

          {/* Grid */}
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((j) => (
              <article key={j.slug} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-5 hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <Image src={j.logo} alt={j.org} width={40} height={40} className="rounded-lg" />
                  <div>
                    <h3 className="font-semibold line-clamp-1">{j.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{j.org} • {j.location}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">নতুন</span>
                  <Link href={`/jobs/${j.slug}`} className="text-sm text-emerald-700 hover:underline">ডিটেইল</Link>
                </div>
              </article>
            ))}
            {jobs.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-10">কোনো জব পাওয়া যায়নি।</div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
