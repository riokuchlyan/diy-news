export async function getNews(query: string) {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`${process.env.HOST_URL}/api/news-api?query=${encodedQuery}`);
    const data = await response.json();

    return data;
}