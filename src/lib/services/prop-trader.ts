/**
 * Prop Trader Service
 * Fetches retail sentiment ratios.
 * Since Myfxbook/IG doesn't have a simple free API for this, we use a mock service 
 * that mimics the data structure, or could be replaced with a scraper later.
 */

export interface SentimentData {
  ticker: string;
  longPercentage: number;
  shortPercentage: number;
  totalPositions: number;
}

export async function fetchSentimentData(ticker: string): Promise<SentimentData> {
  try {
    // In a real scenario, this might scrape a page or call a specialized API.
    // Here we provide realistic sentiment values for the major pairs.
    
    // Mock logic:
    const mockData: Record<string, number> = {
      'USD/JPY': 62,
      'EUR/USD': 45,
      'GBP/USD': 52,
      'AUD/USD': 58,
      'USD/CAD': 50,
      'EUR/JPY': 40,
      'GBP/JPY': 38,
    };

    const longPercentage = mockData[ticker] || 50;
    const shortPercentage = 100 - longPercentage;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      ticker,
      longPercentage,
      shortPercentage,
      totalPositions: 15400 + Math.floor(Math.random() * 5000)
    };
  } catch (error) {
    console.error(`Error fetching prop trader data for ${ticker}:`, error);
    throw new Error("センチメントデータの取得に失敗しました。");
  }
}
