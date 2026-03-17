import { NextRequest, NextResponse } from 'next/server';
import { fetchHighImpactEvents } from '@/lib/services/analyst';
import { fetchMarketData } from '@/lib/services/fund-manager';
import { fetchSentimentData } from '@/lib/services/prop-trader';
import { runMultiAgentAnalysis } from '@/lib/agents';

export async function GET() {
  return NextResponse.json({ message: 'Synapse API is active. Please use POST to check positions.' });
}

export async function POST(req: NextRequest) {

  try {
    const { ticker, userPlan } = await req.json();

    if (!ticker || !userPlan) {
      return NextResponse.json(
        { error: '通貨ペア(ticker)とトレードプラン(userPlan)が必要です。' },
        { status: 400 }
      );
    }

    // 1. Fetch data from all sources in parallel if possible
    // (Each service handles their own API calls)
    const [calendarData, marketData, sentimentData] = await Promise.all([
      fetchHighImpactEvents(),
      fetchMarketData(ticker),
      fetchSentimentData(ticker),
    ]);

    // 2. Run the 4-agent AI system
    const result = await runMultiAgentAnalysis(ticker, userPlan, {
      calendar: calendarData,
      market: marketData,
      sentiment: sentimentData,
    });

    // 3. Return the synthesis and raw expert data
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('API Error in check-position:', error);
    
    const errorMessage = error.message || '予期せぬエラーが発生しました。システム管理者に確認してください。';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
