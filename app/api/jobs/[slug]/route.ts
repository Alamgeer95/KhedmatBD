// app/api/jobs/[slug]/route.ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getJob } from '@/lib/jobs';

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const job = await getJob(slug);

    if (!job || job.published === false) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ item: job });
  } catch (e) {
    console.error('jobs/[slug] GET error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
