const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface EmailParams {
  email: string;
  subject: string;
  data: any;
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