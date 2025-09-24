"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Info,
  Users,
  HelpCircle,
  Star,
  Briefcase,
  Building2,
  Phone,
  User,
  LogOut,
  Settings,
  LayoutGrid,
} from "lucide-react";
import Image from "next/image";
import logo from "./site-logo.png";

// ---- Simulated auth context (replace with your actual auth implementation) ----
interface UserT {
  profilePicture?: string;
  name?: string;
}
const useAuth = () => ({
  // বাস্তবে আপনার auth context দিয়ে দিন
  user: null as UserT | null,
  logout: () => console.log("logout"),
});

// ---- Islamic pattern (subtler + performance friendly) ----
const IslamicPattern = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-[0.06]"
    viewBox="0 0 110 110"
    preserveAspectRatio="none"
    aria-hidden
  >
    <defs>
      <pattern
        id="islamic-pattern-new"
        patternUnits="userSpaceOnUse"
        width="100"
        height="100"
        patternTransform="scale(1) rotate(45)"
      >
        <rect width="100" height="100" fill="rgba(16, 185, 129, 0.15)" />
        <path
          d="M50 0 L100 50 L50 100 L0 50 Z"
          fill="rgba(245, 158, 11, 0.08)"
        />
        <path
          d="M0 0 H50 V50 H0 Z"
          stroke="rgba(245, 158, 11, 0.18)"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M50 50 H100 V100 H50 Z"
          stroke="rgba(245, 158, 11, 0.18)"
          strokeWidth="1"
          fill="none"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#islamic-pattern-new)" />
  </svg>
);

// ---- Utility: outside click ----
function useOnClickOutside<T extends HTMLElement>(cb: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      const el = ref.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) cb();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [cb]);
  return ref;
}

