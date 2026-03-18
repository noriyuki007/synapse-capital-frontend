import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- 設定 ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const REPORTS_DIR = './content/reports';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || 'dummy_key');


const PERSONAS = {
    FX: {
        name: 'The Macro Strategist',
        prompt: `あなたはSynapseCapitalのFX専門AIストラテジスト「AntiGravity」です。
中銀政策、金利動向、地政学的リスクを論理的に分析します。
専門用語を使いつつも、初心者にも分かりやすい「投資の羅針盤」となる記事を書いてください。`
    },
    STOCKS: {
        name: 'The Equity Scout',
        prompt: `あなたはSynapseCapitalの株式専門AIアナリスト「AntiGravity」です。
企業決算、セクターローテーション、市場心理を分析します。
冷静沈着かつ鋭い視点で、株価の裏にあるストーリーを解明してください。`
    },
    CRYPTO: {
        name: 'The Crypto Alchemist',
        prompt: `あなたはSynapseCapitalの暗号資産専門AI「AntiGravity」です。
オンチェーンデータ、DeFi、規制動向を分析します。
ボラティリティに隠された本質的な価値の変化を読み解いてください。`
    }
};

const RSS_FEEDS = [
    { url: 'https://www.fxstreet.com/rss/news', type: 'FX' },
    { url: 'https://www.forexlive.com/feed/', type: 'FX' },
    { url: 'https://www.marketwatch.com/rss/topstories', type: 'STOCKS' },
    { url: 'https://www.theblock.co/rss.xml', type: 'CRYPTO' }
];

