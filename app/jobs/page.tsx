import Link from "next/link";
import Image from "next/image";
import Seo from "@/components/Seo";
import { abs } from "@/utils/abs";
import { listObjectsWithMeta, getJson } from '@/lib/storage'; // getJson ইম্পোর্ট করা হলো

async function getAllJobs() {
  const items = await listObjectsWithMeta('jobs/'); // S3 থেকে সব খেদমতলোড
  const jobs = [];
  for (const item of items) {
    if (item.Key.endsWith('job.json')) {
      const slug = item.Key.split('/')[1]; // slug এক্সট্র্যাক্ট
      const jobData = await getJson(item.Key); // job.json পড়ুন
      if (jobData && jobData.published) { // শুধুমাত্র প্রকাশিত খেদমতযোগ
        jobs.push({
          slug: slug,
          title: jobData.title || 'শিরোনাম নেই',
          org: jobData.hiringOrganization?.name || 'নাম নেই',
          location: jobData.jobLocation?.address?.addressLocality || 'লোকেশন নেই',
          logo: jobData.hiringOrganization?.logo || '/placeholders/org-logo.png',
        });
      }
    }
  }
  console.log('Found jobs:', jobs); // ডিবাগ লগ যোগ
  return jobs;
}

export default async function JobsListingPage() {
  const jobs = await getAllJobs(); // S3 থেকে লোড
  const title = "সকল খেদমত";
  const desc = "বাংলাদেশের মাদরাসা, মসজিদ, ইসলামিক স্কুল ও এনজিওতে সর্বশেষ খেদমত।";

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
                কোনো খেদমতপাওয়া যায়নি।
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}