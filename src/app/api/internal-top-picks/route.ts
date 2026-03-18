import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
import { getMarketContext } from '@/lib/market';
import { runMultiAgentAnalysis } from '@/lib/agents';

// Ticker Sets by Asset Class
const ASSET_TICKERS: Record<string, { ticker: string; symbol: string }[]> = {
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const assetClass = (searchParams.get('assetClass') || 'FX').toUpperCase();
  
  const tickers = ASSET_TICKERS[assetClass] || ASSET_TICKERS.FX;
  
  try {
    const results = await Promise.all(
      tickers.map(async (pair) => {
        try {
          const context = await getMarketContext(pair.ticker);
          const analysis = await runMultiAgentAnalysis(
            pair.ticker, 
            "Identify the absolute best entry, stop loss, and target for a 24-48h horizon. Be definitive.", 
            context, 
            assetClass as any
          );

          const signalJson = extractSignalData(analysis.leaderSynthesis);

          return {
            symbol: pair.symbol,
            ticker: pair.ticker,
            analysis,
            signal: signalJson,
            score: signalJson.score || 0
          };
        } catch (e) {
          console.error(`Failed to analyze ${pair.symbol}:`, e);
          return null;
        }
      })
    );

    const validResults = results
        .filter((r): r is any => r !== null)
        .sort((a, b) => b.score - a.score);

    const top3 = validResults.slice(0, 3);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      assetClass,
      topPicks: top3
    });

  } catch (error: any) {
    console.error('API Error in internal-top-picks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function extractSignalData(synthesis: string) {
  try {
    const match = synthesis.match(/<data>\s*([\s\S]*?)\s*<\/data>/);
    if (match) {
        const data = JSON.parse(match[1]);
        return {
            decision: data.decision,
            score: data.totalScore || 0,
            summary: data.summary,
            entry: data.entry || '---',
            tp: data.tp || '---',
            sl: data.sl || '---'
        };
    }
  } catch (e) {}
  return { decision: 'WAIT', score: 0, summary: '分析エラー' };
}
