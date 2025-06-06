import { createClient } from '@supabase/supabase-js'

export async function getNewsFromUID(uid: string): Promise<string[] | null> {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        
        const { data, error } = await supabase.from('userdata').select('"news-terms"').eq('UID', uid)

        if (error) {
            console.error('Error fetching user news:', error.message)
            return null
        }

        return data?.map(item => item['news-terms']) || null
    } catch (error) {
        console.error('Unexpected error fetching user news:', error)
        return null
    }
}
