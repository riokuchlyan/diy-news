import { sendNewsletter } from '@/services/news-letter/NewsLetter'
import getAllSupabaseData from '@/utils/getAllSupabaseData'
import { getAllUIDFromData } from '@/utils/getAllUIDFromData'
import { getNewsFromUID } from '@/utils/getNewsFromUID'

export default async function Test() {
    const data = await getAllSupabaseData()
    if (!data) return
    const uids = getAllUIDFromData(data)
    const news = await getNewsFromUID(uids[0])
    sendNewsletter()
    return <div>
        <p>{JSON.stringify(news)}</p>
    </div>
}