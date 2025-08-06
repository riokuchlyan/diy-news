import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limit map: query -> last request timestamp
const rateLimitMap: Map<string, number> = new Map();

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('query') || request.nextUrl.searchParams.get('country');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Rate limiting: 1 request per 2 seconds per query (more conservative)
    const now = Date.now();
    const lastRequest = rateLimitMap.get(query);
    if (lastRequest && (now - lastRequest) < 2000) {
        return NextResponse.json({
            error: 'Rate limit exceeded. Please wait 2 seconds between requests.'
        }, { status: 429 });
    }
    rateLimitMap.set(query, now);

    // Retry mechanism for NewsAPI rate limits
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            const response = await fetch(`https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`);
            
            if (response.status === 429) {
                // NewsAPI rate limit hit - wait and retry
                retryCount++;
                if (retryCount < maxRetries) {
                    const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff: 2s, 4s, 8s
                    console.log(`NewsAPI rate limit hit for query "${query}". Retrying in ${waitTime}ms (attempt ${retryCount}/${maxRetries})`);
                    await delay(waitTime);
                    continue;
                } else {
                    console.error('NewsAPI rate limit exceeded after all retries for query:', query);
                    return NextResponse.json({ 
                        error: 'NewsAPI rate limit exceeded. Please try again later.' 
                    }, { status: 429 });
                }
            }
            
            if (!response.ok) {
                console.error('NewsAPI error:', response.status, response.statusText);
                return NextResponse.json({ 
                    error: `NewsAPI error: ${response.status} ${response.statusText}` 
                }, { status: response.status });
            }
            
            const data = await response.json();
            
            if (data.status === 'error') {
                console.error('NewsAPI error:', data.code, data.message);
                return NextResponse.json({ 
                    error: `NewsAPI error: ${data.message}` 
                }, { status: 400 });
            }
            
            return NextResponse.json(data);
        } catch (error) {
            console.error('Error calling NewsAPI:', error);
            return NextResponse.json({ 
                error: 'Failed to call NewsAPI' 
            }, { status: 500 });
        }
    }
}