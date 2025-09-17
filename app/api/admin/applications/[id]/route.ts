// app/api/admin/applications/[id]/route.ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { listPrefix, getObjectText, putJson } from '@/lib/storage';

function getCookie(req: Request, name: string) {
  const str = req.headers.get('cookie') || '';
  const parts = str.split(/;\s*/);
  for (const p of parts) {
    const [k, ...v] = p.split('=');
    if (k === name) return decodeURIComponent(v.join('=') || '');
  }
  return undefined;
}

async function findSubmissionById(id: string) {
  const listed = await listPrefix('submissions/');
  const jsonKeys = (listed || [])
    .map((o: any) => o.Key as string | undefined)
    .filter((k?: string): k is string => !!k && k.endsWith('.json'));

  for (const key of jsonKeys) {
    const txt = await getObjectText(key);
    try {
      const obj = JSON.parse(txt);
      if (obj?.id === id) {
        return { obj, key };
      }
    } catch { /* ignore */ }
  }
  return null;
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (getCookie(req, 'admin_session') !== 'yes') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;

  const found = await findSubmissionById(id);
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(found.obj);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (getCookie(req, 'admin_session') !== 'yes') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({} as any));
  const { status, notes } = body || {};

  const found = await findSubmissionById(id);
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = { ...found.obj, status: status || found.obj.status, notes: notes ?? found.obj.notes };
  await putJson(found.key, updated);
  return NextResponse.json(updated);
}
