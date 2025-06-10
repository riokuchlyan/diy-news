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

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to retry failed requests 
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const isRateLimit = error instanceof Error && 
                (error.message.includes('429') || error.message.includes('rate_limit_exceeded') || error.message.includes('Too many requests'));
            
            if (isRateLimit && attempt < maxRetries - 1) {
                const delayTime = baseDelay * Math.pow(2, attempt); 
                console.log(`Rate limit hit, retrying in ${delayTime}ms... (attempt ${attempt + 1}/${maxRetries})`);
                await delay(delayTime);
                continue;
            }
            throw error;
        }
    }
    throw new Error('Max retries exceeded');
}

async function processUsersWithRateLimit<T>(
    items: T[],
    processor: (item: T) => Promise<void>,
    delayBetweenUsers: number = 3000 
): Promise<void> {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await processor(item);
        
        // Add delay between users (except for the last one)
        if (i < items.length - 1) {
            console.log(`Waiting ${delayBetweenUsers}ms before processing next user...`);
            await delay(delayBetweenUsers);
        }
    }
}

// Helper function to process a single user with rate limiting
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

        // Process news items sequentially with delays to respect NewsAPI rate limits
        const newsWithSummaries: string[] = [];
        for (let i = 0; i < news.length; i++) {
            const item = news[i];
            try {
                const summary = await retryWithBackoff(async () => {
                    return await getParsedNews(item);
                });
                newsWithSummaries.push(`${item}\n\n${summary}`);
                
                // Add delay between news API calls (except for the last one)
                if (i < news.length - 1) {
                    await delay(1000); // 1 second between news API calls
                }
            } catch (error) {
                console.error(`Error getting summary for "${item}" (user ${uid}):`, error);
                if (error instanceof Error) {
                    if (error.message.includes('No articles found')) {
                        newsWithSummaries.push(`${item}\n\nNo recent articles found for this topic.`);
                    } else if (error.message.includes('No valid news data')) {
                        newsWithSummaries.push(`${item}\n\nFailed to retrieve news data.`);
                    } else if (error.message.includes('OpenAI API returned an unexpected response format')) {
                        newsWithSummaries.push(`${item}\n\nFailed to generate summary: AI service error.`);
                    } else if (error.message.includes('Failed to get OpenAI response')) {
                        newsWithSummaries.push(`${item}\n\nFailed to generate summary: OpenAI API error.`);
                    } else if (error.message.includes('News API error') || error.message.includes('429')) {
                        newsWithSummaries.push(`${item}\n\nFailed to generate summary: News API rate limit exceeded.`);
                    }
                } else {
                    newsWithSummaries.push(`${item}\n\nFailed to generate summary: Unknown error.`);
                }
            }
        }

        // Send email with retry logic for rate limits
        await retryWithBackoff(async () => {
            await sendEmail({
                email: String(email),
                subject: `Your Daily News Digest - ${new Date().toLocaleDateString()}`,
                data: newsWithSummaries
            });
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
        subject: `Your Daily News Digest - ${new Date().toLocaleDateString()}`,
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
        console.log(`Processing ${allUIDs.length} users sequentially with rate limiting...`);
        
        // Process users sequentially with delays to respect rate limits
        await processUsersWithRateLimit(
            allUIDs,
            (uid) => processUser(uid, data as UserData[]),
            3000 // 3 seconds between users to respect email rate limits (2 req/sec = 1 req per 500ms, so 3s is safe)
        );
        
        console.log('Newsletter processing completed');
    } catch (error) {
        console.error('Error in sendNewsletter:', error);
        throw error; // Re-throw to ensure proper error handling in the API route
    }
}
