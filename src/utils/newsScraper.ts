import axios from 'axios';
import * as cheerio from 'cheerio';

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  description: string;
  publishedAt?: string;
  imageUrl?: string;
}

export async function scrapeBingNews(query: string): Promise<string> {
  try {

    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.bing.com/news/search?q=${encodedQuery}`;

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    };

    const response = await axios.get(url, { headers });
    const html = response.data;
    const $ = cheerio.load(html);

    const articles: NewsArticle[] = [];

    // Bing News articles are typically in elements with class 'news-card'
    // We'll look for various possible selectors
    const selectors = [
      '.news-card',
      '.news-item',
      '.news-card-container',
      '[data-testid="news-card"]',
      '.news-card-wrapper'
    ];

    let foundArticles = false;

    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        foundArticles = true;
        
        elements.each((index: number, element: cheerio.Element) => {
          const $element = $(element);
          
          const title = $element.find('h2, h3, .title, .news-title').first().text().trim();
          
          const linkElement = $element.find('a').first();
          const url = linkElement.attr('href') || '';
          
          const source = $element.find('.source, .news-source, .publisher').first().text().trim();
          
          const description = $element.find('.description, .news-description, .snippet').first().text().trim();
          
          const imageElement = $element.find('img').first();
          const imageUrl = imageElement.attr('src') || imageElement.attr('data-src') || '';
          
          const publishedAt = $element.find('.time, .date, .published').first().text().trim();

          if (title && url) {
            articles.push({
              title,
              url: url.startsWith('http') ? url : `https://www.bing.com${url}`,
              source: source || 'Unknown',
              description: description || '',
              publishedAt: publishedAt || undefined,
              imageUrl: imageUrl || undefined,
            });
          }
        });
        
        break;
      }
    }

    if (!foundArticles) {
      $('a[href*="/news/"], a[href*="news"], a[href*="article"]').each((index: number, element: cheerio.Element) => {
        const $element = $(element);
        const title = $element.text().trim();
        const url = $element.attr('href') || '';
        
        if (title && url && title.length > 10) {
          articles.push({
            title,
            url: url.startsWith('http') ? url : `https://www.bing.com${url}`,
            source: 'Bing News',
            description: '',
          });
        }
      });
    }

    return JSON.stringify({
      articles,
      totalResults: articles.length,
      query,
      scrapedAt: new Date().toISOString(),
    }, null, 2);

  } catch (error) {
    console.error('Scraping error:', error);
    return JSON.stringify({
      error: 'SCRAPING_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      query,
    }, null, 2);
  }
}