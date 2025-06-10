import { getNews } from "./getNews";
import { getOpenAIResponse } from "./getOpenAIResponse";

export async function getParsedNews(query: string) {
    const news = await getNews(query);
    
    if (!news || typeof news !== 'object') {
        throw new Error(`No valid news data received for query: ${query}`);
    }
    
    if (!news.articles || !Array.isArray(news.articles) || news.articles.length === 0) {
        throw new Error(`No articles found for query: ${query}`);
    }
    
    const stringnews = JSON.stringify(news);
    const response = await getOpenAIResponse(stringnews, query);
    return response;
}