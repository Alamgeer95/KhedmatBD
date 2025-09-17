// utils/seo.ts
export type Job = {
  title: string;
  description: string;
  datePosted: string;            // ISO string
  employmentType?: string;       // FULL_TIME, PART_TIME, CONTRACTOR, TEMPORARY, INTERN, VOLUNTEER, PER_DIEM, OTHER
  hiringOrganization: {
    name: string;
    sameAs?: string;             // org website
    logo?: string;               // absolute URL preferred
  };
  jobLocation: {
    address: {
      streetAddress?: string;
      addressLocality?: string;  // city
      addressRegion?: string;    // state/division
      postalCode?: string;
      addressCountry: string;    // ISO code like "BD", "SA"
    };
  };
  baseSalary?: {
    currency: string;            // e.g. "BDT"
    value: {
      minValue?: number;
      maxValue?: number;
      value?: number;
      unitText: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
    };
  };
  validThrough?: string;         // ISO string (deadline)
  experienceRequirements?: string;
  educationRequirements?: string;
  industry?: string;
  responsibilities?: string;
  skills?: string;
  url?: string;                  // canonical job URL
};

export function buildJobPostingJsonLd(job: Job) {
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.datePosted,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.hiringOrganization.name,
      sameAs: job.hiringOrganization.sameAs,
      logo: job.hiringOrganization.logo
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        ...job.jobLocation.address
      }
    }
  };

  if (job.employmentType) jsonLd.employmentType = job.employmentType;
  if (job.baseSalary) {
    jsonLd.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: job.baseSalary.currency,
      value: {
        '@type': 'QuantitativeValue',
        ...job.baseSalary.value
      }
    };
  }
  if (job.validThrough) jsonLd.validThrough = job.validThrough;
  if (job.experienceRequirements) jsonLd.experienceRequirements = job.experienceRequirements;
  if (job.educationRequirements) jsonLd.educationRequirements = job.educationRequirements;
  if (job.industry) jsonLd.industry = job.industry;
  if (job.responsibilities) jsonLd.responsibilities = job.responsibilities;
  if (job.skills) jsonLd.skills = job.skills;
  if (job.url) jsonLd.url = job.url;

  return jsonLd;
}
