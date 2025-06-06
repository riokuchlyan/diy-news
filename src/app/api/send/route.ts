import { EmailTemplate } from '@/components/EmailTemplate';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, subject, data } = await request.json();

    if (!email || !subject || !data) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: responseData, error } = await resend.emails.send({
      from: `DIY News <${process.env.EMAIL_FROM}>`,
      to: [email],
      subject,
      react: await EmailTemplate({ newsItems: data }),
    });

    if (error) {
      console.error('Error sending email:', error);
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(responseData);
  } catch (error) {
    console.error('Unexpected error in send API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}