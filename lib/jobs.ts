// lib/jobs.ts

export type Job = {
  slug: string
  title: string
  description: string
  employmentType?: string
  datePosted: string            // ISO date string
  validThrough?: string         // ISO date string
  hiringOrganization: {
    name: string
    sameAs?: string
    logo?: string
  }
  jobLocation: {
    addressLocality: string
    addressRegion?: string
    addressCountry: string
  }
  baseSalary?: {
    currency: string
    value: number
    unitText: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'
  }
  published?: boolean
}

// ডেমো ডাটা (প্রয়োজনে API/DB দিয়ে রিপ্লেস করুন)
const jobs: Job[] = [
  {
    slug: 'sample-1',
    title: 'আরবি শিক্ষক',
    description: 'হিফজ বিভাগে আরবি শিক্ষক নিয়োগ...',
    employmentType: 'FULL_TIME',
    datePosted: '2025-09-10',
    validThrough: '2025-10-10',
    hiringOrganization: {
      name: 'আন-নূর মাদরাসা',
      logo: '/logo.svg',
      sameAs: 'https://example.com',
    },
    jobLocation: {
      addressLocality: 'ঢাকা',
      addressCountry: 'BD',
    },
    baseSalary: { currency: 'BDT', value: 35000, unitText: 'MONTH' },
    published: true,
  },
  {
    slug: 'sample-2',
    title: 'কুরআন শিক্ষক',
    description: 'নূরানি ও হিফজ উভয় সেকশনে কুরআন শিক্ষক প্রয়োজন।',
    employmentType: 'FULL_TIME',
    datePosted: '2025-09-09',
    hiringOrganization: {
      name: 'দারুস সালাম',
      logo: '/logo.svg',
    },
    jobLocation: {
      addressLocality: 'চট্টগ্রাম',
      addressCountry: 'BD',
    },
    published: true,
  },
]

export async function getJob(slug: string): Promise<Job | null> {
  return jobs.find((j) => j.slug === slug) || null
}

export async function getAllJobs(): Promise<Job[]> {
  return jobs
}
