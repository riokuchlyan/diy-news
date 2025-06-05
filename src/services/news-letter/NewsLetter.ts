import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/utils/sendEmail';

// Create a Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin access
);

export async function sendNewsletter() {
  try {
    // Fetch all users and their news items
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        email,
        news_items (
          title,
          description,
          url
        )
      `);

    if (usersError) throw usersError;

    // Send personalized email to each user
    for (const user of users) {
      if (!user.email || !user.news_items?.length) continue;

      await sendEmail({
        email: user.email,
        subject: 'Your Daily News Digest',
        data: user.news_items
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Newsletter error:', error);
    throw error;
  }
}
