// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import Seo from "@/components/Seo";
import { abs } from "@/utils/abs";
import HeroAuroraHex from "@/components/HeroAuroraHex";

const SITE_NAME = "KhedmatBD";
const SITE_URL = "https://khedmatbd.com";
const SITE_DESC =
  "মাদরাসা, মসজিদ, ইসলামিক স্কুল ও সংস্থার জন্য নিবেদিত বাংলাদেশের সেরা খেদমত প্ল্যাটফর্ম।";

const featuredJobs = Array.from({ length: 6 }).map((_, i) => ({
  slug: `sample-${i + 1}`,
  title: ["আরবি শিক্ষক", "কুরআন শিক্ষক", "অ্যাডমিন অফিসার", "আইটি সাপোর্ট", "ফান্ডরেইজিং অফিসার", "ইমাম"][i % 6],
  org: ["আন-নূর মাদরাসা", "দারুস সালাম", "ইকরা একাডেমি", "রহমা ট্রাস্ট", "নূর মসজিদ", "আল-ফালাহ ইনস্টিটিউট"][i % 6],
  location: ["ঢাকা", "চট্টগ্রাম", "সিলেট", "মক্কা", "মাদিনা", "জেদ্দা"][i % 6],
  logo: "/placeholders/org-logo.png",
}));

const categories = [
  { key: "arabic", name: "আরবি শিক্ষক", icon: "🗣️" },
  { key: "quran", name: "কুরআন শিক্ষক", icon: "📖" },
  { key: "fiqh", name: "ফিকহ/উসূল", icon: "⚖️" },
  { key: "hadith", name: "হাদীস", icon: "📚" },
  { key: "imam", name: "ইমাম/খতীব", icon: "🕌" },
  { key: "admin", name: "অ্যাডমিনিস্ট্রেশন", icon: "🧩" },
  { key: "it", name: "আইটি ও সাপোর্ট", icon: "💻" },
  { key: "ngo", name: "সংস্থার ও সামাজিক", icon: "🤝" },
];

