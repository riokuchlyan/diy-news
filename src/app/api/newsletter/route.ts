import { NextResponse } from 'next/server';
import { sendNewsletter } from '@/services/news-letter/NewsLetter';
//import { sendNewsletterToTestUser } from '@/services/news-letter/NewsLetter'; // for testing

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await sendNewsletter();
    //await sendNewsletterToTestUser(); // for testing
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter API error:', error);
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 });
  }
} 