/**
 * Market Scraper Utility
 * Supplements API data with RSS feeds and public sentiment indicators.
 */

export interface ScrapedNews {
    title: string;
    link: string;
    pubDate: string;
    source: string;
}

export interface MarketSentiment {
    score: number;
    label: string;
    updated: string;
}

/**
 * Simple RSS Parser using regex to avoid heavy dependencies
 */
function parseRSS(xml: string, source: string): ScrapedNews[] {
    const items: ScrapedNews[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/;
    const linkRegex = /<link>([\s\S]*?)<\/link>/;
    const dateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;

    let match;
    let count = 0;
    while ((match = itemRegex.exec(xml)) !== null && count < 5) {
        const itemBody = match[1];
        const titleMatch = itemBody.match(titleRegex);
        const linkMatch = itemBody.match(linkRegex);
        const dateMatch = itemBody.match(dateRegex);

        if (titleMatch && linkMatch) {
            items.push({
                title: (titleMatch[1] || titleMatch[2]).trim(),
                link: linkMatch[1].trim(),
                pubDate: dateMatch ? dateMatch[1].trim() : '',
                source
            });
            count++;
        }
    }
    return items;
}

/**
 * Fetch Forex news from ForexLive
 */
export async function getForexNews(): Promise<ScrapedNews[]> {
    try {
        const res = await fetch('https://www.forexlive.com/rss', { next: { revalidate: 300 } });
        const xml = await res.text();
        return parseRSS(xml, 'ForexLive');
    } catch (e) {
        console.error('Forex Scrape Error:', e);
        return [];
    }
}

/**
 * Fetch Stock news from Yahoo Finance
 */
export async function getStockNews(ticker: string = 'market'): Promise<ScrapedNews[]> {
    try {
        const res = await fetch(`https://finance.yahoo.com/news/rssindex`, { next: { revalidate: 600 } });
        const xml = await res.text();
        return parseRSS(xml, 'Yahoo Finance');
    } catch (e) {
        console.error('Stock Scrape Error:', e);
        return [];
    }
}

/**
 * Fetch Crypto news from CoinDesk
 */
export async function getCryptoNews(): Promise<ScrapedNews[]> {
    try {
        const res = await fetch('https://www.coindesk.com/arc/outboundfeeds/rss/', { next: { revalidate: 600 } });
        const xml = await res.text();
        return parseRSS(xml, 'CoinDesk');
    } catch (e) {
        console.error('Crypto Scrape Error:', e);
        return [];
    }
}

/**
 * Fetch Crypto Fear & Greed Index
 */
export async function getCryptoSentiment(): Promise<MarketSentiment | null> {
    try {
        const res = await fetch('https://api.alternative.me/fng/?limit=1');
        const data = await res.json();
        if (data && data.data && data.data[0]) {
            return {
                score: parseInt(data.data[0].value),
                label: data.data[0].value_classification,
                updated: new Date(parseInt(data.data[0].timestamp) * 1000).toISOString()
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}
