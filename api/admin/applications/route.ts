// app/api/admin/applications/route.ts
import { NextResponse } from 'next/server';
import { listPrefix, getObjectText } from '@/lib/storage';

export async function GET() {
  try {
    // সব খেদমতের সাবমিশন: submissions/<jobSlug>/<id>.json
    const all = await listPrefix('submissions/');
    // শুধু .json ফাইলগুলো নিয়ে আসি
    const keys = all
      .map((o) => o.Key)
      .filter((k): k is string => !!k && k.endsWith('.json'));

    // সর্বশেষ আগে দেখাতে sort (LastModified থাকলে)
    const items = await Promise.all(
      keys.map(async (key) => {
        const txt = await getObjectText(key);
        try {
          return JSON.parse(txt);
        } catch {
          return null;
        }
      })
    );

    const data = items
      .filter(Boolean)
      // newest first (submittedAt desc)
      .sort(
        (a: any, b: any) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );

    return NextResponse.json({ items: data });
  } catch (e) {
    console.error('admin/applications GET error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
