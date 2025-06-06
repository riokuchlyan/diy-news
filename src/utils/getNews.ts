export async function getNews(query: string) {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`${process.env.HOST_URL}/api/news-api?query=${encodedQuery}`, {
        headers: {
            'x-api-key': process.env.API_SECRET_KEY!
        }
    });
    
    if (!response.ok) {
        throw new Error('News API error: ' + response.statusText);
    }
    
    const data = await response.json();
    return data;
}