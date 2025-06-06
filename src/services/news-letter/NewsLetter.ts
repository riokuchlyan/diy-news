import getAllSupabaseData from "@/utils/getAllSupabaseData";
import { getEmailFromUID } from "@/utils/getEmailFromUID";
import { getNewsFromUID } from "@/utils/getNewsFromUID";
import { sendEmail } from "@/utils/sendEmail";
import { getOpenAIResponse } from "@/utils/getOpenAIResponse";

export async function sendNewsletter() {
  

    const data = await getAllSupabaseData()
    if (!data) return
    const userNewsData = data
        .filter(user => user.UID === '82f58ce4-fb01-4393-ab17-17996e397f9a')
        .map(user => user['news-terms'])
    if (!userNewsData) return
    const email = await getEmailFromUID(data[0].UID)
    const news = await getNewsFromUID(data[0].UID)
    if (!news) return

    // Pre-fetch OpenAI responses for each news item
    const newsWithSummaries = await Promise.all(
        news.map(async (item) => {
            try {
                const summary = await getOpenAIResponse(item);
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
