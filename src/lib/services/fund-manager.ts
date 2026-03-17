/**
 * Fund Manager Service
 * Fetches price and historical volatility (OHLCV) from Tiingo.
 * Calculates 14-day ATR.
 */

export interface TiingoPrice {
  date: string;
  close: number;
  high: number;
  low: number;
  open: number;
}

export interface MarketData {
  ticker: string;
  currentPrice: number;
  atr14: number;
}

export async function fetchMarketData(ticker: string): Promise<MarketData> {
  const apiKey = process.env.TIINGO_API_KEY;
  if (!apiKey || apiKey.includes('your_') || apiKey === 'mock') {

    console.warn(`TIINGO_API_KEY is missing or placeholder. Using mock data for ${ticker}.`);
    return {
      ticker,
      currentPrice: ticker === 'USD/JPY' ? 150.45 : 1.0820,
      atr14: 0.85
    };
  }


  try {
    // Tiingo FX Price endpoint (USDJPY, EURUSD, etc.)
    // For Tiingo FX tickers are like 'usdjpy'
    const formattedTicker = ticker.replace('/', '').toLowerCase();
    
    // Fetch last 20 days of data to ensure we have enough for 14-day ATR
    const url = `https://api.tiingo.com/tiingo/fx/${formattedTicker}/prices?resampleFreq=1day&token=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Tiingo API error: ${response.statusText}`);
    }

    const data: TiingoPrice[] = await response.json();
    if (!data || data.length === 0) {
      throw new Error("株価データの取得に失敗しました。");
    }

    const currentPrice = data[data.length - 1].close;
    const atr14 = calculateATR(data, 14);

    return {
      ticker,
      currentPrice,
      atr14
    };
  } catch (error) {
    console.error(`Error fetching fund manager data for ${ticker}:`, error);
    throw new Error(`${ticker} の市場データ取得に失敗しました。`);
  }
}

/**
 * ATR (Average True Range) calculation
 * TR = max[(high - low), abs(high - previous_close), abs(low - previous_close)]
 */
function calculateATR(prices: TiingoPrice[], period: number): number {
  if (prices.length < period + 1) return 0;

  const trs: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const high = prices[i].high;
    const low = prices[i].low;
    const prevClose = prices[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trs.push(tr);
  }

  // Simple Moving Average of TR for simplicity, or Wilder's Smoothing if preferred
  const relevantTRs = trs.slice(-period);
  const sum = relevantTRs.reduce((a, b) => a + b, 0);
  return sum / period;
}
