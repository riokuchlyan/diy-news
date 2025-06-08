//import { sendNewsletterToTestUser } from '@/services/news-letter/NewsLetter' // for testing
import { sendNewsletter } from '@/services/news-letter/NewsLetter'

export async function GET(request: Request) {
  
  const authHeader = request.headers.get('authorization');

  if (authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7) === process.env.CRON_SECRET) {
    try {
      //await sendNewsletterToTestUser() // for testing
      await sendNewsletter()
      return new Response('Newsletter sent successfully', { status: 200 })
    } catch (error) {
      console.error('Error sending newsletter:', error)
      return new Response('Error sending newsletter', { status: 500 })
    }
  }
  else {
    return new Response('Unauthorized', { status: 401 })
  }

}