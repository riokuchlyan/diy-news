import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('query') || request.nextUrl.searchParams.get('country');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`);
        
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