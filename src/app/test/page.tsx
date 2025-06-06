import getAllSupabaseData from '@/utils/getAllSupabaseData'
import { getEmailFromUID } from '@/utils/getEmailFromUID'
import { sendEmail } from '@/utils/sendEmail'

export default async function Test() {
    const data = await getAllSupabaseData()
    const email = await getEmailFromUID('82f58ce4-fb01-4393-ab17-17996e397f9a')
    await sendEmail({
        email: String(email),
        subject: 'Test',
        data: []
    })
    return <div>
        {JSON.stringify(data)}
        <p>{email}</p>
        
        </div>
}