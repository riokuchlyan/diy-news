import { NextResponse } from 'next/server';
import { sendNewsletterToTestUser } from '@/services/news-letter/NewsLetter';

export async function GET(request: Request) {
  try {
    // Check if this is a Vercel cron request
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    if (!isVercelCron) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await sendNewsletterToTestUser();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter cron job error:', error);
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 });
  }
} 