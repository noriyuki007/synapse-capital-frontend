import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getMarketContext } from '@/lib/market';
import { runMultiAgentAnalysis } from '@/lib/agents';
import { getTopMovers } from '@/lib/market/screener';

// Maintain static lists here for export to screener fallback
export const ASSET_TICKERS: Record<string, { ticker: string; symbol: string }[]> = {
    // defined in screener fallback
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawAssetClass = (searchParams.get('assetClass') || 'FX').toUpperCase();
  // Normalize: screener uses 'STOCKS', agents use 'STOCK'
  const screenerAssetClass = rawAssetClass === 'STOCK' ? 'STOCKS' : rawAssetClass;
  const agentAssetClass = rawAssetClass === 'STOCKS' ? 'STOCK' : rawAssetClass;

  // 1. Level 1 Filter: Get dynamic trending stocks/crypto to limit AI burden
  const trendingTickers = await getTopMovers(screenerAssetClass, 5); // Scan top 5 for speed
  
  try {
    const results = await Promise.all(
      trendingTickers.map(async (pair) => {
        try {
          const context = await getMarketContext(pair.ticker, screenerAssetClass);

          // 2. Level 2 Filter: Run fast-mode AI analysis ONLY on pre-filtered candidates
          const analysis = await runMultiAgentAnalysis(
            pair.ticker,
            "Identify the absolute best entry, stop loss, and target for a 24-48h horizon. Be definitive.",
            context,
            agentAssetClass as any,
            true // Enable FAST MODE
          );

          const signalJson = extractSignalData(analysis.leaderSynthesis);

          return {
            symbol: pair.symbol,
            ticker: pair.ticker,
            analysis,
            signal: signalJson,
            score: signalJson.score || 0,
            // Include real-time metrics from context
            lastPrice: context.price || 0,
            change24h: context.changePercent || 0,
            timestamp: new Date().toISOString()
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
      assetClass: rawAssetClass,
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
            decision: data.decision || 'WAIT',
            score: data.totalScore || data.score || 0,
            summary: data.summary || '解析完了。',
            entry: data.entry || '---',
            tp: data.tp || '---',
            sl: data.sl || '---'
        };
    }
    console.error('[extractSignalData] No <data> tag found. Raw synthesis (first 500 chars):', synthesis.substring(0, 500));
  } catch (e) {
    console.error('[extractSignalData] Parse error:', e);
    console.error('[extractSignalData] Raw synthesis (first 500 chars):', synthesis.substring(0, 500));
  }
  return { decision: 'WAIT', score: 0, summary: 'データ解析中...', entry: '---', tp: '---', sl: '---' };
}
