import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AddNewsItems from './AddNewsItems'
import NewsItem from './NewsItem'
import Link from 'next/link'

export default async function NewsListPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  const { data: newsItems, error: newsError } = await supabase
    .from('userdata')
    .select('*')
    .eq('UID', user.id)

  if (newsError) {
    console.error('Error fetching news items:', newsError)
    return <div>Error loading news items</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Your News Items</h1>
          <p className="text-white">Simply add terms and we will send you a newsletter every morning.</p>
          <Link 
            href="/"
            className="mt-2 inline-block text-sm text-gray-400 hover:text-white hover:underline hover:underline-offset-4"
          >
            Return Home
          </Link>
        </div>
        
        <AddNewsItems />
        
        {newsItems && newsItems.length > 0 ? (
          <div className="space-y-4">
            {newsItems.map((item) => (
              <NewsItem 
                key={item.id} 
                id={item.id} 
                term={item['news-terms']} 
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">No news items found. Add some above!</p>
        )}
      </div>
    </div>
  )
}