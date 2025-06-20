import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt, query } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  let systemPrompt = `You are a professional news analyst. Your task is to provide a single paragraph of exactly 100 words summarizing ONLY THE MOST RECENT developments regarding this raw news data:"${prompt}".`;
  
  if (query && query.trim()) {
    systemPrompt += ` Pay special attention and only include to information related to: "${query.trim()}" which is the main news topic you are covering.`;
  }
  
  systemPrompt += ` IMPORTANT: Only include information from this raw data. Focus on the most recent facts, figures, and implications. The response must be a single paragraph with no line breaks, no special characters, and no formatting. ALSO IMPORTANT: Only include crucial news and headlines and breaking news or anything you deem important in your message, ignoring superficial news. Do not include source attribution. Ensure your response is 100 words or less. If the topic is too vague or you cannot find recent information, find something in the data you are given and state it, but do not state that you cannot find any information because you are delivering it to a user. Under no circumstances should you hallucinate or make up information.`;

  try {
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

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return NextResponse.json({ 
        error: `OpenAI API error: ${response.status} ${response.statusText}` 
      }, { status: response.status });
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API error:', data.error);
      return NextResponse.json({ 
        error: `OpenAI API error: ${data.error.message || 'Unknown error'}` 
      }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return NextResponse.json({ 
      error: 'Failed to call OpenAI API' 
    }, { status: 500 });
  }
}