// app/auth/signup/page.tsx
import type { Metadata } from 'next';
import SignUpClient from './SignUpClient';

export const metadata: Metadata = {
  title: 'Sign up | Qawmi Jobs',
  description: 'ব্যক্তিগত বা প্রাতিষ্ঠানিক প্রোফাইল দিয়ে সাইন আপ করুন।',
  openGraph: {
    title: 'Sign up | Qawmi Jobs',
    description: 'ব্যক্তিগত বা প্রাতিষ্ঠানিক প্রোফাইল দিয়ে সাইন আপ করুন।',
  },
};

export default function SignUpPage() {
  return <SignUpClient />;
}
