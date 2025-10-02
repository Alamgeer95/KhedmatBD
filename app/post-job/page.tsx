// app/post-job/page.tsx
// Server Component (default) + Client Form (child)
// - S3-এ logo/jd ফাইল আপলোড
// - jobs/{slug}/job.json লিখে রাখে
// - সফল হলে /jobs/[slug] এ রিডাইরেক্ট
// - /jobs ও /jobs/[slug] রিভ্যালিডেট

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { putFile, putJson } from '@/lib/storage'
import PostJobForm from './PostJobForm'
import type { ActionState } from '@/types'

type Job = {
  title: string;
  description: string;
  hiringOrganization: {
    '@type': string;
    name: string;
    sameAs?: string;
    logo?: string;
  };
  jobLocation: {
    '@type': string;
    address: {
      '@type': string;
      addressLocality: string;
      addressRegion?: string;
      addressCountry: string;
    };
  };
  baseSalary?: {
    '@type': string;
    currency: string;
    value: {
      '@type': string;
      value: number;
      unitText: string;
    };
  };
  employmentType?: string;
  validThrough?: string;
  applicationUrl?: string;
  email?: string;
  jdFile?: string; // এটি যোগ করা হলো
  datePosted: string;
  published: boolean;
  slug: string;
};

// এই পেজে ডাইনামিক সার্ভার কোড আছে (Server Action + S3), তাই:
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ---------- ছোট util ----------
function slugifyOrg(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0980-\u09FF-]/g, '') // বাংলা সাপোর্ট যোগ
    .slice(0, 60) || 'default-job'; // খালি হলে ডিফল্ট
}

function extFromMime(mime?: string) {
  if (!mime) return ''
  if (mime === 'application/pdf') return '.pdf'
  if (mime === 'image/png') return '.png'
  if (mime === 'image/jpeg') return '.jpg'
  if (mime === 'image/webp') return '.webp'
  if (mime === 'application/msword') return '.doc'
  if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return '.docx'
  return ''
}

// ---------- Server Action ----------
async function createJobAction(_prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  'use server'

  // 1) ইনপুট পড়া + ভ্যালিডেশন (min)
  const title = (formData.get('title') as string || '').trim()
  const description = (formData.get('description') as string || '').trim()
  const orgName = (formData.get('orgName') as string || '').trim()
  const orgWebsite = (formData.get('orgWebsite') as string || '').trim() || undefined
  const email = (formData.get('email') as string || '').trim() || undefined
  const city = (formData.get('city') as string || '').trim()
  const region = (formData.get('region') as string || '').trim() || undefined
  const country = (formData.get('country') as string || 'BD').trim() || 'BD'
  const employmentType = (formData.get('employmentType') as string || undefined) as
    | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY' | undefined
  const validThrough = (formData.get('validThrough') as string || '').trim() || undefined
  const applicationUrl = (formData.get('applicationUrl') as string || '').trim() || undefined

  const salaryValueRaw = (formData.get('salaryValue') as string || '').trim()
  const salaryCurrency = (formData.get('salaryCurrency') as string || 'BDT').trim() || 'BDT'
  const salaryUnit = (formData.get('salaryUnit') as string || 'MONTH') as 'MONTH' | 'WEEK' | 'DAY'

  if (title.length < 3) return { ok: false, error: 'শিরোনাম কমপক্ষে ৩ অক্ষর দিন' }
  if (description.length < 20) return { ok: false, error: 'বর্ণনা কমপক্ষে ২০ অক্ষর দিন' }
  if (orgName.length < 2) return { ok: false, error: 'প্রতিষ্ঠানের নাম দিন' }
  if (city.length < 2) return { ok: false, error: 'শহর/উপজেলা দিন' }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'অবৈধ ইমেইল' }