// ---- NavLink with smart underline ----
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
      className={`relative inline-flex items-center gap-2 font-['Tiro_Bangla'] h-10 px-4 rounded-full font-medium transition-colors duration-300 ${
        isActive ? "text-amber-200" : "text-slate-200 hover:text-white"
      } ${className}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-emerald-400"
          layoutId="underline"
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      )}
    </Link>
  );
}

// ---- Avatar dropdown (shown only when logged in) ----
function AvatarMenu({ user, onLogout }: { user: UserT; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useOnClickOutside<HTMLDivElement>(() => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="group relative w-12 h-12 rounded-full ring-2 ring-amber-300/50 hover:ring-amber-300 transition-all overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/30"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="User menu"
      >
        {user.profilePicture ? (
          <Image
            src={user.profilePicture}
            alt="User profile"
            width={48}
            height={48}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full grid place-items-center bg-gradient-to-br from-amber-500 to-emerald-600">
            <User className="h-6 w-6 text-white" />
          </div>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-amber-300/20 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-2"
            role="menu"
          >
            <div className="px-3 py-3 rounded-xl bg-slate-800/40 flex items-center gap-3 relative">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-amber-300/40">
                {user.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt="User"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center bg-gradient-to-br from-amber-500 to-emerald-600">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0 relative">
                <p className="font-['Tiro_Bangla'] text-amber-100 font-semibold truncate">
                  {user.name || "ব্যবহারকারী"}
                </p>
                <p className="text-xs text-slate-400">স্বাগতম!</p>
              </div>
            </div>

            <div className="mt-2 grid relative">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-emerald-800/50 text-slate-100 relative"
                role="menuitem"
              >
                <LayoutGrid className="h-5 w-5 text-amber-300" /> ড্যাশবোর্ড
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-emerald-800/50 text-slate-100 relative"
                role="menuitem"
              >
                <Settings className="h-5 w-5 text-amber-300" /> প্রোফাইল সেটিংস
              </Link>
              <button
                onClick={onLogout}
                className="text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-emerald-800/50 text-slate-100 relative"
                role="menuitem"
              >
                <LogOut className="h-5 w-5 text-amber-300" /> লগআউট
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Main Navbar ----
export default function IslamicModernNavbar({
  siteName = "KhedmatBD",
}: {
  siteName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hiddenOnScroll, setHiddenOnScroll] = useState(false);
  const { user, logout } = useAuth();

  // mobile submenu state
const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  // Hide-on-scroll logic
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      setHiddenOnScroll(y > 80 && y - lastY > 4);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ESC closes mobile menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
  className={`relative sticky top-0 z-50 w-full transition-[transform,background,border,box-shadow] duration-300 
    before:content-[''] before:absolute before:-top-10 before:left-0 before:right-0 before:h-10
    before:bg-gradient-to-b before:from-[#2e1a3b] before:to-transparent
    ${scrolled
      ? "border-b border-fuchsia-400/20 bg-[#25162f] shadow-2xl shadow-purple-900/20"
      : "border-b border-transparent bg-[#25162f]"}
    ${hiddenOnScroll ? "-translate-y-2" : "translate-y-0"}`}
>

      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0a1c1a] to-[#12332f] relative">
        <IslamicPattern />
      </div>

      <nav
        className={`container mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 ${
          scrolled ? "h-16" : "h-20"
        } transition-all flex items-center justify-between relative`}
      >
        {/* Left: Brand */}
        <div className="flex items-center gap-4 min-w-0 relative">
          <Link href="/" className="group relative" aria-label="Home">
            <div className="p-0.5 rounded-full bg-gradient-to-br from-amber-400 to-emerald-500 group-hover:scale-105 transition-transform duration-300 relative">
              <div className="w-12 h-12 rounded-full bg-slate-900 ring-1 ring-amber-300/20 grid place-items-center overflow-hidden relative">
                <Image
                  src={logo}
                  alt={`${siteName} logo`}
                  width={50}
                  height={50}
                  priority
                />
              </div>
            </div>
          </Link>
          <Link
  href="/"
  className="font-['Tiro_Bangla'] font-bold text-[clamp(2rem,4vw,3rem)] tracking-tight text-amber-200 relative
  transition-all duration-300 ease-in-out
  hover:text-amber-100 hover:-translate-y-1 hover:drop-shadow-[0_2px_5px_rgba(255,165,0,0.4)]"
>
  {siteName}
</Link>
        </div>

        {/* Right: Nav + CTAs */}
        <div className="flex items-center gap-3 relative">
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2 text-2xl font-extrabold font-['Tiro_Bangla'] relative">
            <NavLink href="/jobs" icon={Briefcase}>
              খেদমতসমূহ
            </NavLink>
            <NavLink href="/orgs" icon={Building2}>
              প্রতিষ্ঠান
            </NavLink>
            <div className="group relative">
  <NavLink href="/about" icon={Info}>
    <span className="inline-flex items-center gap-2">
      আমাদের সম্পর্কে
      <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
    </span>
  </NavLink>

  {/* Dropdown menu */}
  <div className="absolute top-full right-0 mt-2 w-72 origin-top-right scale-95 opacity-0 invisible 
                  group-hover:scale-100 group-hover:opacity-100 group-hover:visible transition-all duration-200">
    <div className="p-2 bg-slate-900/80 backdrop-blur-lg rounded-xl shadow-2xl ring-1 ring-amber-300/20">
      <Link href="/about#mission" className="flex items-center gap-3 px-3 py-2 text-base text-slate-100 hover:bg-emerald-800/50 rounded-lg">
        <Star className="h-5 w-5 text-amber-300" /> আমাদের লক্ষ্য
      </Link>
      <Link href="/about#team" className="flex items-center gap-3 px-3 py-2 text-base text-slate-100 hover:bg-emerald-800/50 rounded-lg">
        <Users className="h-5 w-5 text-amber-300" /> টিম
      </Link>
      <Link href="/about#faq" className="flex items-center gap-3 px-3 py-2 text-base text-slate-100 hover:bg-emerald-800/50 rounded-lg">
        <HelpCircle className="h-5 w-5 text-amber-300" /> প্রশ্নোত্তর
      </Link>
    </div>
  </div>
</div>

            <NavLink href="/contact" icon={Phone}>
              যোগাযোগ
            </NavLink>
          </div>

          {/* Auth area */}
          <div className="flex items-center gap-3 relative">
            {user ? (
              <AvatarMenu user={user} onLogout={logout} />
            ) : (
              <Link
                href="/auth"
                className="hidden sm:inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-amber-600 to-emerald-600 px-6 text-base font-medium text-white shadow-lg hover:shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all relative"
              >
                লগইন/রেজিস্টার
              </Link>
            )}

            <button
              className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-amber-300/20 bg-slate-900/50 text-amber-200 hover:bg-slate-800/70 active:scale-95 relative"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm relative"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-full w-full max-w-sm bg-slate-900/95 border-l border-amber-300/20 p-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between relative">
                <span className="font-['Tiro_Bangla'] font-semibold text-2xl text-amber-200 relative">
                  মেনু
                </span>
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-300/20 text-amber-200 relative"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="mt-8 flex flex-col gap-4 font-['Tiro_Bangla'] text-lg relative">
                <NavLink
                  href="/jobs"
                  onClick={() => setOpen(false)}
                  icon={Briefcase}
                >
                  খেদমতসমূহ
                </NavLink>
                <NavLink
                  href="/orgs"
                  onClick={() => setOpen(false)}
                  icon={Building2}
                >
                  প্রতিষ্ঠান
                </NavLink>
                <button
  type="button"
  className="inline-flex items-center justify-between gap-2 rounded-full px-4 h-10 text-left font-['Tiro_Bangla'] text-slate-200 hover:text-white border border-amber-300/20"
  aria-expanded={mobileAboutOpen}
  onClick={() => setMobileAboutOpen(v => !v)}
>
  <span className="inline-flex items-center gap-2">
    <Info className="h-4 w-4" /> আমাদের সম্পর্কে
  </span>
  <ChevronDown className={`h-4 w-4 transition-transform ${mobileAboutOpen ? 'rotate-180' : ''}`} />
</button>

<AnimatePresence>
  {mobileAboutOpen && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: "tween", duration: 0.22 }}
      className="ml-6 mt-2 flex flex-col gap-2"
    >
      <Link href="/about#mission" onClick={() => { setOpen(false); setMobileAboutOpen(false); }} className="px-3 py-2 rounded-lg text-slate-100 hover:bg-emerald-800/50 inline-flex items-center gap-2">
        <Star className="h-4 w-4 text-amber-300" /> আমাদের লক্ষ্য
      </Link>
      <Link href="/about#team" onClick={() => { setOpen(false); setMobileAboutOpen(false); }} className="px-3 py-2 rounded-lg text-slate-100 hover:bg-emerald-800/50 inline-flex items-center gap-2">
        <Users className="h-4 w-4 text-amber-300" /> টিম
      </Link>
      <Link href="/about#faq" onClick={() => { setOpen(false); setMobileAboutOpen(false); }} className="px-3 py-2 rounded-lg text-slate-100 hover:bg-emerald-800/50 inline-flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-amber-300" /> প্রশ্নোত্তর
      </Link>
    </motion.div>
  )}
</AnimatePresence>


                <NavLink
                  href="/contact"
                  onClick={() => setOpen(false)}
                  icon={Phone}
                >
                  যোগাযোগ
                </NavLink>
              </nav>

              {/* Auth block mobile */}
              <div className="mt-8 pt-6 border-t border-amber-300/20 flex flex-col gap-4 relative">
                {user ? (
   <div className="flex items-center justify-between relative">
     <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-4">
       <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-amber-300/50">
         {user.profilePicture ? (
           <Image src={user.profilePicture} alt="User profile" width={48} height={48} className="object-cover w-full h-full" />
         ) : (
           <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-emerald-600">
             <User className="h-6 w-6 text-white" />
           </div>
         )}
       </div>
       <span className="font-['Tiro_Bangla'] text-lg text-amber-100">{user.name || "প্রোফাইল"}</span>
     </Link>
     <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 px-4 py-2 text-amber-200 hover:bg-slate-800/60">
       <LogOut className="h-4 w-4" /> লগআউট
     </button>
   </div>
 ) : (
   <Link href="/auth" onClick={() => setOpen(false)} className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-amber-600 to-emerald-600 px-6 text-lg font-medium text-white shadow-lg">
     লগইন/রেজিস্টার
   </Link>
 )}
              </div>

              <div className="mt-8 border-t border-amber-300/20 pt-6 text-center text-sm text-slate-400">
                <p>© {new Date().getFullYear()} {siteName}. সর্বস্বত্ব সংরক্ষিত।</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