// --- 補助関数 ---
async function fetchRSS(url) {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (SynapseCapital AI Crawler)'
            }
        });

        if (!res.ok) {
            console.warn(`⚠️ RSS fetch failed for ${url} (Status: ${res.status})`);
            return [];
        }

        const xml = await res.text();
        // Support both <item> (RSS) and <entry> (Atom)
        const items = xml.match(/<(item|entry)>([\s\S]*?)<\/\1>/gi) || [];
        
        return items.slice(0, 5).map(item => {
            let titleMatch = item.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            let title = (titleMatch?.[1] || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
            
            // Basic HTML Entity Decoding
            title = title
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&#x2018;/g, "‘")
                .replace(/&#x2019;/g, "’")
                .replace(/&#x201C;/g, "“")
                .replace(/&#x201D;/g, "”")
                .replace(/&#8217;/g, "’")
                .replace(/&#8211;/g, "–")
                .replace(/&ndash;/g, "–")
                .replace(/&#8212;/g, "—")
                .replace(/&mdash;/g, "—");
            return title;
        });
    } catch (e) {
        console.error(`❌ Failed to fetch RSS: ${url}`, e.message);
        return [];
    }
}

const RECOMMENDED_BROKERS = {
    FX: 'dmm-fx',
    STOCKS: 'moomoo-securities',
    CRYPTO: 'bitflyer'
};

const TICKER_MAP = {
    FX: { symbol: 'USD/JPY', ticker: 'USDJPY=X' },
    STOCKS: { symbol: 'S&P 500', ticker: '^GSPC' },
    CRYPTO: { symbol: 'BTC/USD', ticker: 'BTC-USD' }
};

function generateChart(genre) {
    const config = TICKER_MAP[genre];
    const imagePath = `public/images/market-analysis-${genre.toLowerCase()}.png`;
    const title = config.symbol;
    
    console.log(`📊 Calling Python to generate chart for ${genre} (${config.ticker})...`);
    try {
        const cmd = `python3 scripts/generate_chart.py "${config.ticker}" "${imagePath}" "${title}"`;
        const output = execSync(cmd).toString();
        
        const match = output.match(/MARKET_DATA_JSON:(.*)/);
        if (match) {
            return JSON.parse(match[1]);
        }
    } catch (e) {
        console.error(`❌ Failed to generate chart for ${genre}:`, e.message);
    }
    return null;
}





async function generateWithGemini(genre, titles, marketData) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'mock') {
        console.warn(`[${genre}] GEMINI_API_KEY missing or mock. Returning mock content.`);
        return `---
title: "【モック】${genre}市場分析レポート"
date: "${new Date().toISOString().split('T')[0]}"
genre: "${genre}"
target_pair: "USD/JPY"
prediction_direction: "FLAT"
recommended_broker: "${RECOMMENDED_BROKERS[genre]}"
tldr_points: ["マーケットは様子見ムード", "テクニカル指標は中立", "重要指標の発表待ち"]
chart_image: "/images/market-analysis-${genre.toLowerCase()}.png"
excerpt: "本レポートは開発用のモックデータです。実際のAI分析を表示するにはAPIキーを設定してください。"
---
## 1. 市場環境
モックデータによる環境分析です。

\`\`\`json
{
  "pair": "MOCK",
  "status": "FLAT",
  "comment": "モックデータです",
  "entry": "---",
  "tp": "---",
  "sl": "---",
  "reliability": "LOW"
}
\`\`\`
`;
    }

    const jstDateObj = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
    const jstDateStr = jstDateObj.toISOString().split('T')[0];

    const persona = PERSONAS[genre];
    const broker = RECOMMENDED_BROKERS[genre];
    
    // モデル設定: Flash is faster and more reliable for automated tasks
    const modelId = 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ 
        model: modelId,
        systemInstruction: persona.prompt
    });

    const prompt = `
以下の情報を基に、プロフェッショナルな金融メディア向けマーケット分析レポートを執筆してください。
【重要】あなたは「検証隊」ではありません。自分の呼称が必要な場合は「本日のAI解析」や「シンプス解析」と呼んでください。

【構成の定義：この構造を1文字も違わず守ってください】
## 1. 市場環境とファンダメンタルズ
- **キーワード**: [マーケットを象徴する単語を3-5個、タグ形式で]
- **サマリー**: [2-3行の簡潔な状況説明。重要な語句は<strong>で囲むこと]

## 2. AI多角分析（シナプス解析）
- 金利相関解析: [数値と傾向]
- オーダーブック解析: [主要な価格帯]
- センチメント解析: [現在の市場心理指数]

## 3. テクニカル分析
- RSI: ${marketData?.rsi ? parseFloat(marketData.rsi).toFixed(2) : '[数値]'}
- 移動平均線: ${marketData?.ma20 && marketData?.current_price ? (parseFloat(marketData.current_price) > parseFloat(marketData.ma20) ? '20日線を上回り強気' : '20日線を下回り弱気') : '[状態]'}
- 分析ポイント: [箇条書きで2点。実際の数値 ${marketData?.current_price ? parseFloat(marketData.current_price).toFixed(2) : '---'} に言及すること]

## 4. プロ・トレーディング戦略
- 戦略: [全体方針。1行で簡潔に]
- 利確ターゲット: [価格。必ず小数点第2位まで表示]
- 損切りライン: [価格。必ず小数点第2位まで表示]

## 5. AI結論とアクションプラン
- 結論サマリー: [現在の市場環境に基づく最終的な結論を150文字程度で。挨拶や導入文は一切含めないこと。]
- Next Step: [今後数日間の具体的なアクションプランを3つの箇条書きで]

【実際の市場データ (この数値を小数点第2位に直して記事に反映させてください)】
- 現在価格: ${marketData?.current_price ? parseFloat(marketData.current_price).toFixed(2) : '不明'}
- 20日移動平均: ${marketData?.ma20 ? parseFloat(marketData.ma20).toFixed(2) : '不明'}
- 50日移動平均: ${marketData?.ma50 ? parseFloat(marketData.ma50).toFixed(2) : '不明'}
- RSI(14): ${marketData?.rsi ? parseFloat(marketData.rsi).toFixed(2) : '不明'}

【最新ニュース（参考資料）】
${titles.map(t => `- ${t}`).join('\n')}

指示：
1. 「了解しました」や「執筆します」などのメタ発言は一切禁止です。
2. 記事内のすべての数値（価格、RSI、移動平均など）は、必ず小数点第2位まで表示してください（例: 150.25）。
3. 文章はプロフェッショナルかつ簡潔にまとめ、太字の多用は避けてください。

【Frontmatter (厳守)】
---
title: "プロ仕様の記事タイトル"
date: "${jstDateStr}"
genre: "${genre}"
target_pair: "銘柄名（USD/JPYなど）"
prediction_direction: "UP/DOWN/FLAT"
recommended_broker: "\${broker}"
tldr_points: ["AI予測の核心1", "AI予測の核心2", "AI予測の核心3"]
chart_image: "/images/market-analysis-\${genre.toLowerCase()}.png"
excerpt: "120文字程度の要約。検索結果に表示される重要な文章です。"
---

【シグナルデータ】
記事の最後に以下のJSONを配置。
\`\`\`json
{
  "pair": "銘銘柄名",
  "status": "BUY または SELL",
  "comment": "100文字程度の具体的な根拠",
  "entry": "想定エントリー価格",
  "tp": "ターゲット価格",
  "sl": "損切り価格",
  "reliability": "HIGH/MEDIUM/LOW"
}
\`\`\`
    `;

    try {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'mock') {
            throw new Error('Gemini API key is missing or mock.');
        }
        console.log(`[${genre}] Generating with ${modelId}...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log(`[${genre}] ✅ Generation successful.`);
        return response.text();
    } catch (e) {
        console.warn(`[${genre}] ⚠️ Gemini generation failed, will try fallback:`, e.message);
        throw e;
    }
}

// OpenRouterで利用可能な無料モデル（または安価な高性能モデル）のリスト
const FREE_MODELS = [
    "google/gemini-2.0-flash-001", // 高性能・高速
    "meta-llama/llama-3.3-70b-instruct:free", // 定番の無料枠
    "google/gemini-flash-1.5-8b", // 軽量・高可用性
    "qwen/qwen-2.5-72b-instruct", // Qwenの高性能モデル
    "mistralai/mistral-7b-instruct:free" // 軽量・バックアップ用
];

async function generateWithOpenRouter(genre, titles, marketData, modelId = FREE_MODELS[0]) {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is not set.');
    }

    const jstDateObj = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
    const jstDateStr = jstDateObj.toISOString().split('T')[0];

    const persona = PERSONAS[genre];
    const broker = RECOMMENDED_BROKERS[genre];
    
    const prompt = `
以下の情報を基に、プロフェッショナルな金融メディア向けマーケット分析レポートを執筆してください。
【重要】あなたは「検証隊」ではありません。自分の呼称が必要な場合は「本日のAI解析」や「シンプス解析」と呼んでください。

【構成の定義：この構造を1文字も違わず守ってください】
## 1. 市場環境とファンダメンタルズ
- **キーワード**: [マーケットを象徴する単語を3-5個、タグ形式で]
- **サマリー**: [2-3行の簡潔な状況説明。重要な語句は<strong>で囲むこと]

## 2. AI多角分析（シナプス解析）
- 金利相関解析: [数値と傾向]
- オーダーブック解析: [価格帯]
- センチメント解析: [現在の市場心理指数]

## 3. テクニカル分析
- RSI: ${marketData?.rsi ? parseFloat(marketData.rsi).toFixed(2) : '[数値]'}
- 移動平均線: ${marketData?.ma20 && marketData?.current_price ? (parseFloat(marketData.current_price) > parseFloat(marketData.ma20) ? '20日線を上回り強気' : '20日線を下回り弱気') : '[状態]'}
- 分析ポイント: [箇条書きで2点。実際の数値 ${marketData?.current_price ? parseFloat(marketData.current_price).toFixed(2) : '---'} に言及すること]

## 4. プロ・トレーディング戦略
- 戦略: [全体方針。1行で簡潔に]
- 利確ターゲット: [価格。必ず小数点第2位まで表示]
- 損切りライン: [価格。必ず小数点第2位まで表示]

## 5. AI結論とアクションプラン
- 結論サマリー: [現在の市場環境に基づく最終的な結論を150文字程度で。挨拶や導入文は一切含めないこと。]
- Next Step: [今後数日間の具体的なアクションプランを3つの箇条書きで]

【実際の市場データ (この数値を小数点第2位に直して記事に反映させてください)】
- 現在価格: ${marketData?.current_price ? parseFloat(marketData.current_price).toFixed(2) : '不明'}
- 20日移動平均: ${marketData?.ma20 ? parseFloat(marketData.ma20).toFixed(2) : '不明'}
- 50日移動平均: ${marketData?.ma50 ? parseFloat(marketData.ma50).toFixed(2) : '不明'}
- RSI(14): ${marketData?.rsi ? parseFloat(marketData.rsi).toFixed(2) : '不明'}

【最新ニュース（参考資料）】
${titles.map(t => `- ${t}`).join('\n')}

指示：
1. 「了解しました」や「執筆します」などのメタ発言は一切禁止です。
2. 記事内のすべての数値（価格、RSI、移動平均など）は、必ず小数点第2位まで表示してください（例: 150.25）。
3. 文章はプロフェッショナルかつ簡潔にまとめ、太字の多用は避けてください。

【Frontmatter (厳守)】
---
title: "プロ仕様の記事タイトル"
date: "${jstDateStr}"
genre: "${genre}"
target_pair: "銘柄名（USD/JPYなど）"
prediction_direction: "UP/DOWN/FLAT"
recommended_broker: "\${broker}"
tldr_points: ["AI予測の核心1", "AI予測の核心2", "AI予測の核心3"]
chart_image: "/images/market-analysis-\${genre.toLowerCase()}.png"
excerpt: "120文字程度の要約。検索結果に表示される重要な文章です。"
---

【シグナルデータ】
記事の最後に以下のJSONを配置。
\`\`\`json
{
  "pair": "銘柄名",
  "status": "BUY または SELL",
  "comment": "100文字程度の具体的な根拠",
  "entry": "想定エントリー価格",
  "tp": "ターゲット価格",
  "sl": "損切り価格",
  "reliability": "HIGH/MEDIUM/LOW"
}
\`\`\`
    `;

    console.log(`[${genre}] Attempting fallback with OpenRouter (${modelId})...`);
    
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://synapsecapital.net",
                "X-Title": "Synapse Capital Auto-Post"
            },
            body: JSON.stringify({
                model: modelId,
                messages: [
                    { role: "system", content: persona.prompt },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        
        if (!content) {
            throw new Error("OpenRouter returned empty content.");
        }

        console.log(`[${genre}] ✅ OpenRouter generation successful using ${modelId}.`);
        return content;
    } catch (e) {
        console.error(`[${genre}] ❌ OpenRouter fallback failed for ${modelId}:`, e.message);
        throw e;
    }
}


// --- メイン処理 ---
async function main() {
    if (!GEMINI_API_KEY && !OPENROUTER_API_KEY) {
        console.error('Neither GEMINI_API_KEY nor OPENROUTER_API_KEY is set. Cannot proceed.');
        process.exit(1);
    }

    const today = new Date().toISOString().split('T')[0];
    
    for (const genre of Object.keys(PERSONAS)) {
        console.log(`Generating report for ${genre}...`);
        
        const feeds = RSS_FEEDS.filter(f => f.type === genre);
        let allTitles = [];
        for (const f of feeds) {
            const titles = await fetchRSS(f.url);
            allTitles = allTitles.concat(titles);
        }

        if (allTitles.length === 0) {
            console.log(`No news found for ${genre}, skipping.`);
            continue;
        }

        try {
            const marketData = generateChart(genre);
            let markdown;
            
            try {
                // First attempt: Primary Gemini API
                markdown = await generateWithGemini(genre, allTitles, marketData);
            } catch (geminiErr) {
                console.warn(`[${genre}] Gemini failed. Starting OpenRouter fallback chain...`);
                
                // Fallback loop: Iterate through the free models list
                let success = false;
                for (const modelId of FREE_MODELS) {
                    try {
                        markdown = await generateWithOpenRouter(genre, allTitles, marketData, modelId);
                        success = true;
                        break;
                    } catch (orErr) {
                        console.warn(`[${genre}] OpenRouter ${modelId} failed. Trying next model...`);
                    }
                }
                
                if (!success) {
                    throw new Error(`All fallback models failed for ${genre}.`);
                }
            }
            
            // Use local date for filename to avoid timezone confusion (JST is main target)
            // But keep UTC for consistency with past files if preferred.
            // Let's use the current date in Japanese timezone (JST) as that matches the user's focus
            const jstDate = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));
            const dateStr = jstDate.toISOString().split('T')[0];
            
            const fileName = `${dateStr}-${genre.toLowerCase()}.md`;
            const filePath = path.join(REPORTS_DIR, fileName);
            fs.writeFileSync(filePath, markdown);
            console.log(`✅ Saved: ${filePath}`);

            // 最新のシグナルをJSONとしてまとめ
            const signalMatch = markdown.match(/```json\s*([\s\S]*?)\s*```/);
            if (signalMatch) {
                try {
                    const signal = JSON.parse(signalMatch[1]);
                    const signalsFile = path.join('./content', 'latest-signals.json');
                    let existingSignals = {};
                    if (fs.existsSync(signalsFile)) {
                        existingSignals = JSON.parse(fs.readFileSync(signalsFile, 'utf8'));
                    }
                    existingSignals[genre] = signal;
                    fs.writeFileSync(signalsFile, JSON.stringify(existingSignals, null, 2));
                    console.log(`✅ Updated latest-signals.json with ${genre}`);
                } catch (jsonErr) {
                    console.warn(`⚠️ Failed to parse signal JSON for ${genre}:`, jsonErr.message);
                }
            }
        } catch (e) {
            console.error(`❌ Failed to generate ${genre}:`, e.message);
            // Don't throw here to allow other genres to proceed
            continue;
        }
    }
}

main();
