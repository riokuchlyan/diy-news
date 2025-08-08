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
    const baseUrl = `https://www.bing.com/news/search?q=${encodedQuery}&FORM=HDRSC6`;

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Referer': 'https://www.bing.com/news'
    } as const;

    // Helpers scoped to function to avoid exporting anything extra
    const resolveBingHref = (href: string): string => {
      if (!href) return '';
      const absolute = href.startsWith('http') ? href : `https://www.bing.com${href}`;
      try {
        const u = new URL(absolute);
        const urlParam = u.searchParams.get('url');
        if (u.pathname.includes('/news/apiclick') && urlParam) {
          return decodeURIComponent(urlParam);
        }
        return absolute;
      } catch {
        return absolute;
      }
    };

    const extractDomain = (maybeUrl: string): string => {
      try {
        const hostname = new URL(maybeUrl).hostname;
        return hostname.replace(/^www\./, '');
      } catch {
        return 'Bing News';
      }
    };

    const articles: NewsArticle[] = [];
    const seenUrls = new Set<string>();

    // 1) Try RSS first – higher recall for broad queries like "sports"
    const rssCandidates = [
      `https://www.bing.com/news/search?q=${encodedQuery}&format=RSS`,
      `https://www.bing.com/news/search?q=${encodedQuery}&format=rss`,
      `https://www.bing.com/news/search?q=${encodedQuery}&format=RSS&mkt=en-US`,
      `https://www.bing.com/news/search?q=${encodedQuery}&format=RSS&setlang=en-US&setmkt=en-US`,
      `https://www.bing.com/news/search?q=${encodedQuery}&format=RSS&cc=US`,
      // Sort by date
      `https://www.bing.com/news/search?q=${encodedQuery}&format=RSS&qft=sortbydate%3d%221%22`,
    ];

    for (const rssUrl of rssCandidates) {
      try {
        const rssResponse = await axios.get(rssUrl, {
          headers: { ...headers, Accept: 'application/rss+xml, application/xml;q=0.9, */*;q=0.8' },
        });
        const rssXml = rssResponse.data as string;
        const $rss = cheerio.load(rssXml, { xmlMode: true });

        $rss('item').each((_, item) => {
          const $item = $rss(item);
          const title = $item.find('title').first().text().trim();
          const link = $item.find('link').first().text().trim();
          const descriptionRaw = $item.find('description').first().text().trim();
          // Strip HTML tags from RSS description without re-parsing
          const description = descriptionRaw.replace(/<[^>]+>/g, '').trim();
          const source = $item.find('source').first().text().trim() || extractDomain(link);
          const pubDate = $item.find('pubDate').first().text().trim();

          if (title && link && !seenUrls.has(link)) {
            seenUrls.add(link);
            articles.push({
              title,
              url: link,
              source,
              description,
              publishedAt: pubDate || undefined,
            });
          }
        });

        if (articles.length > 0) break;
      } catch {
        // Try next candidate
      }
    }

    if (articles.length > 0) {
      return JSON.stringify({
        articles,
        totalResults: articles.length,
        query,
        scrapedAt: new Date().toISOString(),
      }, null, 2);
    }

    // 2) Fallback to HTML – try multiple variants to increase recall
    const htmlCandidates = [
      baseUrl,
      `${baseUrl}&mkt=en-US&setlang=en-US`,
      `${baseUrl}&qft=sortbydate%3d%221%22`,
      `${baseUrl}&qft=interval%3d%227%22`,
      `${baseUrl}&cc=US`,
    ];

    let $: ReturnType<typeof cheerio.load> | null = null;
    for (const htmlUrl of htmlCandidates) {
      try {
        const response = await axios.get(htmlUrl, { headers });
        const html = response.data as string;
        const candidate = cheerio.load(html);
        if (candidate('body').length) {
          $ = candidate;
          break;
        }
      } catch {
        // Try next variant
      }
    }

    if (!$) {
      return JSON.stringify({
        articles: [],
        totalResults: 0,
        query,
        scrapedAt: new Date().toISOString(),
      }, null, 2);
    }

    // Broaden selectors across various Bing News layouts
    const selectors = [
      '.news-card',
      '.news-item',
      '.news-card-container',
      '[data-testid="news-card"]',
      '.news-card-wrapper',
      'li.newsitem',
      'div.newsitem',
      'div.t_s',
      'article',
      '.card',
      '.source-card'
    ];

    let foundArticles = false;

    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        foundArticles = true;
        elements.each((index: number, element: cheerio.Element) => {
          const $element = $(element);

          // Title
          let title = $element.find('h2, h3, .title, .news-title').first().text().trim();
          if (!title) {
            const linkEl = $element.find('a[href]').first();
            title = (linkEl.attr('aria-label') || linkEl.text() || '').trim();
          }

          // URL
          const linkElement = $element.find('a[href]').first();
          const rawHref = linkElement.attr('href') || '';
          const resolvedUrl = resolveBingHref(rawHref);

          // Source
          const source = $element.find('.source, .news-source, .publisher, cite').first().text().trim() || extractDomain(resolvedUrl);

          // Description
          const description =
            $element.find('.description, .news-description, .snippet').first().text().trim() ||
            $element.find('p').first().text().trim() ||
            $element.text().trim();

          // Image
          const imageElement = $element.find('img').first();
          const imageUrl = imageElement.attr('src') || imageElement.attr('data-src') || '';

          // Published date
          const publishedAt = $element.find('.time, .date, .published').first().text().trim();

          if (title && resolvedUrl && !seenUrls.has(resolvedUrl)) {
            seenUrls.add(resolvedUrl);
            articles.push({
              title,
              url: resolvedUrl,
              source: source || 'Unknown',
              description: description || '',
              publishedAt: publishedAt || undefined,
              imageUrl: imageUrl || undefined,
            });
          }
        });
        // Do not break; aggregate across selectors
      }
    }

    // Generic fallback: collect apiclick links which wrap outbound URLs
    if (!foundArticles || articles.length === 0) {
      $('a[href*="/news/apiclick"]').each((index: number, element: cheerio.Element) => {
        const $element = $(element);
        const title = ($element.attr('aria-label') || $element.text() || '').trim();
        const rawHref = $element.attr('href') || '';
        const resolvedUrl = resolveBingHref(rawHref);

        if (title && resolvedUrl && !seenUrls.has(resolvedUrl)) {
          seenUrls.add(resolvedUrl);
          articles.push({
            title,
            url: resolvedUrl,
            source: extractDomain(resolvedUrl),
            description: $element.closest('div').find('.snippet, p').first().text().trim() || '',
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