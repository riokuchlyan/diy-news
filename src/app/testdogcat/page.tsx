import { sendNewsletter } from "@/services/news-letter/NewsLetter";


export default async function Test() {
    try {
        await sendNewsletter()
        return <div>Sent newsletter</div>;
    } catch (error) {
        return <div>Error loading news: {error instanceof Error ? error.message : 'Unknown error'}</div>;
    }
}