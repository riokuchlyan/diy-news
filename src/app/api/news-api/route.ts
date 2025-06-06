import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('query') || request.nextUrl.searchParams.get('country');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const response = await fetch(`https://newsapi.org/v2/top-headlines?q=${query}&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`);
    const data = await response.json();

    return NextResponse.json(data);
}