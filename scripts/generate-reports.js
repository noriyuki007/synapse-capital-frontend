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
以下の最新ニュースに基づき、現在の${genre}市場に関する、SEO（EEAT）を極限まで意識した専門的なマーケット分析レポートを執筆してください。

【最新ニュース（参考資料）】
${titles.map(t => `- ${t}`).join('\n')}

【執筆・構成ルール（最重要）】
1. **タイトル**: 読者の検索意図（解決したい悩み）に合致し、信頼感を与えるもの（35文字以内）。
2. **文字量**: SEO上の競争力を確保するため、3000文字以上の圧倒的な情報量を目指すこと。
3. **要約（TL;DR）**: 冒頭に、この記事の結論と重要ポイントを3行配置すること。
4. **セクション構成**:
   - ## 1. 市場概況とファンダメンタルズ分析
   - ## 2. テクニカル分析と主要価格水準
   - ## 3. AIによる独自予測：シナリオ分析
   - ## 4. リスク管理と今後の投資戦略
5. **FAQ**: 最後に、読者が抱く疑問に対するQ&Aを3つ作成してください（JSON-LD用）。
6. **AIによるアクションプラン**: 具体的に「今、投資家が取るべき行動」を3つのステップで提示すること。
7. **誠実さ**: 誇大広告を避け、データの裏付けがある冷静なトーンで執筆すること。
8. **内部リンク**: [${genre === 'FX' ? '初心者向けFX口座の選び方' : genre === 'STOCKS' ? '米国株投資の始め方' : '安全な仮想通貨取引所ランキング'}](/ja/exchange/${genre === 'FX' ? 'fx-start-guide' : genre === 'STOCKS' ? 'us-stock-guide' : 'crypto-safety'})

9. **シグナルデータ**: 記事の最後に、必ず以下のJSONフォーマットでマーケットシグナルを1件含めてください（\`\`\`json ... \`\`\` で囲む）。
   \`\`\`json
   {
     "pair": "主要な通貨ペア・銘柄",
     "status": "BUY または SELL",
     "comment": "150文字程度。具体的な根拠を示す。",
     "entry": "価格",
     "tp": "利確ターゲット",
     "sl": "損切りポイント",
     "reliability": "HIGH/MEDIUM/LOW"
   }
   \`\`\`

10. **Frontmatter**: 記事の先頭に、必ず以下のYAML形式のFrontmatterを含めて出力してください。
---
title: "記事タイトル"
date: "YYYY-MM-DD"
genre: "${genre}"
target_pair: "銘柄名"
prediction_direction: "UP/DOWN/FLAT"
recommended_broker: "${broker}"
tldr: "3行の結論（改行あり）"
excerpt: "120文字のメタディスクリプション"
---

【HTML構造】
- markdown の ## (H2), ### (H3), #### (H4) を厳格に使用。
- 読者の可読性を高めるため、箇条書き（- ）や引用（> ）を積極的に活用。
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
