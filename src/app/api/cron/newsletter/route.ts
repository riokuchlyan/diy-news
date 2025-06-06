import { sendNewsletterToTestUser } from '@/services/news-letter/NewsLetter'
//import { sendNewsletter } from '@/services/news-letter/NewsLetter'

/**
 * Vercel Cron Job Handler
 * This endpoint is called by Vercel's cron system to send the daily newsletter
 * It verifies the request is coming from Vercel's cron system using the x-vercel-cron header
 */
export async function GET(request: Request) {

  const isVercelCron = request.headers.get('x-vercel-cron') === '1'  
  if (!isVercelCron) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    await sendNewsletterToTestUser()
    //await sendNewsletter()
    return new Response('Newsletter sent successfully', { status: 200 })
  } catch (error) {
    console.error('Error sending newsletter:', error)
    return new Response('Error sending newsletter', { status: 500 })
  }
} 