import { scrapeBingNews } from "./newsScraper";

export async function getNews(query: string) {
    const response = await scrapeBingNews(query);
    return response;
}