if (applicationUrl && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w./?%&=\-]*)?$/i.test(applicationUrl)) {
   return { ok: false, error: 'অবৈধ URL: http/https সহ সঠিক ফরম্যাট দিন (যেমন: https://example.com/apply)' };
 }
  // 2) ইউনিক slug
  const base = slugifyOrg(`${title}-${city}`)
  const slug = `${base}-${Date.now().toString(36).slice(-4)}`

  // 3) ফাইল (logo, jd) — Max 5MB
  const logo = formData.get('logoFile') as File | null
  const jd = formData.get('jdFile') as File | null

  let logoKey: string | undefined
  let jdKey: string | undefined

  async function maybeUpload(key: string, f: File | null) {
    if (!f || f.size === 0) return undefined
    if (f.size > 5 * 1024 * 1024) throw new Error('ফাইল ৫MB এর কম হতে হবে')
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(f.type)) throw new Error('অনুমোদিত ফাইল টাইপ নয়')
    const ext = extFromMime(f.type)
    const finalKey = ext ? `${key}${ext}` : key
    const arrayBuffer = await f.arrayBuffer()
    const res = await putFile(finalKey, arrayBuffer, { contentType: f.type || 'application/octet-stream' })
    return res.url
  }

  try {
    logoKey = await maybeUpload(`jobs/${slug}/logo`, logo)
  } catch (e: any) {
    return { ok: false, error: 'লোগো আপলোড ব্যর্থ: ' + e.message }
  }

  try {
    jdKey = await maybeUpload(`jobs/${slug}/jd`, jd)
  } catch (e: any) {
    return { ok: false, error: 'খেদমতডেসক্রিপশন ফাইল আপলোড ব্যর্থ: ' + e.message }
  }

  // 4) JSON তৈরি
  const salaryValue = salaryValueRaw ? parseInt(salaryValueRaw, 10) : undefined
  const job: Job = {
  title,
  description,
  hiringOrganization: {  // নেস্টেড যোগ করুন
    '@type': 'Organization',  // jsonLd-এর মতো
    name: orgName,
    sameAs: orgWebsite,
    logo: logoKey,
  },
  jobLocation: {  // নেস্টেড যোগ করুন
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: region,
      addressCountry: country,
    },
  },
  baseSalary: salaryValue ? {  // নেস্টেড যোগ করুন
    '@type': 'MonetaryAmount',
    currency: salaryCurrency,
    value: {
      '@type': 'QuantitativeValue',
      value: salaryValue,
      unitText: salaryUnit,
    },
  } : undefined,
  employmentType,
  validThrough,
  applicationUrl,  // যদি থাকে
  email,  // অতিরিক্ত, jsonLd-এ নেই কিন্তু রাখতে পারেন
  jdFile: jdKey,  // অতিরিক্ত, পরে ডিসপ্লে যোগ করতে পারেন
  datePosted: new Date().toISOString(),
  published: true,  // এটা যোগ করুন যাতে !job.published false হয়
  slug,  // অতিরিক্ত, যদি দরকার
};

  // 5) S3-এ লেখা
  try {
    await putJson(`jobs/${slug}/job.json`, job)
  } catch (e: any) {
    return { ok: false, error: 'খেদমততথ্য সংরক্ষণ ব্যর্থ: ' + e.message }
  }

  // 6) Revalidate
  revalidatePath('/jobs');
revalidatePath(`/jobs/${slug}`);

  // 7) রিডাইরেক্ট
  redirect(`/post-job?posted=1`)
}

// 8)✅ সাকসেস ব্যানার কম্পোনেন্ট
function SuccessAlert() {
  return (
    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
      <strong className="font-medium">সফল!</strong>{" "}
      আপনার পোস্টটি সফলভাবে সার্ভারে জমা হয়েছে। অতি শীঘ্রই সাইটে প্রদর্শিত হবে।
    </div>
  );
}


export default function Page({ searchParams }: { searchParams?: Record<string, string> }) {
  const posted = searchParams?.posted === '1';

  return (
    <div className="mx-auto max-w-2xl p-4">
      {posted && <SuccessAlert />}         {/* 🔹 উপরে সাকসেস মেসেজ */}

      <PostJobForm createJobAction={createJobAction} />
    </div>
  );
}
