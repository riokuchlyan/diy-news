export async function getNews(query: string) {
    const response = await fetch(`/api/news-api?country=${query}`);
    const data = await response.json();

    return data;
}