export default function HomePage() {
  const title = `মাদরাসা চাকরি খুঁজুন ও পোস্ট করুন — ${SITE_NAME}`;
  const ogImage = `${SITE_URL}/og/home.jpg`;

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "bn-BD",
    description: SITE_DESC,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/jobs?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    sameAs: [
      "https://facebook.com/",
      "https://twitter.com/",
      "https://www.linkedin.com/",
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 overflow-hidden">
      {/* Background Geometric Shapes */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
        <div className="absolute top-[-20rem] left-[-20rem] w-[50rem] h-[50rem] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-[-25rem] right-[-15rem] w-[45rem] h-[45rem] bg-teal-500/5 dark:bg-teal-500/10 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <Seo
          title={title}
          description={SITE_DESC}
          canonical={abs("/")}
          ogImage={ogImage}
          jsonLd={[websiteJsonLd, orgJsonLd]}
        />

 
      <HeroAuroraHex siteDesc={SITE_DESC} />

        {/* HOW IT WORKS */}
        <section className="section container-app">
          <h2 className="text-3xl font-bold tracking-tight text-center">কিভাবে কাজ করে</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-8">
            {[
              { icon: "🔎", title: "সার্চ", desc: "ক্যাটেগরি, লোকেশন বা কীওয়ার্ড দিয়ে খেদমত খুঁজুন।" },
              { icon: "✍️", title: "অ্যাপ্লাই", desc: "প্রোফাইল বানিয়ে সহজে আবেদন করুন।" },
              { icon: "🤝", title: "হায়ার", desc: "এমপ্লয়ার শর্টলিস্ট করে যোগাযোগ করবে।" },
            ].map((s, i) => (
              <div key={i} className="text-center p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-lg shadow-slate-500/5">
                <div className="text-5xl inline-block bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-full">{s.icon}</div>
                <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-2">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURED JOBS */}
        <section className="section container-app">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold tracking-tight">ফিচার্ড খেদমতসমূহ</h2>
            <Link href="/jobs" className="btn btn-sm btn-outline rounded-full">সব দেখুন</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((j) => (
              <article key={j.slug} className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-lg shadow-slate-500/5 transition-all duration-300 hover:shadow-emerald-500/10 hover:border-emerald-500/50 hover:-translate-y-2 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-white dark:bg-slate-800 rounded-xl p-1 shadow-md">
                    <Image src={j.logo} alt={j.org} width={40} height={40} className="rounded-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{j.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {j.org} • {j.location}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="badge badge-outline border-emerald-500/50 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10">💎ফিচার্ড</span>
                  <Link href={`/jobs/${j.slug}`} className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    বিস্তারিত দেখুন →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="section container-app">
          <h2 className="text-3xl font-bold tracking-tight text-center">জনপ্রিয় ক্যাটেগরি</h2>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link key={cat.key} href={`/jobs?cat=${cat.key}`} className="block p-6 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-lg shadow-slate-500/5 transition-all duration-300 hover:shadow-emerald-500/10 hover:border-emerald-500/50 hover:-translate-y-2 group">
                <div className="text-4xl transition-transform duration-300 group-hover:scale-125">{cat.icon}</div>
                <div className="mt-4 font-bold">{cat.name}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">ক্যাটেগরি দেখুন</div>
              </Link>
            ))}
          </div>
        </section>

        {/* BIG CTA */}
        <section className="section container-app">
          <div className="relative rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-8 md:p-16 text-center overflow-hidden shadow-2xl shadow-emerald-500/20">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-16 -left-10 w-52 h-52 border-4 border-white/20 rounded-full"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                হায়ারিং হোক আরও দ্রুত, আবেদন হোক আরও স্মার্ট
              </h2>
              <p className="mt-4 max-w-xl mx-auto opacity-90">আজই খেদমত পোস্ট করুন অথবা আপনার সিভি জমা দিয়ে স্বপ্নের খেদমতের জন্য প্রস্তুত হোন।</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/post-job" className="btn btn-lg bg-white text-emerald-700 hover:bg-slate-100 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  খেদমত পোস্ট করুন
                </Link>
                <Link href="/signup" className="btn btn-lg btn-outline border-white/50 text-white hover:bg-white/10 rounded-full hover:-translate-y-1 transition-all duration-300">
                  প্রোফাইল তৈরি করুন
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 dark:border-slate-800 mt-12">
          <div className="container-app py-12 grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-lg">🕌</span>
                {SITE_NAME}
              </Link>
              <p className="text-slate-600 dark:text-slate-400 mt-4 text-sm">
                ইসলামিক শিক্ষা ও কমিউনিটি খেদমতের বিশ্বমানের প্ল্যাটফর্ম।
              </p>
            </div>
            <div>
              <div className="font-semibold text-lg">লিংকস</div>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/jobs" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">খেদমতসমূহ</Link></li>
                <li><Link href="/post-job" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">খেদমত পোস্ট</Link></li>
                <li><Link href="/about" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">আমাদের সম্পর্কে</Link></li>
                <li><Link href="/contact" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">যোগাযোগ</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-lg">লিগ্যাল</div>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">প্রাইভেসি</Link></li>
                <li><Link href="/terms" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">টার্মস</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-lg">ফলো করুন</div>
              <div className="mt-4 flex gap-3 text-2xl">
                <Link href="https://facebook.com" aria-label="Facebook" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">👍</Link>
                <Link href="https://twitter.com" aria-label="Twitter" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">🐦</Link>
                <Link href="https://linkedin.com" aria-label="LinkedIn" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">🔗</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800">
              <div className="text-sm text-slate-500 text-center py-6 container-app">
                  © {new Date().getFullYear()} {SITE_NAME}. সর্বস্বত্ব সংরক্ষিত।
              </div>
          </div>
        </footer>
      </div>
    </main>
  );
}