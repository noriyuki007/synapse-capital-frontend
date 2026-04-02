import { NextRequest, NextResponse } from 'next/server';

const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const genre = searchParams.get('genre');

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    // Normalize special symbols
    const SYMBOL_MAP: Record<string, { twelve: string; yahoo: string }> = {
        'S&P 500': { twelve: 'SPX', yahoo: '^GSPC' },
        'S&P500':  { twelve: 'SPX', yahoo: '^GSPC' },
        'SP500':   { twelve: 'SPX', yahoo: '^GSPC' },
        'NIKKEI':  { twelve: 'NKY', yahoo: '^N225' },
    };
    const mapped = SYMBOL_MAP[symbol] || SYMBOL_MAP[decodeURIComponent(symbol)];
    const twelveSymbol = mapped?.twelve || symbol;
    const yahooSymbolOverride = mapped?.yahoo;

    try {
        // 1. Crypto handled via CoinGecko (Public API is fine for client, but we can proxy too)
        if (genre === 'CRYPTO') {
            const coinId = symbol.toLowerCase().includes('btc') ? 'bitcoin' : 
                          symbol.toLowerCase().includes('sol') ? 'solana' : 
                          symbol.toLowerCase().includes('eth') ? 'ethereum' : 'bitcoin';
            
            const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`);
            const data = await res.json();
            if (data[coinId]) {
                return NextResponse.json({
                    price: data[coinId].usd,
                    change: data[coinId].usd_24h_change || 0
                });
            }
        }

        // 2. FX and Stocks via Twelve Data
        if (TWELVE_DATA_KEY) {
            const res = await fetch(`https://api.twelvedata.com/quote?symbol=${twelveSymbol}&apikey=${TWELVE_DATA_KEY}`);
            const data = await res.json();

            if (data && !data.code && data.price) {
                return NextResponse.json({
                    price: parseFloat(data.close || data.price),
                    change: parseFloat(data.percent_change || 0)
                });
            }
        }

        // 3. Fallback to Yahoo Query (Scraping equivalent) if API fails
        const yahooSym = yahooSymbolOverride || (genre === 'FX' ? `${symbol.replace('/', '')}=X` : symbol);
        const yahooRes = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSym}?interval=1d&range=1d`);
        const yahooData = await yahooRes.json();
        const price = yahooData.chart?.result?.[0]?.meta?.regularMarketPrice;
        const prevClose = yahooData.chart?.result?.[0]?.meta?.previousClose;
        
        if (price) {
            const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
            return NextResponse.json({ price, change });
        }

        return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
