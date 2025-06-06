import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt) {
    return "Error: Prompt required. Status 400";
  }

  const systemPrompt = `You are a professional news analyst. Your task is to provide a single paragraph of exactly 100 words summarizing ONLY THE MOST RECENT developments regarding this raw news data:"${prompt}". IMPORTANT: Only include information from this raw data. Focus on the most recent facts, figures, and implications. The response must be a single paragraph with no line breaks, no special characters, and no formatting. Do not include source attribution. Ensure your response is 100 words or less. If the topic is too vague or you cannot find recent information, respond with "No recent developments available for this topic."`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ 
        role: 'system', 
        content: systemPrompt 
      }],
      max_tokens: 200,
      temperature: 0.1,
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}