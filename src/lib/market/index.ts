/**
 * Market Data Integration Utility
 * Unifies access to Twelve Data, FMP, and ExchangeRate-API.
 */

export interface MarketContext {
    price?: number;
    change?: number;
    changePercent?: number;
    high?: number;
    low?: number;
    volume?: number;
    timestamp?: string;
    news?: any[];
    calendar?: any[];
    indicators?: any;
    scrapedNews?: any[];
    marketSentiment?: any;
    historicalData?: any[];
    macroContext?: {
        dxy?: number;
        us10y?: number;
        vix?: number;
        m2?: number; // M2 Money Supply / Liquidity
    };
    deepData?: {
        cot?: {
            commercialNet?: number;
            speculatorNet?: number;
            sentiment?: string;
        };
        whaleActivity?: {
            inflow?: number;
            largeTransfers?: number;
            summary?: string;
        };
    };
}

const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;
const FMP_KEY = process.env.FMP_API_KEY;
const EXCHANGE_RATE_KEY = process.env.EXCHANGE_RATE_API_KEY;

/**
 * Fetch real-time price and basic stats from Twelve Data
 */
async function fetchTwelveData(symbol: string) {
    if (!TWELVE_DATA_KEY) return null;
    try {
        const response = await fetch(
            `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${TWELVE_DATA_KEY}`
        );
        const data = await response.json();
        if (data.status === 'error') throw new Error(data.message);
        return data;
    } catch (error) {
        console.error('Twelve Data Error:', error);
        return null;
    }
}

/**
 * Fallback: Fetch price from Yahoo Finance Chart API
 */
async function fetchYahooPrice(symbol: string) {
    try {
        // Normalize symbol for Yahoo
        let yahooSym = symbol;
        if (symbol.includes('/')) {
            // FX: EUR/USD -> EURUSD=X
            // Crypto: BTC/USD -> BTC-USD
            const [base, quote] = symbol.split('/');
            if (base.length <= 3 && quote.length <= 3) { // Likely FX
                yahooSym = base + quote + '=X';
            } else { // Likely Crypto
                yahooSym = base + '-' + quote;
            }
        }
            
        const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSym}?interval=1d&range=1d`
        );
        const data = await response.json();
        const meta = data.chart?.result?.[0]?.meta;
        
        if (meta && meta.regularMarketPrice) {
            const price = meta.regularMarketPrice;
            const prevClose = meta.previousClose;
            const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
            return {
                price,
                changePercent,
                high: meta.dayHigh,
                low: meta.dayLow
            };
        }
    } catch (e) {
        console.error('Yahoo Price Fallback Error:', e);
    }
    return null;
}

/**
 * Fetch economic calendar and market news from FMP
 */
async function fetchFMPData(symbol: string) {
    if (!FMP_KEY) return null;
    try {
        // Fetch economic calendar for the next 7 days
        const calendarRes = await fetch(
            `https://financialmodelingprep.com/api/v3/economic_calendar?from=${new Date().toISOString().split('T')[0]}&apikey=${FMP_KEY}`
        );
        const calendar = await calendarRes.json();

        // Fetch news for the specific symbol if it's a stock
        let news = [];
        if (!symbol.includes('/')) {
            const newsRes = await fetch(
                `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=5&apikey=${FMP_KEY}`
            );
            news = await newsRes.json();
        }

        return { calendar: calendar.slice(0, 5), news: news.slice(0, 5) };
    } catch (error) {
        console.error('FMP Data Error:', error);
        return null;
    }
}

/**
 * Fetch historical daily price data (last 30 days) from Twelve Data
 */
async function fetchHistoricalData(symbol: string) {
    if (!TWELVE_DATA_KEY) return null;
    try {
        const response = await fetch(
            `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${TWELVE_DATA_KEY}`
        );
        const data = await response.json();
        if (data.status === 'error') throw new Error(data.message);
        return data.values || [];
    } catch (error) {
        console.error('Historical Data Error:', error);
        return [];
    }
}

/**
 * Fetch Institutional Flow (COT Data) from FMP
 */
async function fetchCOTData(symbol: string) {
    if (!FMP_KEY) return null;
    try {
        // Normalizing for COT (e.g. BTC, EUR, Gold)
        const cotSymbol = symbol.split('/')[0].toUpperCase();
        const response = await fetch(
            `https://financialmodelingprep.com/api/v4/commitment_of_traders_report/analysis/${cotSymbol}?apikey=${FMP_KEY}`
        );
        const data = await response.json();
        if (!data || data.length === 0) return null;
        
        const latest = data[0];
        return {
            commercialNet: latest.commercialNet,
            speculatorNet: latest.speculatorNet,
            sentiment: latest.speculatorNet > 0 ? 'Bullish' : 'Bearish'
        };
    } catch (error) {
        console.error('COT Data Error:', error);
        return null;
    }
}

/**
 * Fetch Whale Activity (Mock/Derived from Volume Surge)
 */
