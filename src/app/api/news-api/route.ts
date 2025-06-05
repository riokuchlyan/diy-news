import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const response = await fetch(`https://newsapi.org/v2/everything?q=${query}&from=2025-05-04&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`);
    const data = await response.json();

    return NextResponse.json(data);
}