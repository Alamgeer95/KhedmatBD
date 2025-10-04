import { getJson } from '@/lib/storage';

export async function getJob(slug: string) {
  try {
    const jobData = await getJson(`jobs/${slug}/job.json`);
    console.log('Loaded job for slug:', slug, 'Data:', jobData); // ডিবাগ লগ
    return jobData;
  } catch (error) {
    console.error('Error loading job:', error);
    return null;
  }
}