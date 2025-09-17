import Link from 'next/link';
import { getJob } from '@/lib/jobs';
import Seo from '@/components/Seo';
import { abs } from '@/utils/abs';

export default async function JobDetails({ params }: { params: Promise<{ slug: string }> }) {
  const p = await params;
  const job = await getJob(p.slug);

  if (!job || !job.published) {
    return (
      <main className="min-h-[50vh] grid place-items-center">
        <Seo title="খেদমত পাওয়া যায়নি" noindex canonical={abs(`/jobs/${p.slug}`)} />
        <div>খেদমত পাওয়া যায়নি</div>
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
      name: job.hiringOrganization.name,
      sameAs: job.hiringOrganization.sameAs || undefined,
      logo: job.hiringOrganization.logo || undefined,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.jobLocation.addressLocality,
        addressRegion: job.jobLocation.addressRegion || undefined,
        addressCountry: job.jobLocation.addressCountry,
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

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Seo
        title={`${job.title} — ${job.hiringOrganization?.name || 'KhedmatBD'}`}
        description={(job.description || '').slice(0, 160)}
        canonical={canonical}
        ogImage={ogImage}
        jsonLd={jsonLd}
      />
      <section className="mx-auto max-w-3xl px-4 md:px-6 py-10">
        <Link href="/jobs" className="text-sm text-emerald-700 hover:underline">← সব খেদমত</Link>
        <h1 className="text-3xl font-bold mt-3">{job.title}</h1>
        <div className="text-slate-600 dark:text-slate-300">{job.hiringOrganization?.name}</div>
        <div className="text-sm text-slate-500">
          {[
            job.jobLocation?.addressLocality,
            job.jobLocation?.addressRegion,
            job.jobLocation?.addressCountry,
          ].filter(Boolean).join(', ')}
        </div>

        <article className="prose dark:prose-invert mt-6 max-w-none whitespace-pre-wrap">
          {job.description}
        </article>

        <div className="mt-6">
          <Link href={`/apply/${job.slug}`} className="h-11 inline-flex items-center px-5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
            Apply Now
          </Link>
        </div>
      </section>
    </main>
  );
}
