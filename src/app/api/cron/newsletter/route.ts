import { NextResponse } from 'next/server';
import { sendNewsletterToTestUser } from '@/services/news-letter/NewsLetter';

export async function GET(request: Request) {
  try {
    console.log('Cron job started at:', new Date().toISOString());
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));

    // Check if this is a Vercel cron request
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    console.log('Is Vercel cron:', isVercelCron);

    if (!isVercelCron) {
      console.log('Unauthorized request - not a Vercel cron');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting newsletter send...');
    await sendNewsletterToTestUser();
    console.log('Newsletter sent successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter cron job error:', error);
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 });
  }
} 