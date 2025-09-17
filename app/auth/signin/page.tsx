// app/auth/signin/page.tsx
import type { Metadata } from 'next';
import SignInClient from './SignInClient';

export const metadata: Metadata = {
  title: 'Sign in | Qawmi Jobs',
  description: 'ইমেইল ও পাসওয়ার্ড দিয়ে সাইন ইন করুন।',
  openGraph: {
    title: 'Sign in | Qawmi Jobs',
    description: 'ইমেইল ও পাসওয়ার্ড দিয়ে সাইন ইন করুন।',
  },
};

export default function SignInPage() {
  return <SignInClient />;
}
