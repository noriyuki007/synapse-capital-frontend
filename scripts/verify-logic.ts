/**
 * Verification Script: Test Check Position API Logic
 * This script bypasses the HTTP transition and tests the core logic directly.
 * It uses the mock behavior implemented in the services.
 */

import { fetchHighImpactEvents } from '../src/lib/services/analyst';
import { fetchMarketData } from '../src/lib/services/fund-manager';
import { fetchSentimentData } from '../src/lib/services/prop-trader';
import { runMultiAgentAnalysis } from '../src/lib/agents/index';

async function verify() {
  console.log("--- シナプス・キャピタル バックエンド検証開始 ---");
  
  const ticker = "USD/JPY";
  const userPlan = "150.00でロング、149.00で損切り、目標は152.00";

  console.log(`検証対象: ${ticker}`);
  console.log(`ユーザープラン: ${userPlan}`);

  try {
    console.log("\n1. データ取得テスト...");
    const [calendarData, marketData, sentimentData] = await Promise.all([
      fetchHighImpactEvents(),
      fetchMarketData(ticker),
      fetchSentimentData(ticker),
    ]);
    console.log("✅ データ取得成功");
    console.log("- 経済指標数:", calendarData.length);
    console.log("- 現在価格:", marketData.currentPrice);
    console.log("- センチメント (Long):", sentimentData.longPercentage + "%");

    console.log("\n2. マルチエージェントAIの実行 (Synthesis)...");
    const result = await runMultiAgentAnalysis(ticker, userPlan, {
      calendar: calendarData,
      market: marketData,
      sentiment: sentimentData,
    });
    
    console.log("✅ AI分析成功");
    console.log("\n--- AIによる最終診断 ---");
    console.log(result.leaderSynthesis);
    console.log("------------------------");

    console.log("\n✅ 全ての検証が正常に完了しました。");
  } catch (error) {
    console.error("\n❌ 検証中にエラーが発生しました:");
    console.error(error);
    process.exit(1);
  }
}

verify();
