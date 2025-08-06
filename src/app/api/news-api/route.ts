import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limit map: query -> last request timestamp
const rateLimitMap: Map<string, number> = new Map();

// Global rate limit to ensure we don't exceed NewsAPI's 1 request per second limit
let lastGlobalRequest = 0;

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('query') || request.nextUrl.searchParams.get('country');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Global rate limiting: ensure at least 1 second between ANY requests to NewsAPI
    const now = Date.now();
    const timeSinceLastGlobalRequest = now - lastGlobalRequest;
    if (timeSinceLastGlobalRequest < 1000) {
        const waitTime = 1000 - timeSinceLastGlobalRequest;
        console.log(`Global rate limit: waiting ${waitTime}ms before next NewsAPI request`);
        await delay(waitTime);
    }
    lastGlobalRequest = Date.now();

    // Per-query rate limiting: 1 request per 5 seconds per query (very conservative)
    const lastRequest = rateLimitMap.get(query);
    if (lastRequest && (now - lastRequest) < 5000) {
        const waitTime = 5000 - (now - lastRequest);
        console.log(`Query rate limit for "${query}": waiting ${waitTime}ms`);
        await delay(waitTime);
    }
    rateLimitMap.set(query, Date.now());

    console.log(`Making NewsAPI request for query: "${query}"`);

    // Retry mechanism for NewsAPI rate limits
    const maxRetries = 2; // Reduced retries to be more conservative
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            const response = await fetch(`https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`);
            
            if (response.status === 429) {
                // NewsAPI rate limit hit - wait and retry
                retryCount++;
                if (retryCount < maxRetries) {
                    const waitTime = Math.pow(2, retryCount) * 2000; // Exponential backoff: 4s, 8s
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
            
            console.log(`Successfully fetched data for query: "${query}"`);
            return NextResponse.json(data);
        } catch (error) {
            console.error('Error calling NewsAPI:', error);
            return NextResponse.json({ 
                error: 'Failed to call NewsAPI' 
            }, { status: 500 });
        }
    }
}