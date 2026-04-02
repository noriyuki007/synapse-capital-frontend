import { MarketContext } from '../market';
import { getAgentKnowledge } from './knowledge';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const FREE_MODELS = [
  "openrouter/free",                                    // Auto-routes to best available free model
  "nvidia/nemotron-3-super-120b-a12b:free",             // 120B params, 262k ctx
  "nousresearch/hermes-3-llama-3.1-405b:free",          // 405B params, 131k ctx
  "meta-llama/llama-3.3-70b-instruct:free",             // 70B params, 65k ctx
  "google/gemma-3-27b-it:free",                         // 27B params, 131k ctx
];

/** Call Gemini REST API directly (Edge Runtime compatible, no SDK needed) */
async function callGeminiREST(modelId: string, systemPrompt: string, userPrompt: string): Promise<string> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('your_') || GEMINI_API_KEY === 'dummy_key' || GEMINI_API_KEY === 'mock') {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userPrompt }] }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini REST Error: ${response.status} - ${text}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/** Track if OpenRouter key has been verified as invalid to avoid repeated 401s */
let openRouterKeyInvalid = false;

async function callOpenRouter(modelId: string, systemPrompt: string, userPrompt: string): Promise<string> {
  if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is missing');
  if (openRouterKeyInvalid) throw new Error('OPENROUTER_API_KEY was previously rejected (401)');

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://synapsecapital.net",
      "X-Title": "Synapse Capital Position Checker"
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    // Mark key as invalid on auth errors to avoid retrying with every model
    if (response.status === 401 || response.status === 403) {
      openRouterKeyInvalid = true;
      throw new Error(`OpenRouter Auth Error: ${response.status} - key is invalid`);
    }
    throw new Error(`OpenRouter Error: ${response.status} - ${text}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenRouter returned empty response');
  return content;
}

async function callWithFallback(geminiModel: string, systemPrompt: string, userPrompt: string): Promise<string> {
  // Try Gemini REST API first
  try {
    const result = await callGeminiREST(geminiModel, systemPrompt, userPrompt);
    if (result) return result;
  } catch (err: any) {
    console.warn(`Gemini REST (${geminiModel}) failed: ${err.message}. Trying OpenRouter fallback chain...`);
  }

  // Try OpenRouter fallback chain (skip entirely if key is missing or already known invalid)
  if (OPENROUTER_API_KEY && !openRouterKeyInvalid) {
    for (const modelId of FREE_MODELS) {
      try {
        return await callOpenRouter(modelId, systemPrompt, userPrompt);
      } catch (orErr: any) {
        console.warn(`OpenRouter ${modelId} failed: ${orErr.message}`);
        // If auth error, no point trying other models
        if (openRouterKeyInvalid) break;
      }
    }
  }

  throw new Error("All AI models (Gemini and OpenRouter) failed.");
}

export interface AgentResponse {
  agentName: string;
  analysis: string;
}

export interface FinalAnalysis {
  expertAnalyses: AgentResponse[];
  leaderSynthesis: string;
  timestamp: string;
  ticker: string;
  userPlan: string;
}

/**
 * Helper to check for mock mode - returns true only when NO AI backends are available
 */
function isMockMode() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const hasGemini = geminiKey && !geminiKey.includes('your_') && geminiKey !== 'mock' && geminiKey !== 'dummy_key';
  const hasOpenRouter = !!openRouterKey;
  return !hasGemini && !hasOpenRouter;
}

/**
 * Generate deterministic analysis when all AI models fail
 * Uses market data to provide rule-based analysis
 */
function generateDeterministicAnalysis(
  context: MarketContext,
  ticker: string,
  userPlan: string,
  assetClass: string
): FinalAnalysis {
  const price = context.price || 0;
  const changePercent = context.changePercent || 0;
  const rsi = context.indicators?.rsi ? parseFloat(context.indicators.rsi) : 50;
  const isBullish = changePercent > 0;
  const isOverbought = rsi > 70;
  const isOversold = rsi < 30;

  // Parse user plan direction
  const isBuy = userPlan.toUpperCase().includes('BUY');

  // Simple scoring
  let score = 50;
  if (isBuy && isBullish) score += 15;
  if (isBuy && isOversold) score += 10;
  if (!isBuy && !isBullish) score += 15;
  if (!isBuy && isOverbought) score += 10;
  if (isBuy && isOverbought) score -= 15;
  if (!isBuy && isOversold) score -= 15;
  score = Math.max(20, Math.min(90, score));

  const trendText = isBullish ? '上昇トレンド' : '下降トレンド';
  const rsiText = isOverbought ? '買われすぎゾーン(RSI>70)' : isOversold ? '売られすぎゾーン(RSI<30)' : '中立ゾーン';
  const direction = isBuy ? '買い' : '売り';
  const decision = score >= 65 ? 'GO' : score >= 45 ? 'CAUTION' : 'NO GO';

  const analystAnalysis = `【${assetClass}マーケット分析 - データベース自動解析】

現在の${ticker}は${price > 0 ? price.toFixed(2) : '取得中'}で取引されており、直近の変動率は${changePercent.toFixed(2)}%です。

市場トレンド: ${trendText}
テクニカル指標: RSI(14) = ${rsi.toFixed(1)} → ${rsiText}
マクロ環境: DXY ${context.macroContext?.dxy || 'N/A'}, VIX ${context.macroContext?.vix || 'N/A'}

${context.calendar && context.calendar.length > 0 ? '今後の重要イベント: ' + context.calendar.slice(0, 3).map((e: any) => e.event).join(', ') : '直近の重要経済指標は限定的です。'}

<data>
{"shortSummary":"${trendText}・${rsiText}","sentimentScore":${score},"correlations":[{"pair":"${ticker}","value":1.00}]}
</data>`;

  const managerAnalysis = `【リスク管理評価 - データベース自動解析】

${ticker}の現在のボラティリティ状況を評価します。

直近変動率: ${Math.abs(changePercent).toFixed(2)}%
VIX水準: ${context.macroContext?.vix || 'N/A'}
リスクレベル: ${Math.abs(changePercent) > 1.5 ? '高い変動性が観測されています。ポジションサイズの慎重な管理が推奨されます。' : '適正範囲内の変動性です。'}

${direction}ポジションのリスクリワード比率を確認し、ストップロスの適切な設定が重要です。

<data>
{"shortSummary":"ボラティリティ${Math.abs(changePercent) > 1.5 ? '高' : '適正'}","riskLevel":${Math.abs(changePercent) > 1.5 ? 4 : 3},"volatility":${(Math.abs(changePercent) / 100).toFixed(4)},"expectedAtr":${(Math.abs(changePercent) * 0.8).toFixed(2)}}
</data>`;

  const traderAnalysis = `【テクニカル・センチメント分析 - データベース自動解析】

${ticker}のテクニカル分析に基づくポジション評価です。

RSI(14): ${rsi.toFixed(1)} - ${rsiText}
SMA(20): ${context.indicators?.sma20 || 'N/A'}
${context.deepData?.cot ? `COTレポート: 投機筋ネットポジション ${context.deepData.cot.speculatorNet} (${context.deepData.cot.sentiment})` : 'COTデータ: 取得待ち'}

価格アクションは${isBullish ? '強気' : '弱気'}の傾向を示しています。

<data>
{"shortSummary":"${isBullish ? '強気' : '弱気'}テクニカル","targetPrice":${price > 0 ? (price * (isBuy ? 1.015 : 0.985)).toFixed(2) : 0},"liquidityLevels":[{"price":${price > 0 ? (price * 1.01).toFixed(2) : 0},"strength":0.80}]}
</data>`;

  const leaderSynthesis = `## 総合分析

${ticker}のデータベース駆動型分析に基づき、以下の結論を提示します。現在の市場環境は${trendText}を示し、RSIは${rsiText}にあります。

## 委員会内での議論

テクニカル分析とリスク管理の観点から、${direction}プランの妥当性を検討しました。変動率${changePercent.toFixed(2)}%の現在環境において、${Math.abs(changePercent) > 1 ? 'ボラティリティが高い状況で慎重なアプローチが必要' : '比較的安定した環境でエントリーの条件は整っている'}と評価します。

## 合意事項（メリット・強み）

1. ${isBuy && isBullish ? 'トレンド方向と一致したエントリー' : !isBuy && !isBullish ? 'トレンド方向と一致したエントリー' : 'リバーサル戦略としての期待値'}
2. テクニカル指標の確認が完了

## 否定・懸念事項（リスク・弱点）

1. ${isOverbought ? '買われすぎの水準であり、短期的な調整リスク' : isOversold ? '売られすぎの水準であり、反発リスク' : '明確なトレンド転換シグナルが不足'}
2. 外部イベントリスク（経済指標発表など）への注意が必要

## 時間軸でのアドバイス (JST)

東京時間（9:00-15:00 JST）およびロンドン時間（16:00-25:00 JST）の主要セッションでの執行を推奨します。

## 推奨するアクション

総合スコア: ${score}/100 → **${decision}**

## プランの妥当性に関する最終評決

お客様の${direction}プランは、${decision === 'GO' ? '現在の市場環境と整合性があり、実行を推奨します' : decision === 'CAUTION' ? '一定の条件付きで検討の余地がありますが、追加確認を推奨します' : '現在の市場環境との整合性が低く、見送りを推奨します'}。

## 結論

データに基づく客観的評価として、${decision === 'GO' ? '条件付きでGO' : decision === 'CAUTION' ? '慎重な判断（CAUTION）' : '見送り（NO GO）'}を結論とします。

<data>
{"decision":"${decision}","totalScore":${score.toFixed(2)},"summary":"${trendText}・${decision}","entry":"${price > 0 ? price.toFixed(2) : 'N/A'}","tp":"${price > 0 ? (price * (isBuy ? 1.015 : 0.985)).toFixed(2) : 'N/A'}","sl":"${price > 0 ? (price * (isBuy ? 0.99 : 1.01)).toFixed(2) : 'N/A'}","agreedPoints":["テクニカル分析に基づく方向性の確認","リスクリワード比の妥当性"],"rejectedPoints":["${isOverbought || isOversold ? 'RSIの極端な水準' : '明確なブレイクアウト未確認'}","外部イベントリスク"],"consensusSummary":"${trendText}のなか、${direction}プランは${decision === 'GO' ? '有効' : '要検討'}と判断。"}
</data>`;

  return {
    expertAnalyses: [
      { agentName: 'Analyst', analysis: analystAnalysis },
      { agentName: 'Fund Manager', analysis: managerAnalysis },
      { agentName: 'Prop Trader', analysis: traderAnalysis },
    ],
    leaderSynthesis,
    timestamp: context.timestamp || new Date().toISOString(),
    ticker,
    userPlan
  };
}

/**
 * Agent 1: Analyst (Fundamental / Macro)
 */
async function runAnalystAgent(context: MarketContext, userPlan: string, assetClass: string, fastMode: boolean = false): Promise<AgentResponse> {
  if (isMockMode()) {
    const mockText = assetClass === 'STOCK' 
      ? '【株式ファンダメンタル分析】企業収益の成長性と金利動向が焦点です。' 
      : assetClass === 'CRYPTO'
      ? '【オンチェーン分析】クジラの動きとネットワークの活性化が顕著です。'
      : '【為替マクロ分析】重要指標を控えており、利下げ期待の変動に敏感な状況です。';
    return { agentName: 'Analyst', analysis: mockText };
  }

  const calendarSummary = context.calendar?.map(e => `- ${e.date}: ${e.event} (${e.country}) Impact: ${e.impact}`).join('\n') || 'N/A';
  const newsSummary = context.news?.map(n => `- ${n.title} (${n.site})`).join('\n') || 'N/A';
  const scrapedNewsSummary = context.scrapedNews?.map(n => `- [${n.source}] ${n.title}`).join('\n') || 'N/A';
  const sentimentSummary = context.marketSentiment ? `${context.marketSentiment.label} (Score: ${context.marketSentiment.score}/100)` : 'N/A';

  const historySummary = context.historicalData ? context.historicalData.slice(0, 7).map(d => `- ${d.datetime}: Close ${d.close}`).join('\n') : 'N/A';
  const macroSummary = context.macroContext ? `DXY: ${context.macroContext.dxy}, US10Y: ${context.macroContext.us10y}, VIX: ${context.macroContext.vix}, M2(Proxy): ${context.macroContext.m2}T` : 'N/A';
  const indicatorsSummary = context.indicators ? `RSI(14): ${context.indicators.rsi}, SMA(20): ${context.indicators.sma20}` : 'N/A';

  const deepDataSummary = context.deepData ? `
COT (Institutional): Commercial Net: ${context.deepData.cot?.commercialNet}, Speculator Net: ${context.deepData.cot?.speculatorNet} (${context.deepData.cot?.sentiment})
Whale Activity: ${context.deepData.whaleActivity?.summary} (Estimated Inflow: ${context.deepData.whaleActivity?.inflow})
` : 'N/A';

  const assetSpecificGoal = assetClass === 'STOCK' 
    ? "米国株または日本株のファンダメンタル分析" 
    : assetClass === 'CRYPTO' 
    ? "暗号資産のマーケット・センチメントとオンチェーン分析" 
    : "グローバルなマクロ経済と為替市場の相関分析";

  const prompt = `あなたは世界トップクラスの投資アナリストです。
以下の最新のコンテキスト（歴史的トレンド、グローバルマクロ指標、機関投資家建玉、鯨の動向、速報）と、専門家としての思考フレームワークに基づき、${assetSpecificGoal}を行ってください。

${getAgentKnowledge('analyst')}

【アセットクラス】: ${assetClass}
【取得日時】: ${context.timestamp}

【グローバル・マクロ指標 (Master Macro)】:
${macroSummary}

【機関投資家・大口動向 (Deep Data)】:
${deepDataSummary}

【テクニカル指標 (Technical)】:
${indicatorsSummary}

【直近7日間の価格推移 (Historical)】:
${historySummary}

【外部情報 (API)】: 
経済カレンダー: ${calendarSummary}
公式ニュース: ${newsSummary}

【スクレイピング/速報データ】:
${scrapedNewsSummary}

【市場センチメント】:
${sentimentSummary}

【ユーザープラン】: ${userPlan}

指示：
1. 現在の市場の主材料を簡潔に分析してください。挨拶は不要です。
2. 読みやすさを重視し、過度な太字（**）の使用を避けてください。
3. 最後に必ず以下の形式でJSONを含めてください。
<data>
{
  "shortSummary": "1行（30文字以内）で現在の市場展望を要約",
  "sentimentScore": 75.00,
  "correlations": [
    {"pair": "Target", "value": 1.00},
    {"pair": "Related Asset", "value": 0.85}
  ]
}
5. 日本語で回答し、数値は小数点第2位まで含めてください。
${fastMode ? '【重要】説明文は一切不要です。挨拶も不要です。<data>タグで囲まれたJSON文字列のみを絶対に出力してください。他の文章が含まれるとシステムがクラッシュします。' : ''}`;

  const modelId = 'gemini-1.5-flash';
  const analysis = await callWithFallback(modelId, `あなたは${assetSpecificGoal}のスペシャリストです。`, prompt);

  return {
    agentName: 'Analyst',
    analysis: analysis,
  };
}

/**
 * Agent 2: Fund Manager (Risk/Volatility)
 */
async function runFundManagerAgent(context: MarketContext, ticker: string, userPlan: string, assetClass: string, fastMode: boolean = false): Promise<AgentResponse> {
  if (isMockMode()) {
    return {
      agentName: 'Fund Manager',
      analysis: `【${assetClass}リスク管理分析】ボラティリティは適正範囲内です。`,
    };
  }

  const prompt = `あなたはヘッジファンドのリスクマネージャーです。
専門家としての思考フレームワークを遵守し、以下の市場データとユーザープランに基づき、リスク評価を行ってください。

${getAgentKnowledge('fundManager')}

【アセットクラス】: ${assetClass}
【データ】
シンボル: ${ticker} / 現在価格: ${context.price} / 変動: ${context.changePercent}%
【ユーザープラン】: ${userPlan}

指示：
1. ${assetClass}固有のボラティリティ特性（テールの厚み、ジャンプリスク等）を考慮して分析してください。
2. 太字（**）の使用を控えてください。
3. 最後に必ず以下の形式でJSONを含めてください。
<data>
{
  "shortSummary": "1行のリスク状況要約",
  "riskLevel": 3,
  "volatility": 0.45,
  "expectedAtr": 0.85
}
5. 日本語で回答し、数値は小数点第2位まで含めてください。
${fastMode ? '【重要】説明文は一切不要です。挨拶も不要です。<data>タグで囲まれたJSON文字列のみを絶対に出力してください。他の文章が含まれるとシステムがクラッシュします。' : ''}`;

  const modelId = 'gemini-1.5-flash';
  const analysis = await callWithFallback(modelId, "あなたはヘッジファンドのリスクマネージャーです。", prompt);

  return {
    agentName: 'Fund Manager',
    analysis: analysis,
  };
}

/**
 * Agent 3: Prop Trader (Sentiment/Liquidity)
 */
async function runPropTraderAgent(context: MarketContext, ticker: string, userPlan: string, assetClass: string, fastMode: boolean = false): Promise<AgentResponse> {
  if (isMockMode()) {
    return {
      agentName: 'Prop Trader',
      analysis: `【${assetClass}センチメント分析】投機的な動きに注意が必要です。`,
    };
  }

  const assetSpecificContext = assetClass === 'CRYPTO' ? "取引所残高、注文板の厚み" : "機関投資家の建玉、板不均衡";

  const prompt = `あなたはプロップトレーダーです。
専門家としての思考フレームワークに基づき、市場の裏側を分析し、重要価格レベルをデータとして出力してください。

${getAgentKnowledge('propTrader')}

【アセットクラス】: ${assetClass}
【データ】
シンボル: ${ticker} / 値動き: ${context.changePercent}%
テクニカル指標: ${context.indicators ? `RSI: ${context.indicators.rsi}, SMA20: ${context.indicators.sma20}` : 'N/A'}
機関投資家/クジラ動向: ${context.deepData ? `COT: ${context.deepData.cot?.sentiment}, Whale: ${context.deepData.whaleActivity?.summary}` : 'N/A'}
重要視点: ${assetSpecificContext}
【ユーザープラン】: ${userPlan}

指示：
1. 市場参加者の心理と流動性の分布を見抜いて分析してください。
2. 過度な太字（**）の使用を避けてください。
3. 最後に必ず以下の形式でJSONを含めてください。
<data>
{
  "shortSummary": "1行のテクニカル要約",
  "targetPrice": 152.50,
  "liquidityLevels": [
    {"price": 152.80, "strength": 0.95}
  ]
}
5. 日本語で回答し、数値は小数点第2位まで含めてください。
${fastMode ? '【重要】説明文は一切不要です。挨拶も不要です。<data>タグで囲まれたJSON文字列のみを絶対に出力してください。他の文章が含まれるとシステムがクラッシュします。' : ''}`;

  const modelId = 'gemini-1.5-flash';
  const analysis = await callWithFallback(modelId, "あなたは鋭い視点を持つプロップトレーダーです。", prompt);

  return {
    agentName: 'Prop Trader',
    analysis: analysis,
  };
}

/**
 * Agent 4: Leader Agent (Synthesis)
 */
async function runLeaderAgent(expertAnalyses: AgentResponse[], userPlan: string, fastMode: boolean = false): Promise<string> {
  if (isMockMode()) {
    return `【総合診断（モック）】市場は重要指標を前にした様子見ムードです。分析の結果、短期的なテクニカルな優位性は認められますが、マクロ的な不確実性が残ります。
<data>
{
  "decision": "CAUTION",
  "totalScore": 65.50,
  "summary": "様子見を推奨",
  "entry": "150.00",
  "tp": "152.00",
  "sl": "148.50",
  "agreedPoints": ["短期的な下値の堅さ", "ボラティリティの低下傾向"],
  "rejectedPoints": ["長期的なトレンドの転換点", "深夜帯の流動性リスク"],
  "consensusSummary": "テクニカル的には買いだが、マクロ指標待ちで合意。"
}
</data>`;
  }

  const analysesSummary = expertAnalyses.map(a => `【${a.agentName}の分析】\n${a.analysis}`).join('\n\n');
  const prompt = `あなたは「シナプス・キャピタル」の最高投資責任者（CIO）です。
各専門家の分析とデータを統合し、最終結論を日本語で出力してください。

${analysesSummary}
【ユーザープラン】: ${userPlan}

指示：
1. 専門家の意見を統合し、実効性のある戦略を提示してください。
2. 以下のセクション見出しを必ず含めてレポートを構成してください：
   - 総合分析: (全体像の把握)
   - 委員会内での議論: (専門家同士の対立点や合意点)
   - 合意事項（メリット・強み）: (具体的ポジティブ要素)
   - 否定・懸念事項（リスク・弱点）: (具体的注意点)
   - 時間軸でのアドバイス (JST): (日本時間を考慮したエントリー/決済タイミング)
   - 推奨するアクション: (具体的なBUY/SELL/WAITの最終判断)
   - プランの妥当性に関する最終評決: (ユーザーが最後に入力したプランが、プロの視点から見て「妥当」か「見送り」かの最終判断とその理由)
   - 結論: (総括)
3. 最後に必ず以下の形式でJSONを含めてください。
<data>
{
  "decision": "GO / NO GO / CAUTION",
  "totalScore": 82.00,
  "summary": "15文字以内のタイトル",
  "entry": "150.25",
  "tp": "152.50",
  "sl": "148.75",
  "agreedPoints": ["合意事項1", "合意事項2"],
  "rejectedPoints": ["否定・懸念事項1", "否定・懸念事項2"],
  "consensusSummary": "委員会内での主な議論ポイントの要約"
}
</data>
4. 数値はすべて小数点第2位まで表示してください。挨拶は不要です。直接レポートを開始してください。
${fastMode ? '【重要・最優先事項】あなたは現在超高速バッチ処理モードです。レポート本文、見出し、説明文は**一切不要**です。<data>タグで囲まれたJSON文字列のみを絶対に出力してください。他の文章が1文字でも含まれるとシステムがクラッシュします。entry, tp, sl には必ず具体的な数値価格を含めてください。' : ''}`;

  const modelId = 'gemini-1.5-pro';
  const analysis = await callWithFallback(modelId, "あなたは「シナプス・キャピタル」の最高投資責任者（CIO）です。", prompt);

  return analysis;
}

/**
 * Execute all agents in parallel and synthesize
 */
export async function runMultiAgentAnalysis(
  ticker: string,
  userPlan: string,
  context: MarketContext,
  assetClass: 'FX' | 'STOCK' | 'CRYPTO' = 'FX',
  fastMode: boolean = false
): Promise<FinalAnalysis> {

  // If in mock mode, use deterministic analysis directly
  if (isMockMode()) {
    console.log('[Position Checker] No AI keys configured. Using deterministic analysis.');
    return generateDeterministicAnalysis(context, ticker, userPlan, assetClass);
  }

  try {
    // Parallel Execution of Expert Agents
    const expertPromises = [
      runAnalystAgent(context, userPlan, assetClass, fastMode),
      runFundManagerAgent(context, ticker, userPlan, assetClass, fastMode),
      runPropTraderAgent(context, ticker, userPlan, assetClass, fastMode),
    ];

    const expertAnalyses = await Promise.all(expertPromises);

    // Leader synthesis
    let leaderSynthesis = await runLeaderAgent(expertAnalyses, userPlan, fastMode);

    // Validate leader response — if it lacks structured sections or <data> tag, use deterministic fallback
    const hasDataTag = /<data>/i.test(leaderSynthesis);
    const hasStructuredSections = /総合分析|推奨するアクション|結論/.test(leaderSynthesis);
    if (!hasDataTag || (!hasStructuredSections && leaderSynthesis.length < 200)) {
      console.warn('[Position Checker] Leader synthesis was malformed. Using deterministic fallback for leader.');
      const fallback = generateDeterministicAnalysis(context, ticker, userPlan, assetClass);
      leaderSynthesis = fallback.leaderSynthesis;
    }

    return {
      expertAnalyses,
      leaderSynthesis,
      timestamp: context.timestamp || new Date().toISOString(),
      ticker,
      userPlan
    };
  } catch (err: any) {
    console.warn(`[Position Checker] AI analysis failed: ${err.message}. Falling back to deterministic analysis.`);
    return generateDeterministicAnalysis(context, ticker, userPlan, assetClass);
  }
}
