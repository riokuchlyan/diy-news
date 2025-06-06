import getAllSupabaseData from "@/utils/getAllSupabaseData";
import { getEmailFromUID } from "@/utils/getEmailFromUID";
import { getNewsFromUID } from "@/utils/getNewsFromUID";
import { sendEmail } from "@/utils/sendEmail";

export async function sendNewsletter() {
  /*
    const data = await getAllSupabaseData()
    if (!data) return
    for (const user of data) {
        const email = await getEmailFromUID(user.UID)
        if (!email) continue
        await sendEmail({
            email: String(email),
            subject: 'Test',
            data: []
        })
    }
        */
    const data = await getAllSupabaseData()
    if (!data) return
    const userNewsData = data
        .filter(user => user.UID === '82f58ce4-fb01-4393-ab17-17996e397f9a')
        .map(user => user['news-terms'])
    if (!userNewsData) return
    const email = await getEmailFromUID(data[0].UID)
    const news = await getNewsFromUID(data[0].UID)
    if (!news) return
    await sendEmail({
        email: String(email),
        subject: `DIY News for ${new Date().toLocaleDateString()}`,
        data: ["hi", "hello"]
    })
}
