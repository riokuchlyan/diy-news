import { EmailTemplate } from '@/components/EmailTemplate';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, subject, data } = await request.json();

    const { data: responseData, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [email],
      subject,
      react: await EmailTemplate({ newsItems: data }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(responseData);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}