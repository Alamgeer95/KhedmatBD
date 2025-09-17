// app/auth/callback/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  // Supabase নিজে সেশনের কুকি সেট করে, আমরা শুধু রিডাইরেক্ট করবো
  const next = url.searchParams.get('next') || '/dashboard';
  return NextResponse.redirect(new URL(next, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}
