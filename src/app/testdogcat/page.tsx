//import { sendNewsletter } from "@/services/news-letter/NewsLetter";
import { getParsedNews } from "@/utils/getParsedNews";

export default async function Test() {
    const parsedNews = await getParsedNews("dog")
    //await sendNewsletter()
    return <div>{parsedNews}</div>
}