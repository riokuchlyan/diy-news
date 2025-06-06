import getAllSupabaseData from "@/utils/getAllSupabaseData";
import { getEmailFromUID } from "@/utils/getEmailFromUID";
import { getNewsFromUID } from "@/utils/getNewsFromUID";
import { sendEmail } from "@/utils/sendEmail";
import { getParsedNews } from "@/utils/getParsedNews";
import { getAllUIDFromData } from "@/utils/getAllUIDFromData";

export async function sendNewsletter() {
    const data = await getAllSupabaseData()
    if (!data) return
    const allUIDs = getAllUIDFromData(data)

    // Send newsletter to all users
    
    for (const uid of allUIDs) {
      const userNewsData = data
      .filter(user => user.UID === uid)
      .map(user => user['news-terms'])
      if (!userNewsData) return
      const email = await getEmailFromUID(uid)
      const news = await getNewsFromUID(uid)
      if (!news) return

      // Pre-fetch OpenAI responses for each news item
      const newsWithSummaries = await Promise.all(
          news.map(async (item) => {
              try {
                  const summary = await getParsedNews(item);
                  return `${item}\n\n${summary}`;
              } catch (error) {
                  console.error(`Error getting summary for "${item}":`, error);
                  return `${item}\n\nFailed to generate summary.`;
              }
          })
      );

      await sendEmail({
          email: String(email),
          subject: `Your Daily News Digest - ${new Date().toLocaleDateString()}`,
          data: newsWithSummaries
      })
    }
    

    // Send newsletter to a test user
    /*

    interface UserData {
    UID: string;
    'news-terms': string;
    }

    const userNewsData = data
    const uid = "82f58ce4-fb01-4393-ab17-17996e397f9a"
    const filteredData = (data as UserData[])
      .filter((user: UserData) => user.UID === uid)
      .map((user: UserData) => user['news-terms'])
    if (!filteredData) return
    const email = await getEmailFromUID(uid)
    const news = await getNewsFromUID(uid)
    if (!news) return

    // Pre-fetch OpenAI responses for each news item
    const newsWithSummaries = await Promise.all(
        news.map(async (item) => {
            try {
                const summary = await getParsedNews(item);
                return `${item}\n\n${summary}`;
            } catch (error) {
                console.error(`Error getting summary for "${item}":`, error);
                return `${item}\n\nFailed to generate summary.`;
            }
        })
    );

    await sendEmail({
        email: String(email),
        subject: `Your Daily News Digest - ${new Date().toLocaleDateString()}`,
        data: newsWithSummaries
    })
        */
    
}
