import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';

export const metadata = {
  title: 'লগইন বা রেজিস্ট্রেশন | Qawmi Jobs',
  description: 'লগইন বা রেজিস্ট্রেশন বেছে নিন।',
  openGraph: { title: 'লগইন/রেজিস্ট্রেশন', description: 'Sign in or Sign up' }
};

export default function AuthLanding() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 dark:bg-gray-900 dark:text-white">
      {/* Light mode background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:hidden"></div>
      {/* Dark mode background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 hidden dark:block"></div>
      
      <div className="max-w-4xl w-full mx-auto p-6 grid gap-6 sm:grid-cols-2 relative z-10">
        <div className="relative group bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:hidden"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden dark:block"></div>
          <LogIn className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-4 relative z-10" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 relative z-10">Sign in</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 relative z-10">ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন।</p>
          <Link 
            href="/auth/signin" 
            className="relative z-10 inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white font-medium hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1"
          >
            Go to Sign in
          </Link>
        </div>
        <div className="relative group bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:hidden"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden dark:block"></div>
          <UserPlus className="w-10 h-10 text-green-600 dark:text-green-400 mb-4 relative z-10" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 relative z-10">Sign up</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 relative z-10">নতুন অ্যাকাউন্ট তৈরি করুন।</p>
          <Link 
            href="/auth/signup" 
            className="relative z-10 inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 text-white font-medium hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 transition-all duration-300 transform hover:-translate-y-1"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}