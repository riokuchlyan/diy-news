import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const systemPrompt = `You are a professional news analyst. Provide a single paragraph of exactly 100 words summarizing the latest developments regarding "${prompt}". Include only the most recent and significant information from reputable sources (major news outlets, official statements, verified reports). Focus on key facts, figures, and implications while avoiding speculation. Ensure all information is from the last 24 hours and cross-verified from multiple reliable sources. The response must be a single paragraph with no line breaks, no special characters, and no formatting. Do not include source attribution. The text should flow naturally as one continuous paragraph without any breaks or pauses.`;

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
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}