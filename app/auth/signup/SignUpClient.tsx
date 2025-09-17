'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client'
import { FaGoogle, FaFacebook, FaMicrosoft, FaApple } from 'react-icons/fa6';

const supabase = createClient();

type ProfileType = 'personal' | 'institution';

export default function SignUpClient() {
  const [type, setType] = useState<ProfileType>('personal');

  // ব্যক্তিগত স্টেট
  const [pEmail, setPEmail] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pName, setPName] = useState('');
  const [pPass, setPPass] = useState('');

  // প্রাতিষ্ঠানিক স্টেট
  const [orgName, setOrgName] = useState('');
  const [orgAddr, setOrgAddr] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPass, setOrgPass] = useState('');

  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function signUpPersonal(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: pEmail,
      password: pPass,
      options: {
        emailRedirectTo: `${location.origin}/auth/confirm`,
        data: { role: 'candidate', full_name: pName, phone: pPhone }
      }
    });
    setBusy(false);
    if (error) alert(error.message); else setSent(true);
  }

  async function signUpInstitution(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: orgEmail,
      password: orgPass,
      options: {
        emailRedirectTo: `${location.origin}/auth/confirm`,
        data: { role: 'employer', org_name: orgName, org_address: orgAddr }
      }
    });
    setBusy(false);
    if (error) alert(error.message); else setSent(true);
  }

  async function social(provider: 'google'|'facebook'|'azure'|'apple') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` }
    });
    if (error) alert(error.message);
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-xl font-semibold mb-2">ইমেইল ভেরিফিকেশন</h1>
        <p>আপনার ইমেইলে একটি নিশ্চিতকরণ লিংক পাঠানো হয়েছে।</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-২xl font-semibold mb-4">রেজিস্ট্রেশন</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button onClick={()=>setType('personal')}
          className={`p-3 rounded-xl border ${type==='personal'?'bg-black text-white':''}`}>
          ব্যক্তিগত প্রোফাইল
        </button>
        <button onClick={()=>setType('institution')}
          className={`p-3 rounded-xl border ${type==='institution'?'bg-black text-white':''}`}>
          প্রাতিষ্ঠানিক প্রোফাইল
        </button>
      </div>

      {type === 'personal' ? (
        <form onSubmit={signUpPersonal} className="space-y-3 border rounded-2xl p-4">
          <input className="w-full border p-2 rounded-xl" placeholder="পূর্ণ নাম"
                 value={pName} onChange={e=>setPName(e.target.value)} required />
          <input className="w-full border p-2 rounded-xl" placeholder="ইমেইল" type="email"
                 value={pEmail} onChange={e=>setPEmail(e.target.value)} required />
          <input className="w-full border p-2 rounded-xl" placeholder="ফোন নম্বর"
                 value={pPhone} onChange={e=>setPPhone(e.target.value)} />
          <input className="w-full border p-2 rounded-xl" placeholder="পাসওয়ার্ড" type="password"
                 value={pPass} onChange={e=>setPPass(e.target.value)} required />
          <button disabled={busy} className="w-full px-4 py-2 rounded-xl bg-black text-white">
            {busy ? 'প্রসেস হচ্ছে...' : 'Create personal account'}
          </button>
        </form>
      ) : (
        <form onSubmit={signUpInstitution} className="space-y-3 border rounded-2xl p-4">
          <input className="w-full border p-2 rounded-xl" placeholder="প্রতিষ্ঠানের নাম"
                 value={orgName} onChange={e=>setOrgName(e.target.value)} required />
          <input className="w-full border p-2 rounded-xl" placeholder="ঠিকানা"
                 value={orgAddr} onChange={e=>setOrgAddr(e.target.value)} />
          <input className="w-full border p-2 rounded-xl" placeholder="প্রতিষ্ঠানের ইমেইল" type="email"
                 value={orgEmail} onChange={e=>setOrgEmail(e.target.value)} required />
          <input className="w-full border p-2 rounded-xl" placeholder="পাসওয়ার্ড" type="password"
                 value={orgPass} onChange={e=>setOrgPass(e.target.value)} required />
          <button disabled={busy} className="w-full px-4 py-2 rounded-xl bg-black text-white">
            {busy ? 'প্রসেস হচ্ছে...' : 'Create institutional account'}
          </button>
        </form>
      )}

      <div className="mt-6 space-y-2">
        <div className="text-center opacity-70 text-sm">অথবা সাইন আপ করুন</div>
        <div className="grid md:grid-cols-4 grid-cols-2 gap-3">
          <button onClick={()=>social('google')} className="border rounded-xl p-2 flex items-center justify-center gap-2"><FaGoogle /> Google</button>
          <button onClick={()=>social('facebook')} className="border rounded-xl p-2 flex items-center justify-center gap-2"><FaFacebook /> Facebook</button>
          <button onClick={()=>social('azure')} className="border rounded-xl p-2 flex items-center justify-center gap-2"><FaMicrosoft /> Microsoft</button>
          <button onClick={()=>social('apple')} className="border rounded-xl p-2 flex items-center justify-center gap-2"><FaApple /> Apple</button>
        </div>
      </div>
    </div>
  );
}
