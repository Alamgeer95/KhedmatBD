"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  Info,
  Users,
  HelpCircle,
  Star,
  Briefcase,
  Building2,
  Phone,
  PlusCircle,
  Search
} from "lucide-react";

// ---------- Premium NavLink (icon + active/hover styling) ----------
function NavLink({
  href,
  children,
  onClick,
  className = "",
  icon: Icon,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "group relative inline-flex items-center gap-2",
        "h-10 md:h-11 px-3 md:px-4 rounded-2xl font-semibold leading-none",
        isActive
          ? "text-emerald-200 bg-emerald-400/10 ring-1 ring-emerald-400/25"
          : "text-slate-200/90 hover:text-emerald-100 hover:bg-emerald-400/10",
        "transition-colors",
        className,
      ].join(" ")}
    >
      {Icon ? <Icon className="h-4 w-4 opacity-85" /> : null}
      <span>{children}</span>
      <span className="pointer-events-none absolute -bottom-1 left-3 right-3 h-0.5 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 bg-[linear-gradient(90deg,theme(colors.emerald.400),theme(colors.teal.400),theme(colors.cyan.300))]" />
    </Link>
  );
}

export default function ModernNavbar({ siteName = "KhedmatBD" }: { siteName?: string }) {
  const [open, setOpen] = React.useState(false);
  const [dark, setDark] = React.useState<boolean | null>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const [aboutOpen, setAboutOpen] = React.useState(false);


  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    setDark(root.classList.contains("dark"));
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (dark === null) return;
    const root = document.documentElement;
    dark ? root.classList.add("dark") : root.classList.remove("dark");
  }, [dark]);

  return (
    <header
      className={[
        "app-navbar sticky top-0 z-50 w-full border-b text-slate-100 transition-all duration-300",
        scrolled ? "shadow-[0_2px_22px_rgba(0,0,0,0.25)]" : "shadow-none",
        "border-white/10 relative overflow-visible",
      ].join(" ")}
      style={{
        backgroundImage: `
          radial-gradient(1300px 500px at 0% -20%, rgba(16,185,129,.18), transparent 70%),
          radial-gradient(1200px 500px at 100% 120%, rgba(20,184,166,.14), transparent 60%),
          linear-gradient(180deg, rgba(1,28,24,.65), rgba(1,28,24,.65)),
          linear-gradient(90deg, #071a16, #0a201a 30%, #0b1e1a 70%, #071a16)
        `,
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-300/0 via-cyan-300/60 to-cyan-300/0" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(600px_200px_at_50%_-20%,white,transparent_70%)]" />

      <nav className="container-app mx-auto h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between isolate">
        {/* Left: Logo & brand */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="inline-flex" aria-label="Home">
            {/* gradient ring logo */}
            <div className="p-[1px] rounded-2xl bg-[linear-gradient(140deg,rgba(16,185,129,.6),rgba(8,145,178,.6))]">
              <div className="w-10 h-10 rounded-xl bg-slate-900/60 text-white flex items-center justify-center shadow-sm ring-1 ring-white/10 backdrop-blur">
                🕌
              </div>
            </div>
          </Link>
          <Link
            href="/"
            className="font-['Tiro_Bangla'] font-extrabold tracking-tight text-3xl sm:text-4xl md:text-5xl leading-none whitespace-nowrap flex-shrink-0 hover:text-emerald-200 transition-colors"
          >
            Khedmat<span className="text-amber-400">BD</span>
          </Link>
        </div>

        {/* Center: Desktop nav */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4 text-lg">
          <NavLink href="/jobs" icon={Briefcase}>খেদমতসমূহ</NavLink>
          <NavLink href="/orgs" icon={Building2}>প্রতিষ্ঠান</NavLink>

          <div className="relative group">
            <NavLink href="/about" className="gap-1" icon={Info}>
              <span className="inline-flex items-center gap-1 leading-none">
                আমাদের সম্পর্কে
                <ChevronDown className="h-4 w-4 translate-y-px opacity-80" />
              </span>
            </NavLink>

            {/* Dropdown */}
            <div className="invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 absolute left-0 mt-2 md:mt-3">
              <div className="bg-[linear-gradient(90deg,rgba(16,185,129,.35),rgba(20,184,166,.35))] p-[1px] rounded-2xl shadow-2xl ring-1 ring-emerald-500/15 w-[24rem] md:w-[28rem]">
                <div className="relative rounded-[calc(theme(borderRadius.2xl)-1px)] bg-slate-900/85 backdrop-blur-2xl">
                  <span className="absolute -top-2 left-8 h-4 w-4 rotate-45 bg-slate-900/85 ring-1 ring-emerald-500/10" />

                  <div className="p-4">
                    {/* top row: spotlight */}
                    <Link
                      href="/about#mission"
                      className="group/item flex items-start gap-3 rounded-xl px-3 py-3 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 ring-1 ring-emerald-400/15 hover:ring-emerald-400/40 transition shadow-sm hover:shadow-md"
                    >
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                        <Star className="h-5 w-5 text-emerald-300" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-100">আমাদের লক্ষ্য</span>
                          <span className="inline-flex items-center rounded-full border px-2 text-[11px] leading-5 border-emerald-400/30 text-emerald-300">Featured</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-300/90 line-clamp-2">KhedmatBD কীভাবে মাদরাসা, মসজিদ, ইসলামিক স্কুল ও এনজিওর জন্য মূল্য তৈরি করে—তার সংক্ষিপ্ত ন্যারেটিভ।</p>
                      </div>
                    </Link>

                    {/* grid links */}
                    <div className="mt-3 grid grid-cols-1 divide-y divide-emerald-500/10">
                      <Link href="/about#team" className="group/item flex items-start gap-3 px-3 py-3 hover:bg-emerald-500/5 rounded-xl transition">
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100/5"><Users className="h-5 w-5 text-emerald-300" /></div>
                        <div className="min-w-0"><div className="font-medium text-slate-100">টিম</div><p className="text-sm text-slate-300/90 line-clamp-2">কারা কাজ করছে, ব্যাকগ্রাউন্ড ও দায়িত্বসমূহ।</p></div>
                      </Link>
                      <Link href="/about#faq" className="group/item flex items-start gap-3 px-3 py-3 hover:bg-emerald-500/5 rounded-xl transition">
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100/5"><HelpCircle className="h-5 w-5 text-emerald-300" /></div>
                        <div className="min-w-0"><div className="font-medium text-slate-100">প্রশ্নোত্তর</div><p className="text-sm text-slate-300/90 line-clamp-2">সাধারণ প্রশ্নের দ্রুত উত্তর—নীতিমালা, প্রাইভেসি, যোগাযোগ ইত্যাদি।</p></div>
                      </Link>
                    </div>

                    {/* footer quick link */}
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-500/10 px-3 py-2">
                      <div className="flex items-center gap-2 text-sm text-slate-300/90"><Info className="h-4 w-4 text-emerald-300" /> আরও জানুন</div>
                      <Link href="/about" className="inline-flex h-8 items-center justify-center rounded-lg bg-[linear-gradient(90deg,theme(colors.emerald.600),theme(colors.teal.500))] px-3 text-xs font-medium text-white shadow-sm hover:brightness-110 active:scale-[.98]">Overview</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <NavLink href="/contact" icon={Phone}>যোগাযোগ</NavLink>
        </div>

        {/* Right: CTAs */}
        <div className="hidden sm:flex items-center gap-2">

          <Link
            href="/auth"
            className="inline-flex h-10 md:h-11 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,theme(colors.emerald.600),theme(colors.teal.500))] px-4 md:px-5 text-base font-semibold text-white shadow-[0_8px_24px_rgba(16,185,129,.25)] ring-1 ring-emerald-300/30 hover:brightness-110 active:scale-[.98]"
          >
            <PlusCircle className="h-5 w-5" /> লগইন/রেজিস্টেশন করুন
          </Link>

          <button
            aria-label="Toggle theme"
            onClick={() => setDark((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-200 backdrop-blur hover:bg-white/15 active:scale-95"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile: menu button */}
        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-100 backdrop-blur hover:bg-white/15 active:scale-95"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
        >
          <Menu className="h-5 w-5" />
        </button>
      </nav>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.aside initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="md:hidden fixed inset-0 z-[60]">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="absolute right-0 top-0 h-full w-80 max-w-[90%] border-l border-emerald-500/15 bg-slate-900/90 p-4 shadow-xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-100">মেনু</span>
                <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-100 hover:bg-white/15" onClick={() => setOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-2">
  <NavLink href="/jobs" onClick={() => setOpen(false)} icon={Briefcase}>খেদমতসমূহ</NavLink>
  <NavLink href="/orgs" onClick={() => setOpen(false)} icon={Building2}>প্রতিষ্ঠান</NavLink>

  {/* আমাদের সম্পর্কে (accordion) */}
  <button
    type="button"
    onClick={() => setAboutOpen(v => !v)}
    aria-expanded={aboutOpen}
    aria-controls="about-submenu"
    className="inline-flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/10 px-4 h-10 text-left text-slate-100 hover:bg-white/15"
  >
    <span className="inline-flex items-center gap-2">
      <Info className="h-4 w-4" />
      আমাদের সম্পর্কে
    </span>
    <ChevronDown className={`h-4 w-4 transition-transform ${aboutOpen ? "rotate-180" : ""}`} />
  </button>

  <AnimatePresence initial={false}>
    {aboutOpen && (
      <motion.div
        id="about-submenu"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="pl-11 pr-2 py-1 space-y-1"
      >
        <Link
          href="/about#mission"
          onClick={() => { setOpen(false); setAboutOpen(false); }}
          className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-emerald-500/10"
        >
          আমাদের লক্ষ্য
        </Link>
        <Link
          href="/about#team"
          onClick={() => { setOpen(false); setAboutOpen(false); }}
          className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-emerald-500/10"
        >
          টিম
        </Link>
        <Link
          href="/about#faq"
          onClick={() => { setOpen(false); setAboutOpen(false); }}
          className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-emerald-500/10"
        >
          প্রশ্নোত্তর
        </Link>
      </motion.div>
    )}
  </AnimatePresence>

  <NavLink href="/contact" onClick={() => setOpen(false)} icon={Phone}>যোগাযোগ</NavLink>
</div>


              <div className="mt-6 flex flex-col gap-3">
                <Link href="/auth" onClick={() => setOpen(false)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,theme(colors.emerald.600),theme(colors.teal.500))] px-4 text-base font-semibold text-white shadow-sm ring-1 ring-emerald-300/30 hover:brightness-110">
                  <PlusCircle className="h-5 w-5" /> লগইন/রেজিস্টেশন করুন
                </Link>
                <button onClick={() => setDark((v) => !v)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-medium text-slate-100 backdrop-blur hover:bg-white/15">
                  {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span>{dark ? "লাইট থিম" : "ডার্ক থিম"}</span>
                </button>
              </div>

              <div className="mt-6 border-t border-emerald-500/10 pt-4 text-xs text-slate-400">
                <p>© {new Date().getFullYear()} {siteName}. সর্বস্বত্ব সংরক্ষিত।</p>
              </div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </header>
  );
}
