//import { sendNewsletter } from "@/services/news-letter/NewsLetter";
import { sendNewsletterToTestUser } from "@/services/news-letter/NewsLetter";


export default async function Test() {
    try {
        //await sendNewsletter()
        await sendNewsletterToTestUser()
        return <div>Sent newsletter</div>;
    } catch (error) {
        return <div>Error loading news: {error instanceof Error ? error.message : 'Unknown error'}</div>;
    }
}