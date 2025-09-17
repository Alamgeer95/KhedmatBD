// app/api/admin/applications.csv/route.ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { listPrefix, getObjectText } from '@/lib/storage';

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
  if (getCookie(req, 'admin_session') !== 'yes') {
    return new Response('Unauthorized', { status: 401 });
  }

  const listed = await listPrefix('submissions/');
  const keys = (listed || [])
    .map((o: any) => o.Key as string | undefined)
    .filter((k?: string): k is string => !!k && k.endsWith('.json'));

  const rows: any[] = [];
  for (const key of keys) {
    try {
      const txt = await getObjectText(key);
      const j = JSON.parse(txt);
      rows.push(j);
    } catch { /* ignore */ }
  }

  const headers = ['id','jobSlug','name','email','status','submittedAt','resumeKey','coverLetter'];
  const escape = (v: any) => {
    if (v == null) return '';
    let s = String(v);
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      s = '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const lines = [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(',')),
  ];
  const csv = lines.join('\n');

  return new Response(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="applications.csv"',
    },
  });
}
