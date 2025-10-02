// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import Seo from "@/components/Seo";
import { abs } from "@/utils/abs";
import HeroAuroraHex from "@/components/HeroAuroraHex";
import logo from "components/site-logo.png";

const SITE_NAME = "KhedmatBD";
const SITE_URL = "https://khedmatbd.com";
const SITE_DESC =
  "“মাদরাসা, মসজিদ ও ইসলামিক প্রতিষ্ঠানের ইমানদীপ্ত যাত্রায়—আমরা সেই নিবেদিত প্ল্যাটফর্ম, যা যোগ্য ও নিষ্ঠাবানদের বাঁধে আস্থার বন্ধনে।”";

const featuredJobs = Array.from({ length: 6 }).map((_, i) => ({
  slug: `sample-${i + 1}`,
  title: ["আরবি শিক্ষক", "কুরআন শিক্ষক", "অ্যাডমিন অফিসার", "আইটি সাপোর্ট", "ফান্ডরেইজিং অফিসার", "ইমাম"][i % 6],
  org: ["আন-নূর মাদরাসা", "দারুস সালাম", "ইকরা একাডেমি", "রহমা ট্রাস্ট", "নূর মসজিদ", "আল-ফালাহ ইনস্টিটিউট"][i % 6],
  location: ["ঢাকা", "চট্টগ্রাম", "সিলেট", "মক্কা", "মাদিনা", "জেদ্দা"][i % 6],
  logo: "/placeholders/org-logo.png",
}));

