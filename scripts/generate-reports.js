import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Configuration ---
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

// Helper: Get JST Date string (YYYY-MM-DD)
function getJSTDateStr() {
    const jstDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
    const y = jstDate.getFullYear();
    const m = String(jstDate.getMonth() + 1).padStart(2, '0');
    const d = String(jstDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// --- Helper Functions ---
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
        const items = xml.match(/<(item|entry)>([\s\S]*?)<\/\1>/gi) || [];
        
        return items.slice(0, 5).map(item => {
            let titleMatch = item.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            let title = (titleMatch?.[1] || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
            
            title = title
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");
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
    const jstDateStr = getJSTDateStr();
    const persona = PERSONAS[genre];
    const broker = RECOMMENDED_BROKERS[genre];
    const modelId = 'gemini-1.5-flash-latest';
    
    const model = genAI.getGenerativeModel({ 
        model: modelId,
        systemInstruction: persona.prompt
    });

    const prompt = `
以下の情報を基に、プロフェッショナルな金融メディア向けマーケット分析レポートを執筆してください。
【重要】あなたは「検証隊」ではありません。自分の呼称が必要な場合は「本日のAI解析」や「シンプス解析」と呼んでください。

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
- 結論サマリー: [結論を150文字程度で。挨拶は不要。]
- Next Step: [3つの箇条書き]

【実際の市場データ】
- 現在価格: ${marketData?.current_price ? parseFloat(marketData.current_price).toFixed(2) : '不明'}
- 20日MA: ${marketData?.ma20 ? parseFloat(marketData.ma20).toFixed(2) : '不明'}
- RSI(14): ${marketData?.rsi ? parseFloat(marketData.rsi).toFixed(2) : '不明'}

【最新ニュース】
${titles.map(t => `- ${t}`).join('\n')}

【Frontmatter (厳守)】
---
title: "プロ仕様の記事タイトル"
date: "${jstDateStr}"
genre: "${genre}"
target_pair: "${TICKER_MAP[genre].symbol}"
prediction_direction: "UP/DOWN/FLAT"
recommended_broker: "${broker}"
tldr_points: ["AI予測の核心1", "AI予測の核心2", "AI予測の核心3"]
chart_image: "/images/market-analysis-${genre.toLowerCase()}.png"
excerpt: "120文字程度の要約。"
---

【シグナルデータ】
記事の最後にJSONを配置。
\`\`\`json
{
  "pair": "${TICKER_MAP[genre].symbol}",
  "status": "BUY または SELL",
  "comment": "根拠",
  "entry": "価格",
  "tp": "価格",
  "sl": "価格",
  "reliability": "HIGH/MEDIUM/LOW"
}
\`\`\``;

    console.log(`[${genre}] Generating with ${modelId}...`);
    const result = await model.generateContent(prompt);
    return result.response.text();
}

// --- ONLY FREE MODELS ---
const FREE_MODELS = [
    "google/gemini-2.0-flash-001", // This is currently free on OpenRouter
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemini-flash-1.5-8b:free",
    "qwen/qwen-2.5-72b-instruct:free",
    "mistralai/mistral-7b-instruct:free"
];

async function generateWithOpenRouter(genre, titles, marketData, modelId = FREE_MODELS[1]) {
    if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not set.');

    // ⛔️ TRIPLE CHECK: Ensure we only ever call free models
    const isExplicitlyFree = modelId.endsWith(':free');
    const isGeminiFlash2 = modelId === "google/gemini-2.0-flash-001"; // Known free during beta
    
    if (!isExplicitlyFree && !isGeminiFlash2) {
        console.error(`⚠️ SECURITY ALERT: Blocking non-free model call: ${modelId}`);
        throw new Error(`Permission Denied: Model ${modelId} is not verified as FREE.`);
    }

    const jstDateStr = getJSTDateStr();
    const persona = PERSONAS[genre];
    const broker = RECOMMENDED_BROKERS[genre];

    const prompt = `執筆依頼: ${genre}市場レポート。日付は ${jstDateStr}。
RSSニュース: ${titles.join(', ')}。価格データ: ${marketData?.current_price || '不明'}。
プロフェッショナルなトーンで執筆し、Frontmatterと最後にJSONシグナルを含めてください。`;

    console.log(`[${genre}] OpenRouter fallback (${modelId})...`);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: modelId,
            messages: [
                { role: "system", content: persona.prompt },
                { role: "user", content: prompt }
            ]
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    if (data.error) {
        throw new Error(`OpenRouter API Business Error: ${JSON.stringify(data.error)}`);
    }
    return data.choices[0]?.message?.content;
}

async function main() {
    if (!GEMINI_API_KEY && !OPENROUTER_API_KEY) {
        console.error('API Keys are missing.');
        process.exit(1);
    }

    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

    for (const genre of Object.keys(PERSONAS)) {
        console.log(`--- Processing genre: ${genre} ---`);
        
        const feeds = RSS_FEEDS.filter(f => f.type === genre);
        let allTitles = [];
        for (const f of feeds) {
            const titles = await fetchRSS(f.url);
            allTitles = allTitles.concat(titles);
        }

        if (allTitles.length === 0) {
            console.log(`[${genre}] No news found, skipping.`);
            continue;
        }

        try {
            const marketData = generateChart(genre);
            const dateStr = getJSTDateStr();
            const filePath = path.join(REPORTS_DIR, `${dateStr}-${genre.toLowerCase()}.md`);

            /* 
            if (fs.existsSync(filePath)) {
                console.log(`[${genre}] ${dateStr} report already exists. Skipping.`);
                continue;
            }
            */

            let markdown;
            try {
                markdown = await generateWithGemini(genre, allTitles, marketData);
            } catch (e) {
                console.warn(`[${genre}] ⚠️ Gemini generation failed, will try fallback: ${e.message}`);
                console.log(`[${genre}] Gemini failed. Starting OpenRouter fallback chain...`);
                for (const mId of FREE_MODELS) {
                    try {
                        markdown = await generateWithOpenRouter(genre, allTitles, marketData, mId);
                        if (markdown) {
                            console.log(`[${genre}] ✅ Fallback successful with ${mId}`);
                            break;
                        }
                    } catch (e2) {
                        console.error(`[${genre}] ❌ OpenRouter fallback failed for ${mId}: ${e2.message}`);
                        console.log(`[${genre}] OpenRouter ${mId} failed. Trying next model...`);
                        continue;
                    }
                }
            }

            if (!markdown) throw new Error('All generation methods failed.');

            fs.writeFileSync(filePath, markdown);
            console.log(`✅ Saved: ${filePath}`);

            // Update latest-signals.json
            const signalMatch = markdown.match(/```json\s*([\s\S]*?)\s*```/);
            if (signalMatch) {
                try {
                    const signal = JSON.parse(signalMatch[1]);
                    const sigPath = './content/latest-signals.json';
                    let sigs = fs.existsSync(sigPath) ? JSON.parse(fs.readFileSync(sigPath, 'utf8')) : {};
                    sigs[genre] = signal;
                    fs.writeFileSync(sigPath, JSON.stringify(sigs, null, 2));
                    console.log(`✅ Updated latest-signals.json`);
                } catch (e) {}
            }
        } catch (e) {
            console.error(`❌ Failed ${genre}:`, e.message);
        }
    }
}

main();
