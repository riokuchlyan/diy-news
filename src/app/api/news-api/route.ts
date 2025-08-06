import { NextRequest, NextResponse } from 'next/server';

// Define the type for newsdata.io article structure
interface NewsDataArticle {
    title: string;
    description: string;
    content: string;
    link: string;
    pubDate: string;
    source_name: string;
}

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('query') || request.nextUrl.searchParams.get('country');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    console.log(`Making NewsData.io request for query: "${query}"`);

    try {
        // Ensure API key is properly encoded and use the exact format that works
        const apiKey = process.env.NEWS_API_KEY;
        if (!apiKey) {
            console.error('NEWS_API_KEY environment variable is not set');
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=${encodeURIComponent(query)}&language=en`;
        console.log(`Requesting URL: ${url.replace(apiKey, '***')}`); // Log URL without exposing API key

        const response = await fetch(url);
        
        if (response.status === 401) {
            console.error('NewsData.io authentication failed. Check API key.');
            return NextResponse.json({ 
                error: 'NewsData.io authentication failed. Check API key configuration.' 
            }, { status: 401 });
        }
        
        if (response.status === 429) {
            console.error('NewsData.io rate limit exceeded for query:', query);
            return NextResponse.json({ 
                error: 'NewsData.io rate limit exceeded. Please try again later.' 
            }, { status: 429 });
        }
        
        if (!response.ok) {
            console.error('NewsData.io error:', response.status, response.statusText);
            return NextResponse.json({ 
                error: `NewsData.io error: ${response.status} ${response.statusText}` 
            }, { status: response.status });
        }
        
        const data = await response.json();
        
        if (data.status === 'error') {
            console.error('NewsData.io error:', data.code, data.message);
            return NextResponse.json({ 
                error: `NewsData.io error: ${data.message}` 
            }, { status: 400 });
        }
        
        const adaptedData = {
            status: data.status,
            totalResults: data.totalResults,
            articles: data.results ? data.results.map((article: NewsDataArticle) => ({
                title: article.title,
                description: article.description,
                url: article.link,
                publishedAt: article.pubDate,
                source: { name: article.source_name }
                // Removed content field as it's only available in paid plans
            })) : []
        };
        
        console.log(`Successfully fetched data for query: "${query}"`);
        return NextResponse.json(adaptedData);
    } catch (error) {
        console.error('Error calling NewsData.io:', error);
        return NextResponse.json({ 
            error: 'Failed to call NewsData.io' 
        }, { status: 500 });
    }
}