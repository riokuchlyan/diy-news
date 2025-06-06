//import { sendNewsletter } from "@/services/news-letter/NewsLetter";
import { getParsedNews } from "@/utils/getParsedNews";

export default async function Test() {
    try {
        const parsedNews = await getParsedNews("education");
        return <div>{parsedNews}</div>;
    } catch (error) {
        console.error('Error in test page:', error);
        return <div>Error loading news: {error instanceof Error ? error.message : 'Unknown error'}</div>;
    }
}