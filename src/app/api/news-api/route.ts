import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limit map: query -> last request timestamp
const rateLimitMap: Map<string, number> = new Map();

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fallback content when NewsAPI is rate limited
const getFallbackContent = (query: string) => ({
    status: "ok",
    totalResults: 1,
    articles: [
        {
            title: `Latest updates on ${query}`,
            description: `We're experiencing high demand for news content. Please check back later for the latest updates on ${query}.`,
            content: `Due to API rate limits, we're unable to fetch the latest news for "${query}" at this time. Please try again later or check our website for updates.`,
            url: "#",
            publishedAt: new Date().toISOString(),
            source: { name: "DIY News" }
        }
    ]
});

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('query') || request.nextUrl.searchParams.get('country');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Per-query rate limiting: 1 request per 2 seconds per query
    const now = Date.now();
    const lastRequest = rateLimitMap.get(query);
    if (lastRequest && (now - lastRequest) < 2000) {
        const waitTime = 2000 - (now - lastRequest);
        console.log(`Query rate limit for "${query}": waiting ${waitTime}ms`);
        await delay(waitTime);
    }
    rateLimitMap.set(query, Date.now());

    console.log(`Making NewsAPI request for query: "${query}"`);

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
                    console.log(`Returning fallback content for query: "${query}"`);
                    return NextResponse.json(getFallbackContent(query));
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