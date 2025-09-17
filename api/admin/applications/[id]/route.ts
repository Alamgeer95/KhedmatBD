// app/api/admin/applications/[id]/route.ts
import { NextResponse } from 'next/server';
import { listPrefix, getObjectText } from '@/lib/storage';

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const p = await params;
  try {
    const { id } = params;
    // সব খেদমতের ফোল্ডারের ভিতরে id.json খুঁজি
    const list = await listPrefix('submissions/');
    const key = list
      .map((o) => o.Key)
      .find((k): k is string => !!k && k.endsWith(`/${id}.json`));

    if (!key) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const txt = await getObjectText(key);
    const json = JSON.parse(txt);
    return NextResponse.json(json);
  } catch (e) {
    console.error('admin/applications/[id] GET error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
