'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AnimatePresence, motion } from 'framer-motion'
import {
  User as UserIcon,
  MapPin,
  Globe2,
  Briefcase,
  GraduationCap,
  Languages,
  FolderGit2,
  FileText,
  Bell,
  MessageSquare,
  CalendarClock,
  Shield,
  Settings,
  Building2,
  CheckCircle2,
  XCircle,
  Camera,
  Link2,
  Plus,
  ExternalLink,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Unified Profile Page (candidate + employer) — Tailwind + framer-motion only
// NOTE: This is a functional, responsive UI skeleton wired to Supabase client.
// Hook up your DB tables (see TODOs) to make it live.
// ---------------------------------------------------------------------------

const supabase = createClient()

// Lightweight UI primitives --------------------------------------------------
function Card({ className = '', children }: any) {
  return (
    <div className={`rounded-2xl border border-emerald-500/15 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-lg shadow-emerald-500/10 ${className}`}>
      {children}
    </div>
  )
}
function SectionTitle({ title, right }: any) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-lg md:text-xl font-bold tracking-tight">{title}</h3>
      {right}
    </div>
  )
}
function Badge({ children, className = '' }: any) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 ${className}`}>{children}</span>
  )
}
function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      />
    </div>
  )
}

// Types mirroring your schema guide -----------------------------------------
export type Role = 'candidate' | 'employer'
export type Profile = {
  id: string
  role: Role
  full_name: string | null
  headline: string | null
  avatar_url: string | null
  phone: string | null
  location: string | null
  languages: any | null // jsonb
  about: string | null
  visibility: 'public' | 'private' | null
  profile_score: number | null
}

// Page -----------------------------------------------------------------------
export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  // Related data (lazy loaded):
  const [experiences, setExperiences] = useState<any[]>([])
  const [educations, setEducations] = useState<any[]>([])
  const [skills, setSkills] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [org, setOrg] = useState<any | null>(null) // if employer

  useEffect(() => {
    ;(async () => {
      const { data: auth } = await supabase.auth.getUser()
      const uid = auth.user?.id || null
      if (!uid) {
        router.replace('/auth') // 🔒 protect profile page when not logged in
        return
      }
      setSessionUserId(uid)

      // --- Load profile
      // TODO: switch to RLS-enabled RPC or select from 'profiles'
      const { data: p, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single()
      if (pErr) console.error('profiles error', pErr)
      setProfile(p as any)

      // Candidate tables ------------------------------------------------------
      if (p?.role === 'candidate') {
        const [{ data: ex }, { data: ed }, { data: sk }, { data: docs }] = await Promise.all([
          supabase.from('candidate_experiences').select('*').order('start_date', { ascending: false }).eq('candidate_id', uid),
          supabase.from('candidate_educations').select('*').order('end_year', { ascending: false }).eq('candidate_id', uid),
          supabase.from('candidate_skills').select('*').eq('candidate_id', uid),
          supabase.from('candidate_documents').select('*').eq('candidate_id', uid),
        ])
        setExperiences(ex || [])
        setEducations(ed || [])
        setSkills(sk || [])
        setDocuments(docs || [])
      }

      // Employer tables -------------------------------------------------------
      if (p?.role === 'employer') {
        const { data: orgRow } = await supabase
          .from('organizations')
          .select('*')
          .eq('owner_id', uid)
          .maybeSingle()
        setOrg(orgRow)
      }

      setLoading(false)
    })()
  }, [router])

  // Compute completeness (client-only heuristic to show progress immediately)
  const completeness = useMemo(() => {
    if (!profile) return 0
    const checks = [
      !!profile.full_name,
      !!profile.avatar_url,
      !!profile.headline,
      !!profile.location,
      !!(experiences?.length || 0),
      !!(educations?.length || 0),
      !!(skills?.length || 0),
      !!(profile.languages && Object.keys(profile.languages || {}).length),
      !!profile.about,
    ]
    const base = Math.round((checks.filter(Boolean).length / checks.length) * 100)
    return Math.max(base, profile.profile_score ?? 0)
  }, [profile, experiences, educations, skills])

  if (loading) {
    return (
      <main className="container-app py-10">
        <div className="animate-pulse grid gap-6">
          <div className="h-28 rounded-2xl bg-slate-200/40 dark:bg-slate-800/40" />
          <div className="h-24 rounded-2xl bg-slate-200/40 dark:bg-slate-800/40" />
          <div className="h-24 rounded-2xl bg-slate-200/40 dark:bg-slate-800/40" />
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="container-app py-10">
        <Card className="p-6 text-center">
          <p className="text-sm opacity-80">প্রোফাইল লোড করা যায়নি।</p>
          <div className="mt-4">
            <Link href="/" className="underline">হোমে ফিরুন</Link>
          </div>
        </Card>
      </main>
    )
  }

  const isCandidate = profile.role === 'candidate'

  return (
    <main className="min-h-screen pb-16">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-600/15 to-emerald-700/5" />
        <div className="container-app pt-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden ring-2 ring-amber-300/40 bg-slate-800 grid place-items-center">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="avatar" className="object-cover w-full h-full" />
              ) : (
                <UserIcon className="w-12 h-12 text-slate-400" />
              )}
              <button className="absolute -bottom-3 right-2 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs bg-black/80 text-white shadow border border-white/10">
                <Camera className="w-3.5 h-3.5" /> ছবি দিন
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{profile.full_name || 'নাম দিন'}</h1>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                {profile.headline || (isCandidate ? 'আপনার লক্ষ্য রোল/হেডলাইন দিন' : 'প্রতিষ্ঠানের সংক্ষিপ্ত পরিচয়')}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                {profile.location && (
                  <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>
                )}
                {!!profile.languages && (
                  <span className="inline-flex items-center gap-1"><Languages className="w-4 h-4" /> {Object.keys(profile.languages || {}).join(', ')}</span>
                )}
                <Badge>{isCandidate ? 'Candidate' : 'Employer'}</Badge>
              </div>
            </div>

            <div className="w-full lg:w-auto">
              <Card className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">প্রোফাইল সম্পূর্ণতা</div>
                    <div className="text-xs opacity-70">লক্ষ্য ১০০%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold">{completeness}%</div>
                  </div>
                </div>
                <div className="mt-3"><Progress value={completeness} /></div>
                <div className="mt-3 flex gap-2 text-xs">
                  <Badge className="border-amber-400/40 bg-amber-400/10 text-amber-600 dark:text-amber-300">নাম</Badge>
                  <Badge>হেডলাইন</Badge>
                  <Badge>লোকেশন</Badge>
                  <Badge>স্কিল</Badge>
                  <Badge>ডকুমেন্ট</Badge>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container-app mt-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'about', label: 'About', icon: Globe2 },
            ...(isCandidate
              ? [
                  { key: 'experience', label: 'Experience', icon: Briefcase },
                  { key: 'education', label: 'Education', icon: GraduationCap },
                  { key: 'skills', label: 'Skills', icon: Languages },
                  { key: 'portfolio', label: 'Portfolio & Links', icon: FolderGit2 },
                  { key: 'documents', label: 'Documents', icon: FileText },
                  { key: 'activity', label: 'Job activity', icon: Bell },
                  { key: 'messages', label: 'Messages', icon: MessageSquare },
                  { key: 'schedule', label: 'Interview schedule', icon: CalendarClock },
                ]
              : [
                  { key: 'org', label: 'Organization', icon: Building2 },
                  { key: 'jobs', label: 'Job postings', icon: Briefcase },
                  { key: 'pipeline', label: 'Applicants pipeline', icon: CheckCircle2 },
                  { key: 'messaging', label: 'Messaging', icon: MessageSquare },
                  { key: 'billing', label: 'Billing & Plan', icon: FileText },
                ]),
            { key: 'privacy', label: 'Privacy', icon: Shield },
            { key: 'account', label: 'Account & Security', icon: Settings },
          ].map((t) => (
            <button key={t.key} className="inline-flex items-center gap-2 px-3 h-10 rounded-full border border-emerald-500/20 bg-white/50 dark:bg-slate-900/50 text-sm hover:bg-emerald-500/10">
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* ABOUT */}
        <Card className="p-5 mt-4">
          <SectionTitle
            title="Headline & About"
            right={<button className="inline-flex items-center gap-2 px-3 h-10 rounded-full border border-slate-300/20 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"><Plus className="w-4 h-4"/>Edit</button>}
          />
          <div className="mt-4 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap min-h-[3.5rem]">
                {profile.about || 'সংক্ষিপ্ত পরিচয় লিখুন…'}
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge>Availability: ফুল-টাইম/রিমোট</Badge>
                <Badge>Notice: ৩০ দিন</Badge>
                <Badge>Salary: ৳—৳—</Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-sm opacity-70">দ্রুত লিংক</div>
              <div className="grid gap-2 text-sm">
                <Link href="/settings" className="inline-flex items-center gap-2 underline"><Settings className="w-4 h-4"/>প্রোফাইল সেটিংস</Link>
                <Link href="/jobs" className="inline-flex items-center gap-2 underline"><Briefcase className="w-4 h-4"/>খেদমত দেখুন</Link>
              </div>
            </div>
          </div>
        </Card>

        {/* EXPERIENCE (candidate) */}
        {isCandidate && (
          <Card className="p-5 mt-6">
            <SectionTitle
              title="Experience Timeline"
              right={<button className="inline-flex items-center gap-2 px-3 h-10 rounded-full border border-slate-300/20 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"><Plus className="w-4 h-4"/>Add</button>}
            />
            <div className="mt-4 grid gap-4">
              {experiences.length === 0 && (
                <Empty stateText="এক্সপিরিয়েন্স যোগ করুন" />
              )}
              {experiences.map((ex, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-slate-200/10 p-4 bg-white/40 dark:bg-slate-900/40">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-semibold">{ex.position} • {ex.company}</div>
                    <div className="text-sm opacity-70">{fmtDate(ex.start_date)} — {ex.end_date ? fmtDate(ex.end_date) : 'Present'}</div>
                  </div>
                  {ex.achievements && (
                    <ul className="mt-2 list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      {ex.achievements.map((b: string, j: number) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        {/* EDUCATION (candidate) */}
        {isCandidate && (
          <Card className="p-5 mt-6">
            <SectionTitle title="Education" right={<button className="inline-flex items-center gap-2 px-3 h-10 rounded-full border border-slate-300/20 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"><Plus className="w-4 h-4"/>Add</button>} />
            <div className="mt-4 grid gap-3">
              {educations.length === 0 && <Empty stateText="এডুকেশন যোগ করুন" />}
              {educations.map((ed, i) => (
                <div key={i} className="rounded-xl border border-slate-200/10 p-4 bg-white/40 dark:bg-slate-900/40">
                  <div className="font-semibold">{ed.degree} — {ed.institution}</div>
                  <div className="text-sm opacity-70">{ed.start_year} — {ed.end_year}</div>
                  {ed.grade && <div className="text-sm">Grade: {ed.grade}</div>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* SKILLS (candidate) */}
        {isCandidate && (
          <Card className="p-5 mt-6">
            <SectionTitle title="Skills" right={<button className="inline-flex items-center gap-2 px-3 h-10 rounded-full border border-slate-300/20 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"><Plus className="w-4 h-4"/>Add</button>} />
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.length === 0 && <Empty stateText="স্কিল যোগ করুন" />}
              {skills.map((s, i) => (
                <Badge key={i}>{s.name} {s.level ? `• ${s.level}` : ''}</Badge>
              ))}
            </div>
          </Card>
        )}

        {/* PORTFOLIO (candidate) */}
        {isCandidate && (
          <Card className="p-5 mt-6">
            <SectionTitle title="Portfolio & Links" right={<button className="inline-flex items-center gap-2 px-3 h-10 rounded-full border border-slate-300/20 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"><Plus className="w-4 h-4"/>Add</button>} />
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Empty stateText="প্রজেক্ট/লিংক যোগ করুন — GitHub/Behance/Dribbble/LinkedIn" />
            </div>
          </Card>
        )}

        {/* DOCUMENTS (candidate) */}
        {isCandidate && (
          <Card className="p-5 mt-6">
            <SectionTitle title="Documents" right={<button className="inline-flex items-center gap-2 px-3 h-10 rounded-full border border-slate-300/20 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"><Plus className="w-4 h-4"/>Upload</button>} />
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.length === 0 && <Empty stateText="CV/Resume (মাল্টি-ভার্সন), Cover Letter, সার্টিফিকেট (PDF)" />}
              {documents.map((d, i) => (
                <a key={i} href={d.url} target="_blank" className="rounded-xl border border-slate-200/10 p-4 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between group">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{d.title || d.file_name}</div>
                    <div className="text-xs opacity-70 truncate">{d.type || 'Document'}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </Card>
        )}

        {/* EMPLOYER: Organization Overview */}
        {!isCandidate && (
          <Card className="p-5 mt-6">
            <SectionTitle title="Organization" right={<Link href="/orgs" className="underline">Manage</Link>} />
            {!org ? (
              <Empty stateText="প্রতিষ্ঠান প্রোফাইল সেটআপ করুন (নাম, লিগ্যাল নাম, টাইপ, ঠিকানা/ম্যাপ, ওয়েবসাইট, বর্ণনা)" />
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="font-semibold text-lg">{org.name}</div>
                  <div className="text-sm opacity-70">{org.type} • {org.website}</div>
                  <div className="text-sm mt-2">{org.address}</div>
                  {org.about && <p className="text-sm mt-2 text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{org.about}</p>}
                </div>
                <div className="flex items-start justify-end">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {org.logo_url ? <img src={org.logo_url} alt="logo" className="w-24 h-24 rounded-xl object-cover"/> : <div className="w-24 h-24 rounded-xl bg-slate-800 grid place-items-center text-slate-400">Logo</div>}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* PRIVACY */}
        <Card className="p-5 mt-6">
          <SectionTitle title="Privacy" />
          <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
            <ToggleRow label="প্রোফাইল পাবলিক" value={profile.visibility === 'public'} />
            <ToggleRow label="সার্চে দেখাবে" value={true} />
            <ToggleRow label="ফোন দেখাবে" value={false} />
            <ToggleRow label="ইমেইল দেখাবে" value={false} />
          </div>
        </Card>

        {/* ACCOUNT & SECURITY */}
        <Card className="p-5 mt-6">
          <SectionTitle title="Account & Security" />
          <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
            <ToggleRow label="Two‑factor (2FA)" value={false} />
            <ToggleRow label="Active sessions/devices" value={true} />
            <ToggleRow label="ডেটা ডাউনলোড" value={true} />
            <ToggleRow label="একাউন্ট ডিলিট" value={false} />
          </div>
        </Card>

        <div className="mt-10 text-center text-xs opacity-60">
          <p>RTL সাপোর্ট: <code>&lt;html dir="rtl"&gt;</code> টগল দিন এবং Tailwind RTL প্লাগইন সক্রিয় করুন।</p>
        </div>
      </div>
    </main>
  )
}

// Helpers --------------------------------------------------------------------
function fmtDate(s: string | null | undefined) {
  if (!s) return ''
  try { return new Date(s).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short' }) } catch { return s }
}
function Empty({ stateText }: { stateText: string }) {
  return (
    <div className="rounded-xl border border-dashed border-emerald-400/30 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
      {stateText}
    </div>
  )
}
function ToggleRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200/10 bg-white/40 dark:bg-slate-900/40 p-3">
      <span>{label}</span>
      <span className={`h-5 w-10 rounded-full ${value ? 'bg-emerald-500/70' : 'bg-slate-500/40'} relative`}>
        <span className={`absolute top-0.5 ${value ? 'right-0.5' : 'left-0.5'} h-4 w-4 rounded-full bg-white shadow`} />
      </span>
    </div>
  )
}