const recentJobs = Array.from({ length: 6 }).map((_, i) => ({
  slug: `recent-${i + 1}`,
  title: ["কুরআন শিক্ষক", "আরবি শিক্ষক", "হাফেজ", "মুয়াজ্জিন", "খাদেম", "অফিস সহকারী"][i % 6],
  org: ["আল-হেরা ইসলামিক সেন্টার", "নুরুল কুরআন ফাউন্ডেশন", "বায়তুল আমান মসজিদ", "আল-ফুরকান মাদরাসা", "আল-ফালাহ ইনস্টিটিউট", "আন-নূর মাদরাসা"][i % 6],
  location: ["রাজশাহী", "খুলনা", "রংপুর", "ঢাকা", "সিলেট", "চট্টগ্রাম"][i % 6],
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
  const title = `মাদরাসা খেদমত খুঁজুন ও পোস্ট করুন — ${SITE_NAME}`;
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

  const IslamicPatternOverlay = () => (
    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="islamicPattern" patternUnits="userSpaceOnUse" width="10" height="10">
            {/* A more intricate pattern for greater visual interest */}
            <path
              d="M 5 0 L 10 5 L 5 10 L 0 5 Z M 0 0 L 5 5 M 5 5 L 10 0 M 5 5 L 5 10"
              fill="none"
              stroke="#c29660"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#islamicPattern)" />
      </svg>
    </div>
  );


  return (
    <main className="min-h-screen bg-[#0e1a30] text-[#f0f5ff]">
      {/* Background Geometric Shapes */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
        <div className="absolute top-[-20rem] left-[-20rem] w-[50rem] h-[50rem] bg-[#b88a4e]/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-[-25rem] right-[-15rem] w-[45rem] h-[45rem] bg-[#4e8a8a]/5 rounded-full filter blur-3xl"></div>
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

      {/* RECENT JOBS */}
      <section className="section container-app">
  <div className="mb-8 text-center">
    <h2 className="text-3xl font-bold tracking-tight">সাম্প্রতিক বিজ্ঞপ্তিসমূহ</h2>
  </div>
  


          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentJobs.map((j) => (
              <article key={j.slug} className="relative p-6 bg-[#1e2d4d] backdrop-blur-lg border border-[#b88a4e]/20 rounded-3xl shadow-lg shadow-white/[0.05] transition-all duration-300 hover:shadow-[#b88a4e]/10 hover:border-[#b88a4e]/50 hover:-translate-y-2 group overflow-hidden">
                <IslamicPatternOverlay />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-[#0e1a30] rounded-xl p-1 shadow-md border border-[#b88a4e]/20">
                    <Image src={j.logo} alt={j.org} width={40} height={40} className="rounded-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-[#b88a4e] transition-colors">{j.title}</h3>
                    <p className="text-sm text-[#a1b2d4] mt-1">
                      {j.org} • {j.location}
                    </p>
                  </div>
                </div>
                <div className="relative z-10 mt-5 flex items-center justify-between">
                  <Link href={`/jobs/${j.slug}`} className="text-sm font-semibold text-[#b88a4e] opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    বিস্তারিত দেখুন →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section container-app">
          <h2 className="text-3xl font-bold tracking-tight text-center">কিভাবে কাজ করে</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-8">
            {[
              { icon: "🔎", title: "সার্চ", desc: "ক্যাটাগরি, লোকেশন বা কীওয়ার্ড দিয়ে খেদমত খুঁজুন।" },
              { icon: "✍️", title: "অ্যাপ্লাই", desc: "প্রোফাইল বানিয়ে সহজে আবেদন করুন।" },
              { icon: "🤝", title: "হায়ার", desc: "এমপ্লয়ার শর্টলিস্ট করে যোগাযোগ করবে।" },
            ].map((s, i) => (
              <div key={i} className="relative text-center p-8 bg-[#1e2d4d] backdrop-blur-lg border border-[#b88a4e]/20 rounded-3xl shadow-lg shadow-white/[0.05] overflow-hidden group">
                 <IslamicPatternOverlay />
                <div className="relative z-10">
                  <div className="text-5xl inline-block bg-[#b88a4e]/[0.1] p-4 rounded-full transition-all duration-300 group-hover:bg-[#b88a4e]/[0.3] group-hover:scale-110">{s.icon}</div>
                  <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                  <p className="text-[#a1b2d4] mt-2">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURED JOBS */}
        <section className="section container-app">
  <div className="mb-8 relative">
    <h2 className="text-3xl font-bold tracking-tight text-center">
      ফিচার্ড খেদমতসমূহ
    </h2>
  </div>


          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((j) => (
              <article key={j.slug} className="relative p-6 bg-[#1e2d4d] backdrop-blur-lg border border-[#b88a4e]/20 rounded-3xl shadow-lg shadow-white/[0.05] transition-all duration-300 hover:shadow-[#b88a4e]/10 hover:border-[#b88a4e]/50 hover:-translate-y-2 group overflow-hidden">
                <IslamicPatternOverlay />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-[#0e1a30] rounded-xl p-1 shadow-md border border-[#b88a4e]/20">
                    <Image src={j.logo} alt={j.org} width={40} height={40} className="rounded-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-[#b88a4e] transition-colors">{j.title}</h3>
                    <p className="text-sm text-[#a1b2d4] mt-1">
                      {j.org} • {j.location}
                    </p>
                  </div>
                </div>
                <div className="relative z-10 mt-5 flex items-center justify-between">
                  <span className="badge badge-outline border-[#4e8a8a]/50 text-[#4e8a8a] bg-[#4e8a8a]/10">💎ফিচার্ড</span>
                  <Link href={`/jobs/${j.slug}`} className="text-sm font-semibold text-[#b88a4e] opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    বিস্তারিত দেখুন →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="section container-app">
          <h2 className="text-3xl font-bold tracking-tight text-center">জনপ্রিয় ক্যাটাগরি</h2>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link key={cat.key} href={`/jobs?cat=${cat.key}`} className="relative block p-6 text-center bg-[#1e2d4d] backdrop-blur-lg border border-[#b88a4e]/20 rounded-3xl shadow-lg shadow-white/[0.05] transition-all duration-300 hover:shadow-[#b88a4e]/10 hover:border-[#b88a4e]/50 hover:-translate-y-2 group overflow-hidden">
                <IslamicPatternOverlay />
                <div className="relative z-10">
                  <div className="text-4xl transition-transform duration-300 group-hover:scale-125">{cat.icon}</div>
                  <div className="mt-4 font-bold">{cat.name}</div>
                  <div className="text-sm text-[#a1b2d4]">ক্যাটাগরি দেখুন</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* BIG CTA */}
        <section className="section container-app">
          <div className="relative rounded-3xl bg-gradient-to-br from-[#b88a4e] to-[#c29660] text-[#0e1a30] p-8 md:p-16 text-center overflow-hidden shadow-2xl shadow-[#b88a4e]/20">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-16 -left-10 w-52 h-52 border-4 border-white/20 rounded-full"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                হায়ারিং হোক আরও দ্রুত, আবেদন হোক আরও স্মার্ট
              </h2>
              <p className="mt-4 max-w-xl mx-auto opacity-90">আজই খেদমত পোস্ট করুন অথবা আপনার সিভি জমা দিয়ে স্বপ্নের খেদমতের জন্য প্রস্তুত হোন।</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/post-job" className="btn btn-lg bg-[#0e1a30] text-[#f0f5ff] hover:bg-[#1a2d4a] rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  খেদমত পোস্ট করুন
                </Link>
                <Link href="/profile" className="btn btn-lg btn-outline border-[#f0f5ff]/50 text-[#f0f5ff] hover:bg-white/10 rounded-full hover:-translate-y-1 transition-all duration-300">
                  প্রোফাইল তৈরি করুন
                </Link>
              </div>
            </div>
          </div>
        </section>

        
      </div>
    </main>
  );
}
