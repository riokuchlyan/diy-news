import { createClient } from '@/utils/supabase/server'
import { Database } from '@/types/supabase'

export type UserData = Database['public']['Tables']['userdata']['Row']

export default async function getAllSupabaseData(): Promise<UserData[] | null> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('userdata')
            .select('*')

        if (error) {
            console.error('Error fetching user data:', error.message)
            return null
        }

        return data
    } catch (error) {
        console.error('Unexpected error fetching user data:', error)
        return null
    }
}