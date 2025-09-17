'use client';
import Seo from '@/components/Seo';
import { abs } from '@/utils/abs';
import { useState } from 'react';

export default function ContactPage() {
  const [loading,setLoading]=useState(false);
  const [ok,setOk]=useState(''); const [err,setErr]=useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setOk(''); setErr(''); setLoading(true);
    const fd = new FormData(e.target as HTMLFormElement);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch('/api/contact',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
    setLoading(false);
    if (res.ok) setOk('মেসেজ পাঠানো হয়েছে।'); else setErr('পাঠাতে সমস্যা হয়েছে।');
  }

  return (
    <main className="min-h-screen">
      <Seo
        title="যোগাযোগ"
        description="প্রশ্ন/প্রস্তাব/সাপোর্টের জন্য আমাদের সাথে যোগাযোগ করুন।"
        canonical={abs('/contact')}
        ogImage={abs('/api/og/site')}
      />
      <section className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-bold">যোগাযোগ</h1>
        <form onSubmit={submit} className="grid gap-4 mt-6">
          <input name="name" required placeholder="নাম" className="h-11 rounded-xl border px-3"/>
          <input name="email" type="email" required placeholder="ইমেইল" className="h-11 rounded-xl border px-3"/>
          <textarea name="message" required rows={6} placeholder="বার্তা…" className="rounded-xl border px-3 py-2"/>
          {ok && <div className="text-emerald-700">{ok}</div>}
          {err && <div className="text-red-600">{err}</div>}
          <button disabled={loading} className="h-11 rounded-xl bg-emerald-600 text-white">
            {loading ? 'পাঠানো হচ্ছে…' : 'পাঠান'}
          </button>
        </form>
      </section>
    </main>
  );
}
