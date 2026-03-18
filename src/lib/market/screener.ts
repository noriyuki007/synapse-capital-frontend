import { ASSET_TICKERS } from '@/app/api/internal-top-picks/route';

const FMP_KEY = process.env.FMP_API_KEY;

export interface ScreenerResult {
    ticker: string;
    symbol: string;
    price?: number;
    changePercentage?: number;
}

/**
 * Fetch dynamic top movers (Actives/Gainers) to act as a Level 1 filter 
 * before running expensive AI analysis.
 */
export async function getTopMovers(assetClass: string, limit: number = 10): Promise<ScreenerResult[]> {
    if (assetClass === 'FX') {
        // FX is a small enough universe that we can just use the static list
        return getStaticList('FX').slice(0, limit);
    }
    
    if (!FMP_KEY) {
        console.warn('FMP_API_KEY is missing. Falling back to static list for screener.');
        return getStaticList(assetClass).slice(0, limit);
    }

    try {
        if (assetClass === 'STOCKS') {
            // Fetch Most Active stocks
            const res = await fetch(`https://financialmodelingprep.com/api/v3/stock_market/actives?apikey=${FMP_KEY}`);
            if (!res.ok) throw new Error('Failed to fetch FMP actives');
            
            const data: any[] = await res.json();
            
            // Filter out pennies/weird stocks to ensure quality
            const qualityStocks = data.filter(s => s.price > 10 && !s.symbol.includes('.'));
            
            return qualityStocks.slice(0, limit).map(s => ({
                ticker: s.symbol,
                symbol: s.name || s.symbol,
                price: s.price,
                changePercentage: s.changesPercentage
            }));
        }

        if (assetClass === 'CRYPTO') {
            // Fetch Crypto prices
            const res = await fetch(`https://financialmodelingprep.com/api/v3/quotes/crypto?apikey=${FMP_KEY}`);
            if (!res.ok) throw new Error('Failed to fetch FMP crypto');
            
            const data: any[] = await res.json();
            
            // Sort by volume or absolute change to find "trending" coins
            const trending = data
                .filter(c => c.price > 0.01 && c.volume > 10000000)
                .sort((a, b) => Math.abs(b.changesPercentage) - Math.abs(a.changesPercentage));
            
            return trending.slice(0, limit).map(c => ({
                ticker: c.symbol,
                symbol: c.name || c.symbol.replace('USD', ''),
                price: c.price,
                changePercentage: c.changesPercentage
            }));
        }

    } catch (e) {
        console.error(`Screener Error for ${assetClass}:`, e);
    }

    return getStaticList(assetClass).slice(0, limit);
}

// Fallback static list parser
function getStaticList(assetClass: string) {
    const list = {
        FX: [
            { ticker: 'USDJPY=X', symbol: 'USD/JPY' },
            { ticker: 'EURUSD=X', symbol: 'EUR/USD' },
            { ticker: 'GBPUSD=X', symbol: 'GBP/USD' },
            { ticker: 'AUDUSD=X', symbol: 'AUD/USD' },
            { ticker: 'USDCHF=X', symbol: 'USD/CHF' }
        ],
        STOCKS: [
            { ticker: 'AAPL', symbol: 'Apple' },
            { ticker: 'TSLA', symbol: 'Tesla' },
            { ticker: 'NVDA', symbol: 'NVIDIA' },
            { ticker: 'MSFT', symbol: 'Microsoft' },
            { ticker: 'META', symbol: 'Meta' }
        ],
        CRYPTO: [
            { ticker: 'BTC-USD', symbol: 'BTC/USD' },
            { ticker: 'ETH-USD', symbol: 'ETH/USD' },
            { ticker: 'SOL-USD', symbol: 'SOL/USD' },
            { ticker: 'DOGE-USD', symbol: 'DOGE/USD' },
            { ticker: 'XRP-USD', symbol: 'XRP/USD' }
        ]
    };
    return list[assetClass as keyof typeof list] || list.FX;
}
