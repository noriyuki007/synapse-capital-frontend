import fs from 'fs';
import path from 'path';

// --- 設定 ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const REPORTS_DIR = './content/reports';

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
        const res = await fetch(url);
        const xml = await res.text();
        const items = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
        return items.slice(0, 5).map(item => {
            const title = (item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
            return title;
        });
    } catch (e) {
        console.error(`Failed to fetch RSS: ${url}`);
        return [];
    }
}

const RECOMMENDED_BROKERS = {
    FX: 'dmm-fx',
    STOCKS: 'moomoo-securities',
    CRYPTO: 'bitflyer'
};

async function generateWithGemini(genre, titles) {
    const persona = PERSONAS[genre];
    const broker = RECOMMENDED_BROKERS[genre];
    
    const prompt = `
以下の情報を基に、プロフェッショナルな金融メディア向けマーケット分析レポートを執筆してください。
【重要】「文字の羅列」を避け、以下の4つのセクション構成を厳守してください。

【最新ニュース（参考資料）】
${titles.map(t => `- ${t}`).join('\n')}

【執筆ルール：セクション構成の定義】
## 1. 市場環境とファンダメンタルズ
- **キーワード**: [マーケットを象徴する単語を3-5個、カンマ区切りで]
- **サマリー**: [2-3行の簡潔な状況説明]

## 2. AI多角分析（シナプス解析）
- **金利相関解析**: [解析内容と相関係数を数値で]
- **オーダーブック解析**: [主要な注文滞留帯の価格]
- **センチメント解析**: [SNSやニュース等の市場心理指数]

## 3. テクニカル分析
- **RSI**: [現在の数値]
- **移動平均線**: [状態（ゴールデンクロス等）]
- **分析ポイント**: [箇条書きで2点]

## 4. プロ・トレーディング戦略
- **戦略**: [全体方針]
- **利確ターゲット**: [価格]
- **損切りライン**: [価格]

【Frontmatter (厳守)】
---
title: "記事タイトル"
date: "YYYY-MM-DD"
genre: "${genre}"
target_pair: "主要銘柄名"
prediction_direction: "UP/DOWN/FLAT"
recommended_broker: "${broker}"
tldr_points: ["ポイント1", "ポイント2", "ポイント3"]
excerpt: "120文字のメタディスクリプション"
---

【シグナルデータ】
記事の最後にJSONを配置。
\`\`\`json
{
  "pair": "銘柄名",
  "status": "BUY または SELL",
  "comment": "150文字程度の具体的な根拠",
  "entry": "価格",
  "tp": "利確ターゲット",
  "sl": "損切りポイント",
  "reliability": "HIGH/MEDIUM/LOW"
}
\`\`\`
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: persona.prompt }] },
            generationConfig: { temperature: 0.7, topP: 0.95 }
        })
    });

    const data = await response.json();
    if (!data.candidates) {
        console.error('Gemini API Error:', JSON.stringify(data, null, 2));
        throw new Error('Gemini API call failed');
    }
    return data.candidates[0].content.parts[0].text;
}

// --- メイン処理 ---
async function main() {
    if (!GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not set.');
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
            const markdown = await generateWithGemini(genre, allTitles);
            const fileName = `${today}-${genre.toLowerCase()}.md`;
            const filePath = path.join(REPORTS_DIR, fileName);
            fs.writeFileSync(filePath, markdown);
            console.log(`Saved: ${filePath}`);

            // 最新のシグナルをJSONとしてまとめ
            const signalMatch = markdown.match(/```json\n([\s\S]*?)\n```/);
            if (signalMatch) {
                const signal = JSON.parse(signalMatch[1]);
                const signalsFile = path.join('./content', 'latest-signals.json');
                let existingSignals = {};
                if (fs.existsSync(signalsFile)) {
                    existingSignals = JSON.parse(fs.readFileSync(signalsFile, 'utf8'));
                }
                existingSignals[genre] = signal;
                fs.writeFileSync(signalsFile, JSON.stringify(existingSignals, null, 2));
                console.log(`Updated latest-signals.json with ${genre}`);
            }
        } catch (e) {
            console.error(`Failed to generate ${genre}:`, e);
        }
    }
}

main();
