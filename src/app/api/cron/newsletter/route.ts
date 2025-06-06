import { NextResponse } from 'next/server';
import { sendNewsletterToTestUser } from '@/services/news-letter/NewsLetter';

export async function GET(request: Request) {
  try {
    await sendNewsletterToTestUser();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter cron job error:', error);
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 });
  }
} 