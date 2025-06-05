import { NextResponse } from 'next/server';
import { sendNewsletter } from '@/services/news-letter/NewsLetter';

export async function POST(request: Request) {
  try {
    // Verify the request is authorized (you can add your own authorization logic here)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NEWSLETTER_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await sendNewsletter();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter API error:', error);
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 });
  }
} 