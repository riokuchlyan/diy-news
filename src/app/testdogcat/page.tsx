import { sendNewsletter } from "@/services/news-letter/NewsLetter";

export default async function Test() {
    await sendNewsletter()
    return <div>Test</div>
}