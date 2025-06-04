import { createClient } from '@/utils/supabase/server';

export default async function UserData() {
  const supabase = await createClient();
  const { data: userData } = await supabase.from("userdata").select();

  return <pre>{JSON.stringify(userData, null, 2)}</pre>
}