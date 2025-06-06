const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://diy-news-seven.vercel.app';

export interface NewsItem {
  title: string;
  description: string;
  url: string;
}

export interface EmailParams {
  email: string;
  subject: string;
  data: string[];
}

export async function sendEmail({ email, subject, data }: EmailParams) {
  const response = await fetch(`${API_BASE_URL}/api/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      subject,
      data,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send email');
  }

  return response.json();
}