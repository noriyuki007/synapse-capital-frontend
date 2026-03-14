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
以下の情報を基に、プロ仕様の金融メディア向けマーケット分析レポートを執筆してください。
【重要】「文字の羅列」を避け、構造化されたリズムのある記事構成にしてください。

【最新ニュース（参考資料）】
${titles.map(t => `- ${t}`).join('\n')}

【執筆ルール：記事構成の定義】
1. **タイトル**: 35文字以内。読者が一目で価値を理解できるインパクトのあるもの。
2. **本日の3大ポイント (TL;DR)**: 冒頭に配置。この記事の結論を3つの箇条書きでまとめてください（120文字程度）。
3. **セクション構成（銘柄別分析）**: 
   主要な通貨ペアや銘柄ごとに以下の「分析ブロック」を2〜3つ作成してください。
   - ### [銘柄名（例：USD/JPY）]
   - ステータス：[強気 / 弱気 / 中立]
   - 分析：[2-3行の簡潔かつ本質を突いた分析テキスト。重要な価格水準やキーワードは **太字** で強調すること。]
4. **検証隊AIのアドバイス（アクションプラン）**:
   「今、投資家が取るべき具体的な行動」を3ステップの箇条書き（Step 1... Step 2... Step 3...）で提示してください。
5. **関連ニュースリンク**: 記事に関連する、読者が深掘りすべきトピックを3つ提示してください。
6. **FAQ**: 読者の疑問に答える形式で、SEO用のQ&Aを2つ含めてください。

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
記事の最後に、必ず以下のJSONを \`\`\`json ... \`\`\` で囲んで配置。
{
  "pair": "銘柄名",
  "status": "BUY または SELL",
  "comment": "150文字程度の具体的な根拠",
  "entry": "価格",
  "tp": "利確ターゲット",
  "sl": "損切りポイント",
  "reliability": "HIGH/MEDIUM/LOW"
}

【スタイル指示】
- Markdownの ## (H2), ### (H3) を厳守してください。
- 専門用語を使いつつも、論理的でスッキリとした文章を心がけてください。
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
