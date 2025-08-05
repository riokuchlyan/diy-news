import getAllSupabaseData from "@/utils/getAllSupabaseData";
import { getEmailFromUID } from "@/utils/getEmailFromUID";
import { getNewsFromUID } from "@/utils/getNewsFromUID";
import { sendEmail } from "@/utils/sendEmail";
import { getParsedNews } from "@/utils/getParsedNews";
import { getAllUIDFromData } from "@/utils/getAllUIDFromData";

interface UserData {
    UID: string;
    'news-terms': string;
}

async function processUser(uid: string, data: UserData[]): Promise<void> {
    try {
        const userNewsData = data
            .filter(user => user.UID === uid)
            .map(user => user['news-terms']);
        
        if (!userNewsData || userNewsData.length === 0) {
            console.log(`No news data found for user ${uid}`);
            return;
        }
        
        const email = await getEmailFromUID(uid);
        if (!email) {
            console.error(`No email found for user ${uid}`);
            return;
        }
        
        const news = await getNewsFromUID(uid);
        if (!news || news.length === 0) {
            console.log(`No news topics found for user ${uid}`);
            return;
        }

        console.log(`Processing ${news.length} news topics for user ${uid}...`);

        const newsWithSummaries = await Promise.all(
            news.map(async (item) => {
                try {
                    const summary = await getParsedNews(item);
                    return `${item}\n\n${summary}`;
                } catch (error) {
                    console.error(`Error getting summary for "${item}" (user ${uid}):`, error);
                    if (error instanceof Error) {
                        if (error.message.includes('No articles found')) {
                            return `${item}\n\nNo recent articles found for this topic.`;
                        } else if (error.message.includes('No valid news data')) {
                            return `${item}\n\nFailed to retrieve news data.`;
                        } else if (error.message.includes('OpenAI API returned an unexpected response format')) {
                            return `${item}\n\nFailed to generate summary: AI service error.`;
                        } else if (error.message.includes('Failed to get OpenAI response')) {
                            return `${item}\n\nFailed to generate summary: OpenAI API error.`;
                        } else if (error.message.includes('News API error')) {
                            return `${item}\n\nFailed to generate summary: News API error.`;
                        }
                    }
                    return `${item}\n\nFailed to generate summary: Unknown error.`;
                }
            })
        );

        await sendEmail({
            email: String(email),
            subject: `DIY News: Your Daily News Digest - ${new Date().toLocaleDateString()}`,
            data: newsWithSummaries
        });
        
        console.log(`Newsletter sent successfully to ${email} (${uid})`);
    } catch (error) {
        console.error(`Failed to process user ${uid}:`, error);
    }
}

export async function sendNewsletterToTestUser() {
    const data = await getAllSupabaseData()
    if (!data) return
    
    const uid = "82f58ce4-fb01-4393-ab17-17996e397f9a" // test user
    const filteredData = (data as UserData[])
      .filter((user: UserData) => user.UID === uid)
      .map((user: UserData) => user['news-terms'])
    if (!filteredData) return
    const email = await getEmailFromUID(uid)
    const news = await getNewsFromUID(uid)
    if (!news) return

    const newsWithSummaries = await Promise.all(
        news.map(async (item) => {
            try {
                const summary = await getParsedNews(item);
                return `${item}\n\n${summary}`;
            } catch (error) {
                console.error(`Error getting summary for "${item}":`, error);
                if (error instanceof Error) {
                    if (error.message.includes('Failed to get OpenAI response')) {
                        return `${item}\n\nFailed to generate summary: OpenAI API error.`;
                    } else if (error.message.includes('News API error')) {
                        return `${item}\n\nFailed to generate summary: News API error.`;
                    }
                }
                return `${item}\n\nFailed to generate summary: Unknown error.`;
            }
        })
    );

    await sendEmail({
        email: String(email),
        subject: `DIY News: Your Daily News Digest - ${new Date().toLocaleDateString()}`,
        data: newsWithSummaries
    })
}

export async function sendNewsletter() {
    try {
        const data = await getAllSupabaseData();
        if (!data) {
            console.log('No data found from Supabase');
            return;
        }
        
        const allUIDs = getAllUIDFromData(data);
        console.log(`Processing ${allUIDs.length} users in parallel...`);
        
        await Promise.all(
            allUIDs.map(uid => processUser(uid, data as UserData[]))
        );
        
        console.log('Newsletter processing completed');
    } catch (error) {
        console.error('Error in sendNewsletter:', error);
        throw error;
    }
}