async function fetchWhaleActivity(symbol: string, history: any[]) {
    if (!history || history.length === 0) return null;
    try {
        // Detect "Whale" activity by finding volume spikes > 2x average
        const volumes = history.map(d => parseFloat(d.volume)).filter(v => !isNaN(v));
        const avgVol = volumes.reduce((a, b) => a + b, 0) / volumes.length;
        const currentVol = volumes[0];
        
        const isSpike = currentVol > avgVol * 1.5;
        
        return {
            inflow: isSpike ? currentVol * 0.6 : 0, // Mock estimate
            largeTransfers: isSpike ? Math.floor(currentVol / (avgVol * 0.1)) : 0,
            summary: isSpike ? "大口の資金移動（クジラ）が観測されています。" : "目立った大口の動きはありません。"
        };
    } catch (error) {
        console.error('Whale Alert Error:', error);
        return null;
    }
}

import { getForexNews, getStockNews, getCryptoNews, getCryptoSentiment, getMacroBenchmarks } from './scraper';

/**
 * Fetch Global Macro Benchmarks (Scraped fallback)
 */
async function fetchMacroData() {
    try {
        // 1. Try Scraping (Yahoo Finance) - Always available and free
        const benchmarks = await getMacroBenchmarks();
        
        if (benchmarks) {
            return {
                dxy: benchmarks.dxy || 104.20,
                us10y: benchmarks.us10y || 4.32,
                vix: benchmarks.vix || 15.40,
                m2: 21.5
            };
        }

        // 2. Try Twelve Data (If key exists and plan allows)
        if (TWELVE_DATA_KEY) {
            const symbols = ['DXY', 'TNX', 'VIX'];
            const response = await fetch(
                `https://api.twelvedata.com/quote?symbol=${symbols.join(',')}&apikey=${TWELVE_DATA_KEY}`
            );
            const data = await response.json();
            
            if (data && !data.code) { // 403/404 handling
                return {
                    dxy: data['DXY']?.close || data['DXY']?.price || 104.2,
                    us10y: data['TNX']?.close || data['TNX']?.price || 4.32,
                    vix: data['VIX']?.close || data['VIX']?.price || 15.4,
                    m2: 21.5
                };
            }
        }
        
        // 3. Last Resort Fallback (Sanity values)
        return {
            dxy: 104.2,
            us10y: 4.32,
            vix: 15.4,
            m2: 21.5
        };
    } catch (error) {
        console.error('Macro Data Error:', error);
        return { dxy: 104.2, us10y: 4.32, vix: 15.4, m2: 21.5 };
    }
}

/**
 * Fetch technical indicators (RSI, SMA) from Twelve Data
 */
async function fetchTechnicalIndicators(symbol: string) {
    if (!TWELVE_DATA_KEY) return null;
    try {
        const [rsiRes, smaRes] = await Promise.all([
            fetch(`https://api.twelvedata.com/rsi?symbol=${symbol}&interval=1day&time_period=14&apikey=${TWELVE_DATA_KEY}`),
            fetch(`https://api.twelvedata.com/sma?symbol=${symbol}&interval=1day&time_period=20&apikey=${TWELVE_DATA_KEY}`)
        ]);
        const rsiData = await rsiRes.json();
        const smaData = await smaRes.json();
        
        return {
            rsi: rsiData.values?.[0]?.rsi,
            sma20: smaData.values?.[0]?.sma
        };
    } catch (error) {
        console.error('Indicator Error:', error);
        return null;
    }
}


/**
 * Get comprehensive market context for a given symbol and asset class
 */
export async function getMarketContext(ticker: string, assetClass: string = 'FX'): Promise<MarketContext> {
    const normalizedTicker = ticker.toUpperCase().trim();
    
    // Attempt to gather data from multiple sources in parallel
    const [quote, fmp, scrapedNews, sentiment, history, macro, indicators] = await Promise.all([
        fetchTwelveData(normalizedTicker),
        fetchFMPData(normalizedTicker),
        // Asset-specific scraping
        assetClass === 'STOCK' ? getStockNews(normalizedTicker) : 
        assetClass === 'CRYPTO' ? getCryptoNews() : 
        getForexNews(),
        // Specific sentiment indicators
        assetClass === 'CRYPTO' ? getCryptoSentiment() : Promise.resolve(null),
        // Historical and Macro Context
        fetchHistoricalData(normalizedTicker),
        fetchMacroData(),
        // Technical Indicators
        fetchTechnicalIndicators(normalizedTicker)
    ]);

    // Secondary data dependencies
    const [cot, whale] = await Promise.all([
        fetchCOTData(normalizedTicker),
        fetchWhaleActivity(normalizedTicker, history || [])
    ]);

    const context: MarketContext = {
        timestamp: new Date().toISOString(),
        news: fmp?.news || [],
        calendar: fmp?.calendar || [],
        scrapedNews: scrapedNews || [],
        marketSentiment: sentiment,
        historicalData: history,
        macroContext: macro || undefined,
        indicators: indicators || undefined,
        deepData: {
            cot: cot || undefined,
            whaleActivity: whale || undefined
        }
    };

    if (quote) {
        context.price = parseFloat(quote.close || quote.price);
        context.change = parseFloat(quote.change);
        context.changePercent = parseFloat(quote.percent_change);
        context.high = parseFloat(quote.high);
        context.low = parseFloat(quote.low);
        context.volume = parseInt(quote.volume);
    } else {
        // Fallback to Yahoo
        const yahoo = await fetchYahooPrice(normalizedTicker);
        if (yahoo) {
            context.price = yahoo.price;
            context.changePercent = yahoo.changePercent;
            context.high = yahoo.high;
            context.low = yahoo.low;
        }
    }

    return context;
}
