import { getNews } from "./getNews";
import { getOpenAIResponse } from "./getOpenAIResponse";

export async function getParsedNews(query: string) {
    const news = await getNews(query);
    const stringnews = JSON.stringify(news);
    const response = await getOpenAIResponse(stringnews);
    return response;
}