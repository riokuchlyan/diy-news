import { NextRequest, NextResponse } from 'next/server';
import { EmailClient } from "@azure/communication-email";

const connectionString = process.env.COMMUNICATION_SERVICES_CONNECTION_STRING!;
const client = new EmailClient(connectionString);

export interface EmailParams {
  email: string;
  subject: string;
  data: string[];
}

export interface NewsItem {
  title: string;
  description: string;
  url: string;
}

async function sendAzureEmail({ email, subject, data }: EmailParams) {
    const emailMessage = {
        senderAddress: process.env.EMAIL_FROM!,
        content: {
            subject: subject,
            plainText: data.join('\n'),
            html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>${subject}</title>
				<style>
					body {
						font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
						line-height: 1.6;
						color: #333;
						background-color: #f8f9fa;
						margin: 0;
						padding: 0;
					}
					.container {
						max-width: 600px;
						margin: 0 auto;
						background-color: #ffffff;
						box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
						border-radius: 8px;
						overflow: hidden;
					}
					.header {
						background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
						color: white;
						padding: 30px 20px;
						text-align: center;
					}
					.header h1 {
						margin: 0;
						font-size: 28px;
						font-weight: 600;
						letter-spacing: -0.5px;
					}
					.content {
						padding: 30px 20px;
					}
					.news-item {
						background-color: #f8f9fa;
						border-left: 4px solid #667eea;
						padding: 20px;
						margin-bottom: 20px;
						border-radius: 0 8px 8px 0;
					}
					.news-item:last-child {
						margin-bottom: 0;
					}
					.footer {
						background-color: #f8f9fa;
						padding: 20px;
						text-align: center;
						border-top: 1px solid #e9ecef;
						color: #6c757d;
						font-size: 14px;
					}
					.footer p {
						margin: 5px 0;
					}
					@media only screen and (max-width: 600px) {
						.container {
							margin: 10px;
							border-radius: 4px;
						}
						.header {
							padding: 20px 15px;
						}
						.header h1 {
							font-size: 24px;
						}
						.content {
							padding: 20px 15px;
						}
						.news-item {
							padding: 15px;
						}
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>${subject}</h1>
					</div>
					<div class="content">
						${data.map((item) => {
							const parts = item.split('\n\n');
							const title = parts[0];
							const content = parts.slice(1).join('\n\n');
							return `
							<div class="news-item">
								<h3 style="margin: 0 0 10px 0; font-size: 18px; color: #667eea; font-weight: 600;">${title}</h3>
								<p style="margin: 0; font-size: 16px; color: #333; line-height: 1.6;">${content}</p>
							</div>
						`;
						}).join('')}
					</div>
					<div class="footer">
						<p>Unsubscribe by removing all news items from your account at <a href="https://diynews.xyz">https://diynews.xyz</a></p>
					</div>
				</div>
			</body>
			</html>`,
        },
        recipients: {
            to: [{ address: email }],
        },
        
    };

    const poller = await client.beginSend(emailMessage);
    await poller.pollUntilDone();
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, subject, data } = body;
        
        if (!email) {
            return NextResponse.json(
                { error: 'email is required in request body' },
                { status: 400 }
            );
        }

        if (!subject) {
            return NextResponse.json(
                { error: 'subject is required in request body' },
                { status: 400 }
            );
        }

        if (!data || !Array.isArray(data)) {
            return NextResponse.json(
                { error: 'data array is required in request body' },
                { status: 400 }
            );
        }

        await sendAzureEmail({ email, subject, data });
        return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
}

export async function sendEmail({ email, subject, data }: EmailParams) {
  await sendAzureEmail({ email, subject, data });
}