import { createClient } from '@/utils/supabase/server'

export type UserData = {
    id: number;
    UID: string;
    'news-terms': string;
}

export default async function getAllSupabaseData(): Promise<UserData[] | null> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('userdata')
            .select('id, UID, "news-terms"')

        if (error) {
            console.error('Error fetching user data:', error.message)
            return null
        }

        return data as UserData[]
    } catch (error) {
        console.error('Unexpected error fetching user data:', error)
        return null
    }
}