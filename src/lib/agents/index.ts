import { GoogleGenerativeAI } from '@google/generative-ai';
import { EconomicEvent } from '../services/analyst';
import { MarketData } from '../services/fund-manager';
import { SentimentData } from '../services/prop-trader';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

export interface AgentResponse {
  agentName: string;
  analysis: string;
}

export interface FinalAnalysis {
  expertAnalyses: AgentResponse[];
  leaderSynthesis: string;
  timestamp: string;
}

/**
 * Helper to check for mock mode
 */
function isMockMode() {
  const apiKey = process.env.GEMINI_API_KEY;
  return !apiKey || apiKey.includes('your_') || apiKey === 'mock';
}

/**
 * Agent 1: Analyst (Fundamental)
 */
async function runAnalystAgent(calendarData: EconomicEvent[], userPlan: string): Promise<AgentResponse> {
  if (isMockMode()) {
    return {
      agentName: 'Analyst',
      analysis: '【ファンダメンタル分析（モック）】重要指標を控えており、市場は膠着状態にあります。ドルの独歩高傾向は続いていますが、利下げ期待の変動に敏感な状況です。',
    };
  }

  const dataSummary = calendarData.map(e => `${e.date} ${e.event} (${e.country}) Impact: ${e.impact}`).join('\n');
  const prompt = `あなたは世界トップクラスの経済アナリストです。
以下の経済カレンダーデータとユーザーのトレードプランに基づいて、ファンダメンタルズの展望を詳しく分析してください。

【経済カレンダー（High Impact）】
${dataSummary}

【ユーザーのプラン】
${userPlan}

指示：
1. 現在の市場環境を、提供された重要指標から読み解いてください。
2. ユーザーのプランに対するリスクや追い風を指摘してください。
3. 日本語で回答し、信頼できるソースへの言及を含めてください。`;

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const response = await result.response;

  return {
    agentName: 'Analyst',
    analysis: response.text(),
  };
}

/**
 * Agent 2: Fund Manager (Risk/Volatility)
 */
async function runFundManagerAgent(marketData: MarketData, userPlan: string): Promise<AgentResponse> {
  if (isMockMode()) {
    return {
      agentName: 'Fund Manager',
      analysis: '【リスク管理分析（モック）】ATRは安定圏内にあり、急激な変動リスクは低いと判断します。ただし、指標発表時のオーバーナイト・リスクには注意が必要です。',
    };
  }

  const prompt = `あなたはヘッジファンドのリスクマネージャーです。
以下の価格・ボラティリティデータとユーザーのトレードプランに基づいて、リスク評価を行ってください。

【市場データ】
通貨ペア: ${marketData.ticker}
現在価格: ${marketData.currentPrice}
14日間ATR: ${marketData.atr14}

【ユーザーのプラン】
${userPlan}

指示：
1. 現在のボラティリティ（ATR）に基づき、今のマーケットが静かか、あるいは過熱しているかを判断してください。
2. ユーザーのプランにおけるストップロス設定の妥当性や、期待される価格変動幅を分析してください。
3. 日本語で、論理的かつ専門的なトーンで回答してください。`;

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const response = await result.response;

  return {
    agentName: 'Fund Manager',
    analysis: response.text(),
  };
}

/**
 * Agent 3: Prop Trader (Sentiment/Liquidity)
 */
async function runPropTraderAgent(sentimentData: SentimentData, userPlan: string): Promise<AgentResponse> {
  if (isMockMode()) {
    return {
      agentName: 'Prop Trader',
      analysis: '【センチメント分析（モック）】リテール層のロングポジションに偏りが見られます。サポートライン付近での流動性を狙ったスクイーズが発生しやすい局面です。',
    };
  }

  const prompt = `あなたは鋭い視点を持つプロップトレーダーです。
以下のセンチメントデータとユーザーのトレードプランに基づき、市場の「流動性の罠」や「大衆の心理」を分析してください。

【センチメントデータ】
Long: ${sentimentData.longPercentage}%
Short: ${sentimentData.shortPercentage}%
総ポジション数: ${sentimentData.totalPositions}

【ユーザーのプラン】
${userPlan}

指示：
1. 大衆（リテールトレーダー）のポジションがどちらに偏っているかを読み解き、逆行（スクイーズ）の可能性を指摘してください。
2. いわゆる「流動性の罠」が発生しやすい価格帯を推測してください。
3. 日本語で、現場のトレーダーらしい現実感のある分析を提供してください。`;

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const response = await result.response;

  return {
    agentName: 'Prop Trader',
    analysis: response.text(),
  };
}

/**
 * Agent 4: Leader Agent (Synthesis)
 */
async function runLeaderAgent(expertAnalyses: AgentResponse[], userPlan: string): Promise<string> {
  if (isMockMode()) {
    console.warn("GEMINI_API_KEY is missing. Returning mock synthesis.");
    return `【総合診断】
市場は現在、重要指標（FOMC、雇用統計）を前にした様子見ムードが強いですが、ボラティリティは安定しており、テクニカル的な節目での反応が期待されます。

【戦略 A（強気シナリオ）】
150円のレジスタンスを明確に上抜けた場合、トレンド追従で152円を目指す買い戦略が有効です。ただし、雇用統計の結果次第では急激な反転のリスクがあるため、建値でのストップロス移動推奨。

【戦略 B（慎重シナリオ）】
149.50円を下抜ける局面では、リテール層のロングポジションが解消される「ロング・スクイーズ」の発生に注意が必要です。この場合、148円台までの調整を待ってから押し目買いを検討すべきです。

【最終的な警告・注意点】
重要指標発表時はスプレッドの大幅な拡大と急激なスリッページが予想されます。プランで提示された損切りラインは必ず遵守してください。`;
  }

  const analysesSummary = expertAnalyses.map(a => `【${a.agentName}の分析】\n${a.analysis}`).join('\n\n');
  const prompt = `あなたは「シナプス・キャピタル」の最高投資責任者（CIO）です。
3人の専門家による分析結果を統合し、ユーザーへの最終的なアドバイスを「選択肢A」と「選択肢B」の二つのシナリオで提示してください。

${analysesSummary}

【ユーザーのプラン】
${userPlan}

指示：
1. 専門家の意見の対立があれば、それを整理し、最も可能性の高い結論を導き出してください。
2. 最終回答は必ず日本語で、以下の構成で出力してください。
   - 総合診断（要約）
   - 戦略 A （強気/順張り等）とその根拠
   - 戦略 B （慎重/逆張り等）とその根拠
   - 最終的な警告・注意点`;

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text();
}

/**
 * Execute all agents in parallel and synthesize
 */
export async function runMultiAgentAnalysis(
  ticker: string,
  userPlan: string,
  data: { calendar: EconomicEvent[]; market: MarketData; sentiment: SentimentData }
): Promise<FinalAnalysis> {
  
  // Parallel Execution of Expert Agents
  const expertPromises = [
    runAnalystAgent(data.calendar, userPlan),
    runFundManagerAgent(data.market, userPlan),
    runPropTraderAgent(data.sentiment, userPlan),
  ];

  const expertAnalyses = await Promise.all(expertPromises);

  // Leader synthesis
  const leaderSynthesis = await runLeaderAgent(expertAnalyses, userPlan);

  return {
    expertAnalyses,
    leaderSynthesis,
    timestamp: new Date().toISOString(),
  };
}
