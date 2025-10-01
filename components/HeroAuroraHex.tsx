"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  BookOpen,
  Flame,
  Landmark,
  Sparkles,
  Star,
} from "lucide-react";

/** জিওমেট্রিক মসজিদ আইকন (SVG) */
function MosqueIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 96 64" fill="none" {...props}>
      <defs>
        <linearGradient id="m-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(16,185,129,.9)" />
          <stop offset="100%" stopColor="rgba(20,184,166,.9)" />
        </linearGradient>
      </defs>
      <path d="M10 12v40h6V12l-3-4-3 4Z" stroke="url(#m-grad)" strokeWidth="2" />
      <path d="M80 12v40h6V12l-3-4-3 4Z" stroke="url(#m-grad)" strokeWidth="2" />
      <path
        d="M28 40a20 20 0 1 1 40 0v12H28V40Z"
        stroke="url(#m-grad)"
        strokeWidth="2"
      />
      <rect
        x="20"
        y="40"
        width="56"
        height="12"
        rx="2"
        stroke="url(#m-grad)"
        strokeWidth="2"
      />
      <rect x="44" y="44" width="8" height="8" rx="1" fill="url(#m-grad)" />
    </svg>
  );
}

/** পারফরম্যান্স-ফ্রেন্ডলি স্টারফিল্ড */
function StarField({ count = 140 }: { count?: number }) {
  const stars = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 1, // 1–3px
        delay: Math.random() * 3,
        dur: 2.5 + Math.random() * 3,
      })),
    [count]
  );
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            opacity: 0.25,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/** ভাসমান আইকন/শেপস */
function FloatingShapes() {
  const c =
    "absolute opacity-90 [animation:floatY_12s_ease-in-out_infinite] pointer-events-none";
  return (
    <>
      <motion.div
        className={c}
        style={{ left: "6%", top: "12%" }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity }}
      >
        <Briefcase className="h-7 w-7 text-emerald-300" />
      </motion.div>
      <motion.div
        className={c}
        style={{ right: "8%", top: "18%" }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <Building2 className="h-7 w-7 text-teal-300" />
      </motion.div>
      <motion.div
        className={c}
        style={{ left: "12%", bottom: "14%" }}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      >
        <BookOpen className="h-7 w-7 text-emerald-200" />
      </motion.div>
      <motion.div
        className={c}
        style={{ right: "10%", bottom: "12%" }}
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 11, repeat: Infinity }}
      >
        <Flame className="h-6 w-6 text-amber-200" />
      </motion.div>
      <motion.div
        className={c}
        style={{ left: "50%", top: "10%", transform: "translateX(-50%)" }}
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      >
        <MosqueIcon className="h-10 w-auto" />
      </motion.div>
      <motion.div
        className={c}
        style={{ left: "24%", top: "28%" }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
      >
        <Landmark className="h-6 w-6 text-emerald-300" />
      </motion.div>
      <motion.div
        className={c}
        style={{ right: "22%", top: "30%" }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6.5, repeat: Infinity }}
      >
        <Sparkles className="h-6 w-6 text-cyan-200" />
      </motion.div>
      <motion.div
        className={c}
        style={{ left: "8%", top: "50%" }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <Star className="h-5 w-5 text-emerald-200" />
      </motion.div>
    </>
  );
}

/** মূল হিরো কম্পোনেন্ট (চারকোনা গ্লাস-কার্ড) */
export default function HeroAuroraHex({ siteDesc }: { siteDesc: string }) {
  return (
    <section
      className="full-bleed relative container-app px-4 sm:px-6 lg:px-8
                 pt-[calc(var(--nav-h)+1.5rem)] pb-10 text-center min-h-[200px]"
    >
      {/* Gradient border wrapper (rounded rectangle) */}
      <div
        className="relative mx-auto max-w-6xl p-[2px] rounded-[2rem]
                   bg-[conic-gradient(at_30%_120%,rgba(16,185,129,.35),rgba(20,184,166,.25),rgba(16,185,129,.35))]
                   shadow-[0_20px_60px_rgba(0,0,0,.25)]"
      >
        {/* Inner glass card */}
        <div
          className="relative rounded-[calc(2rem-2px)] overflow-visible
                     bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl
                     px-6 py-12 md:px-14 md:py-16"
        >
          {/* Subtle grid + aurora overlays for classy rectangular look */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10
                       bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(16,185,129,.10),transparent_60%),radial-gradient(1000px_500px_at_110%_120%,rgba(20,184,166,.10),transparent_60%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10
                       [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]
                       bg-[linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)]
                       bg-[size:28px_28px]"
          />

          {/* Top highlight line + thin ring */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
          <div className="pointer-events-none absolute inset-0 rounded-[calc(2rem-2px)] ring-1 ring-white/10" />

          {/* animated starfield & shapes */}
          <StarField />
          <FloatingShapes />

          {/* content */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Smart Islamic Jobs</span>
            </div>

            <h1
              className="mt-4 text-4xl sm:text-5xl md:text-6xl pt-3 font-extrabold tracking-tight leading-[1] text-center
                         bg-clip-text text-transparent bg-gradient-to-br
                         from-slate-800 to-slate-600 dark:from-white dark:to-slate-300"
            >
              যোগ্যতা ও দক্ষতার আলোকে পূর্ণ হোক আপনার স্বপ্নের কাঙ্ক্ষিত খেদমত।
              <br className="hidden md:block" /> আপনার প্রতিষ্ঠানের পবিত্র দায়িত্বে বেছে নিন সৎ, আমানতদার ও নিবেদিতপ্রাণ যোগ্য ব্যক্তিত্ব।
            </h1>

            <p className="mt-6 text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-3xl">
              {siteDesc}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/jobs"
                className="btn btn-primary btn-lg rounded-full shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                খেদমত খুঁজুন
              </Link>
              <Link
  href="/post-job"
  className="inline-flex items-center justify-center px-6 h-12 rounded-full
             bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-semibold
             shadow-lg shadow-fuchsia-500/30 hover:from-violet-400 hover:to-fuchsia-400
             hover:-translate-y-1 transition-all duration-300
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300
             focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e1a30]"
>
  খেদমত পোস্ট করুন
</Link>


            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
