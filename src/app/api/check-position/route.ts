import { NextRequest, NextResponse } from 'next/server';
/** Triggered build with .next output directory setting */
export const runtime = 'edge';
import { getMarketContext } from '@/lib/market';
import { runMultiAgentAnalysis } from '@/lib/agents';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET() {
  return NextResponse.json({ message: 'Synapse API is active. Please use POST to check positions.' });
}

export async function POST(req: NextRequest) {
  // 0. Rate Limiting Check
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminIp = process.env.ADMIN_IP;
  
  const { allowed, remaining, resetTime } = await checkRateLimit(ip, adminIp);
  
  if (!allowed) {
    return NextResponse.json(
      { error: `1日の無料分析回数(5回)を超えました。${resetTime}以降に再度お試しください。` },
      { status: 429 }
    );
  }

  try {
    const { ticker, assetClass, userPlan } = await req.json();

    if (!ticker || !userPlan) {
      return NextResponse.json(
        { error: '銘柄(ticker)とトレードプラン(userPlan)が必要です。' },
        { status: 400 }
      );
    }

    // 1. Fetch real-time market context (Price, News, Calendar)
    const context = await getMarketContext(ticker);

    // 2. Run the 4-agent AI system with real-market data
    const result = await runMultiAgentAnalysis(ticker, userPlan, context, assetClass);

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
