import { createClient } from '@supabase/supabase-js'

export async function getEmailFromUID(uid: string): Promise<string | null> {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        
        const { data: { user }, error } = await supabase.auth.admin.getUserById(uid)

        if (error) {
            console.error('Error fetching user email:', error.message)
            return null
        }

        return user?.email || null
    } catch (error) {
        console.error('Unexpected error fetching user email:', error)
        return null
    }
}
