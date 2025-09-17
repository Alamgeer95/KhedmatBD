// app/api/admin/applications/[id]/resume/route.ts
import { NextResponse } from 'next/server';
import { listPrefix, getObjectText, getSignedUrlFor } from '@/lib/storage';

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const p = await params;
  try {
    const list = await listPrefix('submissions/');
    const key = list
      .map((o) => o.Key)
      .find((k): k is string => !!k && k.endsWith(`/${p.id}.json`));

    if (!key) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const txt = await getObjectText(key);
    const submission = JSON.parse(txt);
    const resumeKey = submission.resumeKey as string | undefined;
    if (!resumeKey) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const url = await getSignedUrlFor(resumeKey, 60 * 5);
    return NextResponse.json({ url, expiresIn: 300 });
  } catch (e) {
    console.error('resume signed-url error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
