// app/api/admin/applications/route.ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { listPrefix, getObjectText } from '@/lib/storage';

// tiny cookie parser for Request
function getCookie(req: Request, name: string) {
  const str = req.headers.get('cookie') || '';
  const parts = str.split(/;\s*/);
  for (const p of parts) {
    const [k, ...v] = p.split('=');
    if (k === name) return decodeURIComponent(v.join('=') || '');
  }
  return undefined;
}

export async function GET(req: Request) {
  // admin check
  if (getCookie(req, 'admin_session') !== 'yes') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const listed = await listPrefix('submissions/');
    const keys = (listed || [])
      .map((o: any) => o.Key as string | undefined)
      .filter((k?: string): k is string => !!k && k.endsWith('.json'));

    const items = await Promise.all(
      keys.map(async (key) => {
        try {
          const txt = await getObjectText(key);
          return JSON.parse(txt);
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json({ items: items.filter(Boolean) });
  } catch (e) {
    console.error('applications list error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
