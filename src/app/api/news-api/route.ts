import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('query') || request.nextUrl.searchParams.get('country');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    console.log(`Making NewsData.io request for query: "${query}"`);

    try {
        const response = await fetch(`https://newsdata.io/api/1/latest?apikey=${process.env.NEWS_API_KEY}&q=${encodeURIComponent(query)}&language=en`);
        
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
            articles: data.results ? data.results.map((article: any) => ({
                title: article.title,
                description: article.description,
                content: article.content,
                url: article.link,
                publishedAt: article.pubDate,
                source: { name: article.source_name }
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