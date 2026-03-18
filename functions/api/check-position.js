/**
 * Cloudflare Pages Function: /api/check-position
 * This is the production AI analysis endpoint.
 * It runs as a Cloudflare Pages Edge Function alongside the static export.
 */

const FREE_MODELS = [
  "google/gemini-2.0-flash-001",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemini-flash-1.5-8b",
  "qwen/qwen-2.5-72b-instruct",
  "mistralai/mistral-7b-instruct:free"
];

const rateLimitMap = new Map();
const LIMIT_PER_DAY = 5;

function checkRateLimit(ip, adminIp) {
  if (adminIp && ip === adminIp) return { allowed: true, remaining: 999 };
  const now = Date.now();
  const today = new Date().setHours(0, 0, 0, 0);
  let record = rateLimitMap.get(ip);
  if (!record || record.lastReset < today) record = { count: 0, lastReset: now };
  if (record.count >= LIMIT_PER_DAY) {
    return { allowed: false, remaining: 0, resetTime: new Date(today + 86400000).toLocaleTimeString('ja-JP') };
  }
  record.count += 1;
  rateLimitMap.set(ip, record);
  return { allowed: true, remaining: LIMIT_PER_DAY - record.count };
}

async function callOpenRouter(modelId, systemPrompt, userPrompt, apiKey) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
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
    throw new Error(`OpenRouter Error: ${response.status} - ${text}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callGemini(prompt, systemPrompt, apiKey) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );
  if (!response.ok) throw new Error(`Gemini Error: ${response.status}`);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callWithFallback(prompt, systemPrompt, env) {
  const geminiKey = env.GEMINI_API_KEY;
  const openrouterKey = env.OPENROUTER_API_KEY;
  
  if (geminiKey) {
    try {
      return await callGemini(prompt, systemPrompt, geminiKey);
    } catch (err) {
      console.warn('Gemini failed, trying OpenRouter...');
    }
  }
  
  if (openrouterKey) {
    for (const modelId of FREE_MODELS) {
      try {
        return await callOpenRouter(modelId, systemPrompt, prompt, openrouterKey);
      } catch (err) {
        console.warn(`OpenRouter ${modelId} failed...`);
      }
    }
  }
  
  throw new Error("All AI models failed.");
}

async function getMarketContext(ticker, env) {
  const twelveDataKey = env.TWELVE_DATA_API_KEY;
  const fmpKey = env.FMP_API_KEY;
  
  const context = { timestamp: new Date().toISOString() };
  
  try {
    if (twelveDataKey) {
      const priceRes = await fetch(
        `https://api.twelvedata.com/quote?symbol=${ticker}&apikey=${twelveDataKey}`
      );
      if (priceRes.ok) {
        const priceData = await priceRes.json();
        context.price = parseFloat(priceData.close);
        context.changePercent = parseFloat(priceData.percent_change);
        context.high = parseFloat(priceData.high);
        context.low = parseFloat(priceData.low);
      }
    }
  } catch (err) {
    console.warn('Failed to fetch market data:', err);
  }
  
  return context;
}

export async function onRequestGet() {
  return new Response(JSON.stringify({ message: 'Synapse Capital API is active. Use POST to analyze positions.' }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  // Rate limiting
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminIp = env.ADMIN_IP;
  const { allowed, remaining, resetTime } = checkRateLimit(ip, adminIp);
  
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: `1日の無料分析回数(5回)を超えました。${resetTime}以降に再度お試しください。` }),
      { status: 429, headers }
    );
  }
  
  try {
    const { ticker, assetClass = 'FX', userPlan } = await request.json();
    
    if (!ticker || !userPlan) {
      return new Response(
        JSON.stringify({ error: '銘柄(ticker)とトレードプラン(userPlan)が必要です。' }),
        { status: 400, headers }
      );
    }
    
    // Fetch market context
    const marketCtx = await getMarketContext(ticker, env);
    
    // Run agents in parallel
    const assetSpecificGoal = assetClass === 'STOCK' ? "株式ファンダメンタル分析" 
      : assetClass === 'CRYPTO' ? "暗号資産マーケット分析" 
      : "グローバルFX/マクロ分析";
    
    const analystPrompt = `あなたは世界トップクラスの投資アナリストです。${assetSpecificGoal}を行ってください。
【アセットクラス】: ${assetClass}
【シンボル】: ${ticker}
【現在価格】: ${marketCtx.price || 'N/A'}
【変動率】: ${marketCtx.changePercent || 'N/A'}%
【ユーザープラン】: ${userPlan}
指示：現在の市場の主材料を簡潔に分析し、日本語で回答してください。最後に必ず以下のJSONを含めてください。
<data>
{"shortSummary":"1行の要約","sentimentScore":70.00,"correlations":[{"pair":"Target","value":1.00}]}
</data>`;

    const fundManagerPrompt = `あなたはヘッジファンドのリスクマネージャーです。${assetClass}のリスク評価を行ってください。
【シンボル】: ${ticker} 【ユーザープラン】: ${userPlan}
日本語で回答してください。最後に必ず以下のJSONを含めてください。
<data>
{"shortSummary":"リスク状況","riskLevel":3,"volatility":0.45,"expectedAtr":0.85}
</data>`;

    const propTraderPrompt = `あなたはプロップトレーダーです。${assetClass}の市場センチメントを分析してください。
【シンボル】: ${ticker} 【ユーザープラン】: ${userPlan}
日本語で回答してください。最後に必ず以下のJSONを含めてください。
<data>
{"shortSummary":"テクニカル要約","targetPrice":0.00,"liquidityLevels":[{"price":0.00,"strength":0.85}]}
</data>`;

    const [analystAnalysis, fundManagerAnalysis, propTraderAnalysis] = await Promise.all([
      callWithFallback(analystPrompt, `あなたは${assetSpecificGoal}のスペシャリストです。`, env),
      callWithFallback(fundManagerPrompt, "あなたはヘッジファンドのリスクマネージャーです。", env),
      callWithFallback(propTraderPrompt, "あなたはプロップトレーダーです。", env),
    ]);
    
    const expertAnalyses = [
      { agentName: 'Analyst', analysis: analystAnalysis },
      { agentName: 'Fund Manager', analysis: fundManagerAnalysis },
      { agentName: 'Prop Trader', analysis: propTraderAnalysis },
    ];
    
    const leaderPrompt = `あなたは「シナプス・キャピタル」の最高投資責任者（CIO）です。各専門家の分析を統合し、最終結論を日本語で出力してください。
${expertAnalyses.map(a => `【${a.agentName}の分析】\n${a.analysis}`).join('\n\n')}
【ユーザープラン】: ${userPlan}
以下のセクションを必ず含めてください：総合分析 / 委員会内での議論 / 合意事項（メリット・強み） / 否定・懸念事項（リスク・弱点） / 時間軸でのアドバイス / 推奨するアクション / 結論
最後に必ず以下のJSONを含めてください。
<data>
{"decision":"GO / NO GO / CAUTION","totalScore":75.00,"summary":"15文字以内の要約","agreedPoints":["合意点"],"rejectedPoints":["懸念点"],"consensusSummary":"委員会の議論ポイント"}
</data>`;

    const leaderSynthesis = await callWithFallback(leaderPrompt, "あなたはシナプス・キャピタルの最高投資責任者（CIO）です。", env);
    
    const result = {
      expertAnalyses,
      leaderSynthesis,
      timestamp: marketCtx.timestamp,
      ticker,
      userPlan
    };
    
    return new Response(JSON.stringify(result), { headers });
    
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || '予期せぬエラーが発生しました。' }),
      { status: 500, headers }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
