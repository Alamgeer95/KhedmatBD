// app/jobs/page.tsx
import Link from "next/link";
import Image from "next/image";
import Seo from "@/components/Seo";
import { abs } from "@/utils/abs";

// ডেমো ডাটা
const jobs = Array.from({ length: 9 }).map((_, i) => ({
  slug: `sample-${i + 1}`,
  title: [
    "আরবি শিক্ষক",
    "কুরআন শিক্ষক",
    "অফিস অ্যাডমিন",
    "আইটি সাপোর্ট",
    "ফান্ডরেইজিং অফিসার",
    "ইমাম",
  ][i % 6],
  org: [
    "আন-নূর মাদরাসা",
    "দারুস সালাম",
    "ইকরা একাডেমি",
    "রহমা ট্রাস্ট",
    "নূর মসজিদ",
    "আল-ফালাহ ইনস্টিটিউট",
  ][i % 6],
  location: ["ঢাকা", "চট্টগ্রাম", "সিলেট", "মক্কা", "মাদিনা", "জেদ্দা"][i % 6],
  logo: "/placeholders/org-logo.png",
}));

export default function JobsListingPage() {
  const title = "সকল চাকরি";
  const desc =
    "বাংলাদেশের মাদরাসা, মসজিদ, ইসলামিক স্কুল ও এনজিওতে সর্বশেষ চাকরি।";

  return (
    <>
      <Seo
        title={title}
        description={desc}
        canonical={abs("/jobs")}
        ogImage={abs("/og/jobs.jpg")}
      />
      <main className="min-h-screen bg-[#0e1a30] text-[#f0f5ff]">
        {/* হেডার */}
        <section className="mx-auto max-w-7xl px-4 md:px-6 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-[#b88a4e]">
            {title}
          </h1>
          <p className="text-center text-[#a1b2d4] mt-3">{desc}</p>

          {/* Filter bar */}
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <input
              placeholder="কীওয়ার্ড..."
              className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#b88a4e]"
            />
            <select className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#b88a4e]">
              <option>সব ক্যাটেগরি</option>
              <option>আরবি শিক্ষক</option>
              <option>কুরআন শিক্ষক</option>
              <option>ইমাম</option>
              <option>আইটি</option>
            </select>
            <select className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#b88a4e]">
              <option>সব লোকেশন</option>
              <option>ঢাকা</option>
              <option>চট্টগ্রাম</option>
              <option>সিলেট</option>
            </select>
          </div>

          {/* Grid */}
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((j) => (
              <article
                key={j.slug}
                className="p-6 bg-[#1e2d4d] border border-[#b88a4e]/20 rounded-3xl shadow-lg shadow-white/[0.05] transition-all duration-300 hover:shadow-[#b88a4e]/10 hover:border-[#b88a4e]/50 hover:-translate-y-2 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-[#0e1a30] rounded-xl p-1 shadow-md border border-[#b88a4e]/20">
                    <Image
                      src={j.logo}
                      alt={j.org}
                      width={40}
                      height={40}
                      className="rounded-lg"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-[#b88a4e] transition-colors">
                      {j.title}
                    </h3>
                    <p className="text-sm text-[#a1b2d4] mt-1">
                      {j.org} • {j.location}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs px-3 py-1 rounded-full border border-[#4e8a8a]/50 text-[#4e8a8a] bg-[#4e8a8a]/10">
                    ✨ নতুন
                  </span>
                  <Link
                    href={`/jobs/${j.slug}`}
                    className="text-sm font-semibold text-[#b88a4e] opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300"
                  >
                    বিস্তারিত →
                  </Link>
                </div>
              </article>
            ))}

            {jobs.length === 0 && (
              <div className="col-span-full text-center text-[#a1b2d4] py-10">
                কোনো জব পাওয়া যায়নি।
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
