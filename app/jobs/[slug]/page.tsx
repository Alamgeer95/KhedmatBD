// app/jobs/[slug]/page.tsx
import Link from 'next/link';
import { getJob } from '@/lib/jobs';
import Seo from '@/components/Seo';
import { abs } from '@/utils/abs';
import CopyLinkButton from '@/components/CopyLinkButton';

type Job = {
  title: string;
  description: string;
  hiringOrganization?: {
    name?: string;
    sameAs?: string;
    logo?: string;
  };
  jobLocation?: {
    addressLocality?: string;
    addressRegion?: string;
    addressCountry?: string;
  };
  baseSalary?: {
    value?: number;
    currency?: string;
    unitText?: string;
  };
  employmentType?: string;
  validThrough?: string;
  jdFile?: string; // এটি যোগ করা হলো
  datePosted?: string;
  published?: boolean;
  slug?: string;
};

export default async function JobDetails({ params }: { params: { slug: string } }) {
  const p = params;
  const job: Job = await getJob(p.slug);
console.log('Loaded job for slug', p.slug, ':', job); // সার্ভার লগ চেক করুন

  if (!job || !job.published) {
    return (
      <main className="min-h-[50vh] grid place-items-center bg-[#0e1a30] text-[#f0f5ff]">
        <Seo title="খেদমত পাওয়া যায়নি" noindex canonical={abs(`/jobs/${p.slug}`)} />
        <div className="text-[#a1b2d4]">খেদমত পাওয়া যায়নি</div>
      </main>
    );
  }

  const canonical = abs(`/jobs/${job.slug}`);
  const ogDynamic = abs(`/api/og/jobs/${job.slug}`);
  const ogImage = ogDynamic || abs('/og/job-default.jpg');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.datePosted,
    validThrough: job.validThrough || undefined,
    employmentType: job.employmentType || undefined,
    hiringOrganization: {
       '@type': 'Organization',
      name: job.hiringOrganization?.name,
      sameAs: job.hiringOrganization?.sameAs || undefined,
      logo: job.hiringOrganization?.logo || undefined,
     },
    jobLocation: {
       '@type': 'Place',
       address: {
         '@type': 'PostalAddress',
        addressLocality: job.jobLocation?.addressLocality,
        addressRegion: job.jobLocation?.addressRegion || undefined,
        addressCountry: job.jobLocation?.addressCountry,
       },
     },
    ...(job.baseSalary
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: job.baseSalary.currency,
            value: {
              '@type': 'QuantitativeValue',
              value: job.baseSalary.value,
              unitText: job.baseSalary.unitText,
            },
          },
        }
      : {}),
  };

  // Helpers
  const locationText = [
    job.jobLocation?.addressLocality,
    job.jobLocation?.addressRegion,
    job.jobLocation?.addressCountry,
  ].filter(Boolean).join(', ');

  const toArray = (v: unknown) =>
    Array.isArray(v) ? v as string[] : (typeof v === 'string' ? [v] : []);

  const ensureHttp = (u?: string) => {
    if (!u) return undefined;
    const t = u.trim();
    if (/^https?:\/\//i.test(t)) return t;
    if (/^\/\//.test(t)) return `https:${t}`;
    return `https://${t}`;
  };

  // ✅ Robust website detection (handles many possible fields)
  const orgLinksRaw = [
    ...toArray(job.hiringOrganization?.sameAs),
    ...toArray((job.hiringOrganization as any)?.links),
    (job.hiringOrganization as any)?.url,
    (job.hiringOrganization as any)?.website,
    (job.hiringOrganization as any)?.homepage,
    (job.hiringOrganization as any)?.site,
  ].filter(Boolean) as string[];

  const orgLinks = orgLinksRaw
    .map(ensureHttp)
    .filter(Boolean) as string[];

  const orgWebsite = orgLinks[0]; // প্রথম বৈধ লিংক

  return (
    <main className="min-h-screen bg-[#0e1a30] text-[#f0f5ff] overflow-x-hidden">
      <Seo
        title={`${job.title} — ${job.hiringOrganization?.name || 'KhedmatBD'}`}
        description={(job.description || '').slice(0, 160)}
        canonical={canonical}
        ogImage={ogImage}
        jsonLd={jsonLd}
      />

      {/* Background geometric glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20rem] left-[-20rem] w-[50rem] h-[50rem] bg-[#b88a4e]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-25rem] right-[-15rem] w-[45rem] h-[45rem] bg-[#4e8a8a]/5 rounded-full blur-3xl" />
      </div>

      <section className="mx-auto max-w-6xl px-4 md:px-6 py-12">
        {/* Back link */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#b88a4e] hover:underline"
        >
          ← সব খেদমত
        </Link>

        {/* দুই-কলাম লেআউট: কন্টেন্ট + সাইডবার (মোবাইলে সাইডবার নিচে যাবে) */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main content */}
          <div>
            {/* Heading card */}
            <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg shadow-black/20">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">{job.title}</h1>
              <div className="mt-2 text-[#a1b2d4]">{job.hiringOrganization?.name}</div>
              <div className="mt-1 text-sm text-[#a1b2d4]">{locationText}</div>

              {/* Meta pills */}
              <div className="mt-4 flex flex-wrap gap-2">
                {job.employmentType && (
                  <span className="text-xs px-3 py-1 rounded-full border border-white/15 bg-white/5">
                    {job.employmentType}
                  </span>
                )}
                {job.datePosted && (
                  <span className="text-xs px-3 py-1 rounded-full border border-white/15 bg-white/5">
                    পোস্টেড: {new Date(job.datePosted).toLocaleDateString('bn-BD')}
                  </span>
                )}
                {job.validThrough && (
                  <span className="text-xs px-3 py-1 rounded-full border border-white/15 bg-white/5">
                    ডেডলাইন: {new Date(job.validThrough).toLocaleDateString('bn-BD')}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <article className="prose prose-invert mt-6 max-w-none">
  <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg shadow-black/20 whitespace-pre-wrap">
    {job.description}
    {job.jdFile && (
      <a href={job.jdFile} target="_blank" rel="noopener noreferrer" className="text-[#b88a4e] hover:underline">
        খেদমতডেসক্রিপশন ফাইল ডাউনলোড করুন (PDF/DOC)
      </a>
    )}
  </div>
</article>
          </div>

          {/* Sidebar card — সব স্ক্রিনে দেখা যাবে */}
          <aside>
            <div className="lg:sticky lg:top-24">
              <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg shadow-black/20">
                <div className="text-lg font-bold text-[#b88a4e] text-center">খেদমতসামারি</div>

                <ul className="mt-4 space-y-3 text-sm text-[#a1b2d4]">
                  {job.baseSalary?.value && job.baseSalary?.currency && (
                    <li className="flex items-start justify-between gap-3">
                      <span>বেতন</span>
                      <span className="text-[#f0f5ff] font-semibold">
                        {job.baseSalary.value} {job.baseSalary.currency}
                        {job.baseSalary.unitText ? ` / ${job.baseSalary.unitText}` : ''}
                      </span>
                    </li>
                  )}

                  {job.employmentType && (
                    <li className="flex items-start justify-between gap-3">
                      <span>টাইপ</span>
                      <span className="text-[#f0f5ff] font-semibold">{job.employmentType}</span>
                    </li>
                  )}

                  {locationText && (
                    <li className="flex items-start justify-between gap-3">
                      <span>লোকেশন</span>
                      <span className="text-right text-[#f0f5ff] font-semibold">
                        {locationText}
                      </span>
                    </li>
                  )}

                  {job.validThrough && (
                    <li className="flex items-start justify-between gap-3">
                      <span>ডেডলাইন</span>
                      <span className="text-[#f0f5ff] font-semibold">
                        {new Date(job.validThrough).toLocaleDateString('bn-BD')}
                      </span>
                    </li>
                  )}

                  {/* ✅ Website row will show if any supported field exists */}
                  {orgWebsite && (
                    <li className="flex items-start justify-between gap-3">
                      <span>ওয়েবসাইট</span>
                      <a
                        href={orgWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#b88a4e] hover:underline break-all text-right"
                      >
                        ভিজিট করুন
                      </a>
                    </li>
                  )}
                </ul>

                <div className="mt-6">
                  <Link
                    href={`/apply/${job.slug}`}
                    className="h-12 inline-flex items-center justify-center px-6 rounded-full bg-[#b88a4e] text-[#0e1a30] font-semibold shadow-lg hover:-translate-y-0.5 transition-all duration-300 hover:bg-[#c29660] w-full"
                  >
                    Apply Now
                  </Link>
                </div>

                {/* শেয়ার */}
                <div className="mt-4 text-xs text-[#a1b2d4]">
                  শেয়ার করুন:
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-full border border-white/15 bg-white/5 hover:border-[#b88a4e]/50 transition"
                    >
                      Facebook
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(canonical)}&text=${encodeURIComponent(job.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-full border border-white/15 bg-white/5 hover:border-[#b88a4e]/50 transition"
                    >
                      X
                    </a>
                    <CopyLinkButton url={canonical} />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
