import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
import { getMarketContext } from '@/lib/market';
import { runMultiAgentAnalysis } from '@/lib/agents';

// Major FX Pairs to scan
const TOP_PAIRS = [
  { ticker: 'USDJPY=X', symbol: 'USD/JPY' },
  { ticker: 'EURUSD=X', symbol: 'EUR/USD' },
  { ticker: 'GBPUSD=X', symbol: 'GBP/USD' },
  { ticker: 'AUDUSD=X', symbol: 'AUD/USD' },
  { ticker: 'USDCHF=X', symbol: 'USD/CHF' }
];

export async function GET(req: NextRequest) {
  // Simple check for internal-only (though the URL is secret)
  // We can add a secret header check for more security if needed
  
  try {
    const results = await Promise.all(
      TOP_PAIRS.map(async (pair) => {
        try {
          const context = await getMarketContext(pair.ticker);
          // Special request for 'Best Setup' from the agents
          const analysis = await runMultiAgentAnalysis(
            pair.ticker, 
            "Identify the absolute best entry, stop loss, and target for a 24-48h horizon. Be definitive.", 
            context, 
            'FX'
          );

          // Extract metrics for ranking
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

    // Filter failed runs and Sort by AI confidence/score
    const validResults = results
        .filter((r): r is any => r !== null)
        .sort((a, b) => b.score - a.score);

    // Take top 3
    const top3 = validResults.slice(0, 3);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      topPicks: top3
    });

  } catch (error: any) {
    console.error('API Error in internal-top-picks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Extract numerical score and signal data from the leader synthesis JSON block
 */
function extractSignalData(synthesis: string) {
  try {
    const match = synthesis.match(/<data>\s*([\s\S]*?)\s*<\/data>/);
    if (match) {
        const data = JSON.parse(match[1]);
        return {
            decision: data.decision,
            score: data.totalScore || 0,
            summary: data.summary,
            entry: data.entry || 'Scanning...',
            tp: data.tp || '---',
            sl: data.sl || '---'
        };
    }
  } catch (e) {}
  return { decision: 'WAIT', score: 0, summary: '分析エラー' };
}
