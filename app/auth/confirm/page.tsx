export default function Confirmed() {
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-2">ইমেইল ভেরিফিকেশন সম্পন্ন</h1>
      <p>আপনার একাউন্ট প্রস্তুত। <a className="underline" href="/dashboard">ড্যাশবোর্ডে যান</a> বা <a className="underline" href="/auth/signin">লগইন</a> করুন।</p>
    </div>
  );
}
