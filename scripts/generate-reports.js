import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { GoogleGenerativeAI } from '@google/generative-ai';
import matter from 'gray-matter';

// --- Configuration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const REPORTS_DIR = './content/reports';

const CLI_DATE_ARG = process.argv.find((a) => a.startsWith('--date='));
const TARGET_DATE_RAW = process.env.TARGET_DATE || (CLI_DATE_ARG ? CLI_DATE_ARG.split('=')[1] : '');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || 'dummy_key');

/** Prefer newer IDs; first successful model wins */
const GEMINI_MODEL_CANDIDATES = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
];

const PERSONAS = {
    FX: `あなたは機関投資家・ヘッジファンド向け金融メディアのシニアマクロストラテジストです。
客観的・データ駆動で執筆し、個人的感想や会話調は禁止です。
「検証隊」「AntiGravity」などの固有名・個人的呼称は使わず、分析主体は「本日のAI解析」「シナプス解析」と表現してください。`,
    STOCKS: `あなたは機関投資家向けエクイティリサーチの主任アナリストです。
冷静かつ検証可能な論拠で執筆し、個人的感想や会話調は禁止です。
「検証隊」等は禁止。「本日のAI解析」「シナプス解析」を用いてください。`,
    CRYPTO: `あなたはデジタル資産デスクのプロ・アナリストです。
オンチェーン・流動性・マクロの統合視点で執筆し、会話調や挨拶は禁止です。
「検証隊」等は禁止。「本日のAI解析」「シナプス解析」を用いてください。`,
};

const RSS_FEEDS = [
    { url: 'https://www.forexlive.com/feed/', type: 'FX' },
    { url: 'https://www.fxstreet.com/rss/news', type: 'FX' },
    { url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=USDJPY=X', type: 'FX' },
    { url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC', type: 'STOCKS' },
    { url: 'https://www.marketwatch.com/rss/topstories', type: 'STOCKS' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', type: 'STOCKS' },
    { url: 'https://www.theblock.co/rss.xml', type: 'CRYPTO' },
    { url: 'https://cointelegraph.com/rss', type: 'CRYPTO' },
    { url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=BTC-USD', type: 'CRYPTO' },
];

const RECOMMENDED_BROKERS = {
    FX: 'dmm-fx',
    STOCKS: 'moomoo-securities',
    CRYPTO: 'bitflyer',
};

const TICKER_MAP = {
    FX: { symbol: 'USD/JPY', ticker: 'USDJPY=X' },
    STOCKS: { symbol: 'S&P 500', ticker: '^GSPC' },
    CRYPTO: { symbol: 'BTC/USD', ticker: 'BTC-USD' },
};

function getJSTDateStr(dateOverride) {
    if (dateOverride && /^\d{4}-\d{2}-\d{2}$/.test(dateOverride)) return dateOverride;
    const jstDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
    const y = jstDate.getFullYear();
    const m = String(jstDate.getMonth() + 1).padStart(2, '0');
    const d = String(jstDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function decodeXmlEntities(s) {
    return s
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
        .trim();
}

function extractTitleFromXmlFragment(fragment) {
    const m = fragment.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (!m) return '';
    return decodeXmlEntities(m[1]).replace(/<[^>]+>/g, '');
}

function extractLinkFromXmlFragment(fragment) {
    // RSS <link>https://...</link>
    const linkMatch = fragment.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    if (linkMatch?.[1]) {
        const v = decodeXmlEntities(linkMatch[1]).trim();
        return v && v.startsWith('http') ? v : '';
    }
    // Atom <link href="https://..." rel="alternate" />
    const atomHrefMatch = fragment.match(/<link[^>]*href="([^"]+)"[^>]*>/i);
    if (atomHrefMatch?.[1]) {
        const v = atomHrefMatch[1].trim();
        return v && v.startsWith('http') ? v : '';
    }
    return '';
}

/**
 * RSS 2.0 item + Atom entry、HTMLタグ入りtitleに対応
 */
async function fetchRSS(url) {
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SynapseCapitalReportBot/1.0)' },
        });
        if (!res.ok) {
            console.warn(`⚠️ RSS fetch failed for ${url} (Status: ${res.status})`);
            return [];
        }
        const xml = await res.text();
        const news = [];

        const itemRe = /<item>([\s\S]*?)<\/item>/gi;
        let im;
        while ((im = itemRe.exec(xml)) !== null && news.length < 6) {
            const fragment = im[1];
            const t = extractTitleFromXmlFragment(fragment);
            const link = extractLinkFromXmlFragment(fragment);
            if (t && t.length > 2) news.push({ title: t, link });
        }

        if (news.length === 0) {
            const entryRe = /<entry>([\s\S]*?)<\/entry>/gi;
            let em;
            while ((em = entryRe.exec(xml)) !== null && news.length < 6) {
                const fragment = em[1];
                const t = extractTitleFromXmlFragment(fragment);
                const link = extractLinkFromXmlFragment(fragment);
                if (t && t.length > 2) news.push({ title: t, link });
            }
        }

        return news.slice(0, 5);
    } catch (e) {
        console.error(`❌ Failed to fetch RSS: ${url}`, e.message);
        return [];
    }
}

function parseMarketDataFromOutput(output) {
    if (!output || typeof output !== 'string') return null;
    const match = output.match(/MARKET_DATA_JSON:(.+)/);
    if (!match) return null;
    try {
        return JSON.parse(match[1].trim());
    } catch {
        return null;
    }
}

function generateChart(genre) {
    const config = TICKER_MAP[genre];
    const imagePath = `public/images/market-analysis-${genre.toLowerCase()}.png`;
    const title = config.symbol;

    console.log(`📊 Generating chart for ${genre} (${config.ticker})...`);
    try {
        const cmd = `python3 scripts/generate_chart.py "${config.ticker}" "${imagePath}" "${title}"`;
        const output = execSync(cmd, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
        const parsed = parseMarketDataFromOutput(output);
        if (parsed) return parsed;
    } catch (e) {
        const out = e.stdout != null ? String(e.stdout) : '';
        const parsed = parseMarketDataFromOutput(out);
        if (parsed) return parsed;
        console.error(`❌ Failed to generate chart for ${genre}:`, e.message);
    }
    return null;
}

/** AIが冒頭に ```markdown や ```yaml で囲む場合の除去（Jekyll/Hugo互換のためフェンス禁止） */
function stripLeadingCodeFenceAroundFrontmatter(md) {
    let s = md.trim();
    // Remove leading fences
    s = s.replace(/^```(?:markdown|md|yaml|yml)\s*\n/i, '');
    s = s.replace(/^```\s*\n/, '');
    
    // If it doesn't start with --- but looks like it should, inject it
    if (!s.startsWith('---') && s.includes('title:')) {
        s = '---\n' + s;
        // Find the end of the frontmatter (first blank line or ## header)
        const lines = s.split('\n');
        let endIdx = lines.findIndex((l, i) => i > 0 && (l.trim() === '' || l.startsWith('##')));
        if (endIdx !== -1) {
            lines.splice(endIdx, 0, '---');
            s = lines.join('\n');
        }
    }
    
    // Ensure no trailing fence remains at the top
    s = s.replace(/^([\s\S]*?)\n```\s*\n/m, '$1\n---\n');
    
    return s;
}

function buildArticlePrompt(genre, newsHeadlines, marketData, jstDateStr) {
    const broker = RECOMMENDED_BROKERS[genre];
    const symbol = TICKER_MAP[genre].symbol;
    const cp = marketData?.current_price != null ? parseFloat(marketData.current_price).toFixed(2) : null;
    const ma20 = marketData?.ma20 != null ? parseFloat(marketData.ma20).toFixed(2) : null;
    const rsi = marketData?.rsi != null ? parseFloat(marketData.rsi).toFixed(2) : null;
    const maComment =
        cp && ma20
            ? parseFloat(cp) > parseFloat(ma20)
                ? '終値が20日移動平均線を上回っており強気圏'
                : '終値が20日移動平均線を下回っており弱気圏'
            : '20日線との位置関係を価格データから判断すること';

    const headlinesBlock =
        newsHeadlines.length > 0
            ? newsHeadlines.map((t, i) => {
                const title = typeof t === 'string' ? t : t.title;
                return `${i + 1}. ${title}`;
            }).join('\n')
            : '（RSSからの取得は空でした。ファンダメンタルズはマクロ・センチメントの一般論に留め、不確実性を明記すること）';

    return `
以下の「最新ニュース見出し」と「API/チャート由来の数値」を必ず本文に反映し、日本語でマーケット分析レポートを完成させてください。

## 厳守ルール（AIインテリジェンス・ガイドライン）
- トーン: 機関投資家向け金融メディア。個人的感想・会話文・挨拶（「承知しました」等）は禁止。
- 呼称: 「検証隊」禁止。「本日のAI解析」「シナプス解析」を使用。
- Frontmatter: ファイル先頭に YAML をそのまま置く。**絶対に** Markdown のコードフェンス（\`\`\`）で囲まない。
- シグナルJSON: 記事の**末尾**にのみ \`\`\`json ... \`\`\` ブロックを1つ置く。pair, status(BUY|SELL|NEUTRAL), comment, entry, tp, sl, reliability を含む。
- prediction_direction（YAML）: **UP / DOWN / FLAT** のいずれか（シグナルの status とは別概念）。
- 価格: 利確・損切り・エントリーは**小数点第2位まで**明示（指数・為替に応じた桁）。
- ニュース: 下記見出しのうち**少なくとも3本**を、本文「市場環境とファンダメンタルズ」付近で箇条書きまたは短い引用として明示。

## 構成（見出しはこの文言を用いること）

## 1. 市場環境とファンダメンタルズ
- **キーワード**: \`#タグ\` 形式で3〜5個（例: \`#利上げ観測\`）
- **サマリー**: 2〜4文。重要語は HTML の <strong>タグ</strong> で強調。

## 2. AI多角分析（シナプス解析）
- **金利相関解析**: 具体的な数値・水準と相関の傾向を1〜2段落で。
- **オーダーブック解析**: 主要な価格帯の流動性・板厚の示唆（推定でもよいが推定と明記）。
- **センチメント解析**: 市場心理指数・ポジション観の評価。

## 3. テクニカル分析
- **参照データ（必ず本文で言及）**: 終値（現在価格） ${cp ?? '（データ未取得の場合は未取得と明記）'}、RSI(14) ${rsi ?? '---'}、20日移動平均 MA20 ${ma20 ?? '---'}。
- **MA20との関係**: ${maComment}
- **分析ポイント**: 箇条書きで2〜4点。上記の数値に根拠づけること。

## 4. プロ・トレーディング戦略
- **全体方針**: 1行で定義。
- **利確ターゲット**: 数値（小数点第2位まで）
- **損切りライン**: 数値（小数点第2位まで）

## 5. 結論とアクションプラン
- **結論サマリー**: 約150文字。挨拶なし。
- **Next Step**: 箇条書きで**3つ**（具体的な監視項目・水準・リスク管理）。

---

## 入力: 最新ニュース見出し（スクレイピング/RSS）
${headlinesBlock}

## 入力: チャート・テクニカル（yfinance 日足・直近バー）
- 現在価格（終値）: ${cp ?? '不明'}
- MA20: ${ma20 ?? '不明'}
- RSI(14): ${rsi ?? '不明'}
- チャート画像パス（YAML用）: /images/market-analysis-${genre.toLowerCase()}.png

---

## YAML Frontmatter テンプレート（この形でファイル**先頭**に配置、フェンス禁止）
---
title: "プロフェッショナルな日本語タイトル"
date: "${jstDateStr}"
genre: "${genre}"
target_pair: "${symbol}"
prediction_direction: "UP または DOWN または FLAT"
recommended_broker: "${broker}"
tldr_points: ["要点1", "要点2", "要点3"]
chart_image: "/images/market-analysis-${genre.toLowerCase()}.png"
excerpt: "120文字前後の要約（挨拶なし）"
---

## 末尾シグナル JSON テンプレート（記事の最後に1ブロックのみ）
\`\`\`json
{
  "pair": "${symbol}",
  "status": "BUY または SELL または NEUTRAL",
  "comment": "根拠（日本語・簡潔）",
  "entry": "0.00",
  "tp": "0.00",
  "sl": "0.00",
  "reliability": "HIGH または MEDIUM または LOW"
}
\`\`\`
`;
}

async function generateWithGemini(genre, newsHeadlines, marketData) {
    const jstDateStr = getJSTDateStr(TARGET_DATE_RAW);
    const systemInstruction = PERSONAS[genre];
    const userPrompt = buildArticlePrompt(genre, newsHeadlines, marketData, jstDateStr);

    let lastErr;
    for (const modelId of GEMINI_MODEL_CANDIDATES) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelId,
                systemInstruction,
            });
            console.log(`[${genre}] Generating with ${modelId}...`);
            const result = await model.generateContent(userPrompt);
            const text = result.response.text();
            if (text && text.length > 200) return text;
        } catch (e) {
            lastErr = e;
            console.warn(`[${genre}] ⚠️ Gemini ${modelId} failed: ${e.message}`);
        }
    }
    throw lastErr || new Error('All Gemini models failed');
}

const FREE_MODELS = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'google/gemma-3-27b-it:free',
    'nousresearch/hermes-3-llama-3.1-405b:free',
    'qwen/qwen3-coder:free',
    'mistralai/mistral-small-3.1-24b-instruct:free',
    'google/gemma-3-12b-it:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
    'liquid/lfm-2.5-1.2b-instruct:free',
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithOpenRouter(genre, newsHeadlines, marketData, modelId = FREE_MODELS[0]) {
    if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not set.');

    const isExplicitlyFree = modelId.endsWith(':free');
    const isGeminiFlash2 = modelId === 'google/gemini-2.0-flash-001';

    if (!isExplicitlyFree && !isGeminiFlash2) {
        console.error(`⚠️ SECURITY ALERT: Blocking non-free model call: ${modelId}`);
        throw new Error(`Permission Denied: Model ${modelId} is not verified as FREE.`);
    }

    const jstDateStr = getJSTDateStr(TARGET_DATE_RAW);
    const userPrompt = buildArticlePrompt(genre, newsHeadlines, marketData, jstDateStr);

    console.log(`[${genre}] OpenRouter fallback (${modelId})...`);

    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://synapsecapital.net',
                    'X-Title': 'Synapse Capital'
                },
                body: JSON.stringify({
                    model: modelId,
                    messages: [
                        { role: 'system', content: PERSONAS[genre] },
                        { role: 'user', content: userPrompt },
                    ],
                }),
            });

            if (response.status === 429) {
                console.warn(`[${genre}] ⏳ Rate limited (429) on ${modelId}. Attempt ${attempt}/3. Waiting...`);
                await sleep(2000 * attempt); // Exponential backoff
                continue;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            if (data.error) {
                if (data.error.code === 429) {
                    console.warn(`[${genre}] ⏳ Business rate limited (429) on ${modelId}. Attempt ${attempt}/3.`);
                    await sleep(2000 * attempt);
                    continue;
                }
                throw new Error(`OpenRouter API Business Error: ${JSON.stringify(data.error)}`);
            }

            return data.choices[0]?.message?.content;

        } catch (e) {
            lastError = e;
            console.warn(`[${genre}] ⚠️ Attempt ${attempt} failed for ${modelId}: ${e.message}`);
            if (attempt < 3) await sleep(1000);
        }
    }

    throw lastError || new Error(`Failed to generate with ${modelId} after 3 attempts`);
}

/**
 * Frontmatter + シグナルJSON をマージして SignalCard / ランディング用オブジェクトにする
 */
function buildMergedSignalForGenre(genre, markdown, marketData) {
    const prepared = stripLeadingCodeFenceAroundFrontmatter(markdown);
    let fm = {};
    try {
        fm = matter(prepared).data || {};
    } catch (e) {
        console.warn(`[${genre}] gray-matter parse failed:`, e.message);
    }

    let signal = {};
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/gi;
    let m;
    while ((m = jsonRegex.exec(markdown)) !== null) {
        try {
            signal = JSON.parse(m[1].trim());
        } catch {
            /* keep previous */
        }
    }

    const defaultPair = TICKER_MAP[genre].symbol;
    const pair = signal.pair || fm.target_pair || defaultPair;
    const chartPath = `/images/market-analysis-${genre.toLowerCase()}.png`;

    return {
        title: fm.title || `${defaultPair} 市場分析`,
        date: fm.date || getJSTDateStr(TARGET_DATE_RAW),
        genre: fm.genre || genre,
        target_pair: fm.target_pair || pair,
        prediction_direction: fm.prediction_direction || 'FLAT',
        recommended_broker: fm.recommended_broker || RECOMMENDED_BROKERS[genre],
        tldr_points: Array.isArray(fm.tldr_points) ? fm.tldr_points : [],
        chart_image: fm.chart_image || chartPath,
        excerpt: (fm.excerpt || '').trim(),
        pair,
        status: (signal.status || 'NEUTRAL').toUpperCase(),
        comment: (signal.comment || fm.excerpt || 'シナプス解析に基づくシグナル').trim(),
        entry: signal.entry != null && signal.entry !== '' ? String(signal.entry) : '---',
        tp: signal.tp != null && signal.tp !== '' ? String(signal.tp) : '---',
        sl: signal.sl != null && signal.sl !== '' ? String(signal.sl) : '---',
        reliability: (signal.reliability || 'MEDIUM').toUpperCase(),
    };
}

function extractIndexEntry(markdown, genre, dateStr) {
    const prepared = stripLeadingCodeFenceAroundFrontmatter(markdown);
    try {
        const { data } = matter(prepared);
        return {
            id: `${dateStr}-${genre.toLowerCase()}`,
            date: dateStr,
            title: data.title || `${genre} Analysis`,
            genre,
            target_pair: data.target_pair || TICKER_MAP[genre].symbol,
            result: 'PENDING',
        };
    } catch {
        const titleMatch = markdown.match(/title:\s*["']([^"']+)["']/);
        const pairMatch = markdown.match(/target_pair:\s*["']([^"']+)["']/);
        return {
            id: `${dateStr}-${genre.toLowerCase()}`,
            date: dateStr,
            title: titleMatch ? titleMatch[1] : `${genre} Analysis`,
            genre,
            target_pair: pairMatch ? pairMatch[1] : TICKER_MAP[genre].symbol,
            result: 'PENDING',
        };
    }
}

function rebuildReportsIndexFromReportsDir() {
    const indexPath = './content/reports-index.json';

    let existing = [];
    if (fs.existsSync(indexPath)) {
        try {
            existing = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        } catch {
            existing = [];
        }
    }
    const existingById = new Map((existing || []).map((x) => [x.id, x]));

    const mdFiles = fs.readdirSync(REPORTS_DIR).filter((f) => f.endsWith('.md'));
    const entries = mdFiles.map((file) => {
        const id = file.replace(/\.md$/i, '');
        const raw = fs.readFileSync(path.join(REPORTS_DIR, file), 'utf8');
        const cleaned = stripLeadingCodeFenceAroundFrontmatter(raw);

        let data = {};
        try {
            data = matter(cleaned).data || {};
        } catch {
            data = {};
        }

        const dateFromFile = String(file.match(/^(\d{4}-\d{2}-\d{2})-/)?.[1] || data.date || '');
        const genreFromFile = String(file.match(/-(fx|stocks|crypto)\.md$/i)?.[1] || data.genre || '').toUpperCase();
        const genre = String(data.genre || genreFromFile || 'FX').trim();

        return {
            id,
            date: String(data.date || dateFromFile || '').trim(),
            title: String(data.title || `${genre} Analysis`).trim(),
            genre,
            target_pair: String(data.target_pair || '').trim(),
            prediction_direction: String(data.prediction_direction || 'FLAT').trim(),
            recommended_broker: String(data.recommended_broker || '').trim(),
            excerpt: String(data.excerpt || '').trim(),
            result: String(existingById.get(id)?.result || 'PENDING').trim(),
        };
    });

    entries.sort((a, b) => (a.date < b.date ? 1 : -1));
    fs.writeFileSync(indexPath, JSON.stringify(entries, null, 2));
    console.log(`✅ Rebuilt reports-index.json (${entries.length} entries)`);
}

function fmt2(n) {
    if (n === null || n === undefined) return null;
    const x = typeof n === 'number' ? n : parseFloat(String(n));
    if (!Number.isFinite(x)) return null;
    return x.toFixed(2);
}

function decideSignal(marketData) {
    const cp = marketData?.current_price;
    const ma20 = marketData?.ma20;
    const rsi = marketData?.rsi;
    if (cp == null || ma20 == null || rsi == null) {
        return { status: 'NEUTRAL', prediction_direction: 'FLAT' };
    }

    // Macro/Equity/Crypto 共通の保守的判定（値の意味を壊さない範囲で）
    if (cp > ma20 && rsi >= 55) return { status: 'BUY', prediction_direction: 'UP' };
    if (cp < ma20 && rsi <= 45) return { status: 'SELL', prediction_direction: 'DOWN' };
    return { status: 'NEUTRAL', prediction_direction: 'FLAT' };
}

async function fetchCryptoFearGreed() {
    // alternative.me: Fear & Greed Index (no API key)
    try {
        const res = await fetch('https://api.alternative.me/fng/?limit=1');
        const data = await res.json();
        const row = data?.data?.[0];
        if (!row) return null;
        return {
            score: parseInt(row.value, 10),
            label: row.value_classification,
            updated: new Date(parseInt(row.timestamp, 10) * 1000).toISOString(),
        };
    } catch {
        return null;
    }
}

async function generateDeterministicReport(genre, newsHeadlines, marketData, jstDateStr) {
    const broker = RECOMMENDED_BROKERS[genre];
    const symbol = TICKER_MAP[genre].symbol;

    const cpNum = marketData?.current_price;
    const ma20Num = marketData?.ma20;
    const rsiNum = marketData?.rsi;
    const interestCorr = marketData?.interest_corr;
    const vix = marketData?.vix;
    const bbUpper = marketData?.bb_upper;
    const bbLower = marketData?.bb_lower;
    const recentHigh = marketData?.recent_high_20;
    const recentLow = marketData?.recent_low_20;

    const cp = fmt2(cpNum);
    const ma20 = fmt2(ma20Num);
    const rsi = fmt2(rsiNum);
    const corr = interestCorr == null ? null : Number(interestCorr);
    const corrStr = corr == null ? '0.00' : corr.toFixed(2);

    const { status, prediction_direction } = decideSignal(marketData);

    // Entry/TP/SL: ensure 2 decimals and basic inequality consistency.
    const entryBase = cpNum != null ? Number(cpNum) : null;
    let entry = entryBase != null ? entryBase : 0;
    let tp = null;
    let sl = null;

    const recentHighNum = recentHigh != null ? Number(recentHigh) : null;
    const recentLowNum = recentLow != null ? Number(recentLow) : null;
    const bbUpperNum = bbUpper != null ? Number(bbUpper) : null;
    const bbLowerNum = bbLower != null ? Number(bbLower) : null;

    if (status === 'BUY') {
        tp = recentHighNum ?? bbUpperNum ?? (entry * 1.01);
        sl = recentLowNum ?? bbLowerNum ?? (entry * 0.99);
        if (tp <= entry) tp = entry * 1.01;
        if (sl >= entry) sl = entry * 0.99;
    } else if (status === 'SELL') {
        tp = recentLowNum ?? bbLowerNum ?? (entry * 0.99);
        sl = recentHighNum ?? bbUpperNum ?? (entry * 1.01);
        if (tp >= entry) tp = entry * 0.99;
        if (sl <= entry) sl = entry * 1.01;
    } else {
        tp = bbUpperNum ?? recentHighNum ?? (entry * 1.01);
        sl = bbLowerNum ?? recentLowNum ?? (entry * 0.99);
        if (tp <= entry) tp = entry * 1.01;
        if (sl >= entry) sl = entry * 0.99;
    }

    const entryStr = fmt2(entry);
    const tpStr = fmt2(tp);
    const slStr = fmt2(sl);

    const relScore =
        cp != null && ma20 != null && rsi != null && corr != null ? 'HIGH' : 'MEDIUM';

    // Keywords (3-5 tags)
    const keywordsByGenre = {
        FX: status === 'BUY'
            ? ['#金利差', '#リスクオン', '#ドル買い', '#流動性']
            : status === 'SELL'
                ? ['#円高圧力', '#金利差縮小', '#リスクオフ', '#ボラティリティ']
                : ['#レンジ', '#金利観測', '#流動性', '#不確実性'],
        STOCKS: status === 'BUY'
            ? ['#利回り低下', '#リスクオン', '#セクターローテ', '#流動性']
            : status === 'SELL'
                ? ['#利回り上昇', '#リスクオフ', '#ディフェンシブ', '#ボラティリティ']
                : ['#中立', '#金利観測', '#需給', '#警戒'],
        CRYPTO: status === 'BUY'
            ? ['#BitcoinETF', '#流動性回復', '#トレンド継続', '#オンチェーン']
            : status === 'SELL'
                ? ['#ボラティリティ上昇', '#リスクオフ', '#需給悪化', '#規制警戒']
                : ['#レンジ', '#ポジション調整', '#流動性', '#警戒'],
    };
    const keywords = keywordsByGenre[genre].slice(0, 5).join(' ');

    // Sentiment (FX/Stocks: VIX proxy, Crypto: Fear & Greed if available)
    let sentimentText = '';
    if (genre === 'CRYPTO') {
        const fng = await fetchCryptoFearGreed();
        if (fng?.score != null) {
            sentimentText = `恐怖・強欲指数（F&G）: ${fng.score}（${fng.label}）。極端な偏りはリバーサル余地として評価する。`;
        } else {
            sentimentText = `恐怖・強欲指数: 算出できず。代替としてRSIと直近レンジの需給を通じて心理を評価する。`;
        }
    } else {
        const vixNum = vix != null ? Number(vix) : null;
        if (vixNum != null) {
            const bucket = vixNum >= 25 ? '恐怖' : vixNum <= 18 ? '安心' : '中立';
            sentimentText = `VIX相当のリスク心理: ${vixNum.toFixed(2)}（${bucket}）。`;
        } else {
            sentimentText = 'VIX相当のリスク心理: 算出できず。代替としてRSIの位置づけを心理指標として扱う。';
        }
    }

    const newsBlockLines = newsHeadlines.slice(0, 5).map((n) => {
        const title = typeof n === 'string' ? n : n.title;
        const link = typeof n === 'string' ? '' : n.link;
        if (link) return `* [${title}](${link})`;
        return `* ${title}`;
    }).join('\n');

    // Order book / liquidity zones
    const bbU = bbUpper != null ? fmt2(bbUpper) : null;
    const bbL = bbLower != null ? fmt2(bbLower) : null;
    const hi20 = recentHigh != null ? fmt2(recentHigh) : null;
    const lo20 = recentLow != null ? fmt2(recentLow) : null;

    const liquidityLine = (() => {
        const parts = [];
        if (bbU) parts.push(`上限帯 ${bbU}`);
        if (bbL) parts.push(`下限帯 ${bbL}`);
        if (hi20) parts.push(`直近高値 ${hi20}`);
        if (lo20) parts.push(`直近安値 ${lo20}`);
        return parts.join(' / ');
    })();

    // Titles / TLDR (Japanese, professional)
    const title =
        status === 'BUY'
            ? `${symbol}：本日のAI解析が示す上昇シナリオとリスク管理`
            : status === 'SELL'
                ? `${symbol}：本日のAI解析が示す下落シナリオと防御策`
                : `${symbol}：本日のAI解析が示すレンジ警戒と実行戦略`;

    const tldr_points = [
        `金利相関（近似）: ${corrStr}で${corr != null && corr >= 0 ? '正相関' : '負相関'}傾向`,
        `テクニカル: 現在価格 ${cp ?? '---'} と MA20 ${ma20 ?? '---'} の位置関係が主導`,
        `需給: ${liquidityLine || '重要帯の確認が必要'} によるターゲット設計`,
    ];

    const excerpt = `本日のAI解析では、${symbol}の現在価格 ${cp ?? '不明'}、RSI(${rsi ?? '---'})、MA20(${ma20 ?? '---'})を軸に、金利相関と需給帯から実行プランを整理する。`;

    const maRel =
        cp && ma20
            ? (Number(cp) > Number(ma20) ? '強気圏' : '弱気圏')
            : '位置関係は未取得';

    const conclusion =
        status === 'BUY'
            ? `本日のAI解析では、金利相関の方向性とテクニカルの整合性が確認され、押し目買いを優先する。上値は主要帯で利確し、損切りは直近の下支えを基準に厳格運用する。`
            : status === 'SELL'
                ? `本日のAI解析では、金利相関の方向性とテクニカルの整合性が下方向に傾き、防御的な売り戦略が妥当となる。反転リスクを想定し、損切りは直近の上支え基準で即時執行する。`
                : `本日のAI解析では、トレンド優位が限定的でレンジ警戒が合理的となる。金利相関と需給帯のブレイク条件を待ち、エントリーは選別してリスク上限を最優先する。`;

    const nextSteps = (() => {
        const steps = [];
        if (status === 'BUY') {
            if (slStr) steps.push(`損切り帯（SL ${slStr}）を維持できるか監視。`);
            if (tpStr) steps.push(`利確ターゲット（TP ${tpStr}）到達時は段階的に収益確定。`);
            if (hi20) steps.push(`直近高値 ${hi20} の上抜け可否を判断材料にする。`);
        } else if (status === 'SELL') {
            if (slStr) steps.push(`上値の防御ライン（SL ${slStr}）を超えないか監視。`);
            if (tpStr) steps.push(`利確ターゲット（TP ${tpStr}）到達時は迅速にポジション調整。`);
            if (lo20) steps.push(`直近安値 ${lo20} 近辺の反応を確認。`);
        } else {
            if (tpStr) steps.push(`ブレイク方向を確認（TP ${tpStr} / SL ${slStr} のどちら側か）。`);
            if (rsi) steps.push(`RSI(14)が ${rsi} から明確に乖離するかを追跡。`);
            if (ma20) steps.push(`MA20（${ma20}）を跨ぐ終値の有無で次の判断を行う。`);
        }
        // Ensure exactly 3
        return steps.slice(0, 3);
    })();

    // Safety: NextSteps fallback
    const nextSteps3 = nextSteps.length === 3 ? nextSteps : [
        `主要帯（${tpStr ?? 'TP'}, ${slStr ?? 'SL'}）の反応を確認。`,
        `RSIとMA20の位置関係を日次で再評価。`,
        `金利相関の変化（相関係数 ${corrStr}）をモニタリング。`,
    ];

    const jsonBlock = `\`\`\`json\n{\n  "pair": "${symbol}",\n  "status": "${status}",\n  "comment": "本日のAI解析（シナプス解析）: 金利相関 ${corrStr} とテクニカルの整合性に基づく戦略設計。",\n  "entry": "${entryStr ?? '0.00'}",\n  "tp": "${tpStr ?? '0.00'}",\n  "sl": "${slStr ?? '0.00'}",\n  "reliability": "${relScore === 'HIGH' ? 'HIGH' : 'MEDIUM'}"\n}\n\`\`\``;

    // Compose markdown following the required section order.
    return `---\n` +
        `title: "${title}"\n` +
        `date: "${jstDateStr}"\n` +
        `genre: "${genre}"\n` +
        `target_pair: "${symbol}"\n` +
        `prediction_direction: "${prediction_direction}"\n` +
        `recommended_broker: "${broker}"\n` +
        `tldr_points: ["${tldr_points[0]}", "${tldr_points[1]}", "${tldr_points[2]}"]\n` +
        `chart_image: "/images/market-analysis-${genre.toLowerCase()}.png"\n` +
        `excerpt: "${excerpt}"\n` +
        `---\n\n` +
        `## 1. 市場環境とファンダメンタルズ\n` +
        `- **キーワード**: ${keywords}\n` +
        `- **サマリー**: <strong>本日のAI解析</strong>では、${symbol}の需給が主要移動平均（MA20）と整合しており、<strong>${status === 'BUY' ? '上方向の優位' : status === 'SELL' ? '下方向の優位' : '方向性の限定'}</strong>を示す。加えて<strong>金利相関</strong>の変化が、トレンドの継続可否を規定する。\n\n` +
        `* 最新ニュース見出し\n` +
        `${newsBlockLines}\n\n` +
        `## 2. AI多角分析（シナプス解析）\n` +
        `- **金利相関解析**: 金利（US10Y proxy）と${symbol}の近似相関は相関係数${corrStr}で、${corr != null && corr >= 0 ? '正の方向' : '負の方向'}が観測される。これは<strong>金利の方向</strong>が価格の優先ドライバーになりやすいことを意味する。\n` +
        `- **オーダーブック解析**: ${liquidityLine || '主要帯の観測'}が、短期の流動性集約点として機能する可能性が高い。特に${status === 'BUY' ? '上限帯での利確' : status === 'SELL' ? '下限帯での利確' : 'ブレイク前の押し引き'}を想定する。\n` +
        `- **センチメント解析**: ${sentimentText} そのため<strong>過熱と反転</strong>の双方を前提に、損切りを早めに設定するのが合理的となる。\n\n` +
        `## 3. テクニカル分析\n` +
        `- **参照データ**: 終値（現在価格） ${cp ?? '---'}、RSI(14) ${rsi ?? '---'}、20日移動平均 MA20 ${ma20 ?? '---'}。\n` +
        `- **MA20との関係**: 終値は${maRel}に位置する。\n` +
        `**分析ポイント**:\n` +
        `* ${cp ?? '---'}がMA20 ${ma20 ?? '---'}を維持し続ける限り、優位側のシナリオが優先される。\n` +
        `* RSI(14) ${rsi ?? '---'}がレンジを抜けるタイミングは、需給帯（BB/直近高安）への再評価を促す。\n` +
        `* ${status === 'BUY' ? (tpStr ? `利確ターゲット TP ${tpStr} 近辺で収益確定を検討。` : '上限帯への接近で利確を検討。') : status === 'SELL' ? (tpStr ? `利確ターゲット TP ${tpStr} 近辺で反応を確認。` : '下限帯への接近で利確を検討。') : `TP ${tpStr ?? '---'} と SL ${slStr ?? '---'} のどちら側にブレイクするかを観測。`}\n\n` +
        `## 4. プロ・トレーディング戦略\n` +
        `- **全体方針**: ${status === 'NEUTRAL' ? 'レンジのブレイク待ちと選別エントリー' : status === 'BUY' ? '押し目での優位側エントリーを優先' : '反転待ちではなく下方向を先行する防御的売り'}。\n` +
        `- **利確ターゲット**: ${tpStr ?? '0.00'}\n` +
        `- **損切りライン**: ${slStr ?? '0.00'}\n\n` +
        `## 5. 結論とアクションプラン\n` +
        `- **結論サマリー**: ${conclusion}\n` +
        `- **Next Step**:\n` +
        `${nextSteps3.map((s) => `  * ${s}`).join('\n')}\n\n` +
        `${jsonBlock}\n`;
}

async function main() {
    const deterministicOnly = !GEMINI_API_KEY && !OPENROUTER_API_KEY;

    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

    for (const genre of Object.keys(TICKER_MAP)) {
        console.log(`--- Processing genre: ${genre} ---`);

        const feeds = RSS_FEEDS.filter((f) => f.type === genre);
        let allNews = [];
        for (const f of feeds) {
            const news = await fetchRSS(f.url);
            allNews = allNews.concat(news);
        }

        // Deduplicate by title
        allNews = [...new Map(allNews.map((n) => [n.title, n])).values()].slice(0, 8);

        if (allNews.length === 0) {
            console.log(`[${genre}] ⚠️ No news found. Using neutral placeholders.`);
            allNews = [
                { title: '主要中央銀行の政策正常化観測が市場ボラティリティを左右', link: '' },
                { title: '地政学・サプライチェーンがリスクプレミアムに影響', link: '' },
                { title: '実質金利とドル動向がクロスアセットに波及', link: '' },
            ];
        }

        const newsForPrompt = allNews.slice(0, 5);

        try {
            const marketData = generateChart(genre);
            const dateStr = getJSTDateStr(TARGET_DATE_RAW);
            const filePath = path.join(REPORTS_DIR, `${dateStr}-${genre.toLowerCase()}.md`);

            console.log(`[${genre}] 🚀 Starting generation for ${dateStr}...`);

            let markdown;
            if (deterministicOnly) {
                markdown = await generateDeterministicReport(genre, newsForPrompt, marketData, dateStr);
            } else {
                if (GEMINI_API_KEY && GEMINI_API_KEY !== 'dummy_key') {
                    try {
                        markdown = await generateWithGemini(genre, newsForPrompt, marketData);
                    } catch (e) {
                        console.warn(`[${genre}] ⚠️ Gemini generation failed: ${e.message}`);
                    }
                }

                if (!markdown && OPENROUTER_API_KEY) {
                    console.log(`[${genre}] Trying OpenRouter fallback chain...`);
                    for (const mId of FREE_MODELS) {
                        try {
                            markdown = await generateWithOpenRouter(genre, newsForPrompt, marketData, mId);
                            if (markdown) {
                                console.log(`[${genre}] ✅ Fallback successful with ${mId}`);
                                break;
                            }
                        } catch (e2) {
                            console.error(`[${genre}] ❌ OpenRouter ${mId}: ${e2.message}`);
                        }
                    }
                }
            }

            if (!markdown) {
                console.warn(`[${genre}] ⚠️ All AI generation failed. Using emergency template.`);
                const symbol = TICKER_MAP[genre].symbol;
                const cp = marketData?.current_price != null ? parseFloat(marketData.current_price).toFixed(2) : '---';
                markdown = `---
title: "${genre} 市場状況アップデート"
date: "${dateStr}"
genre: "${genre}"
target_pair: "${symbol}"
prediction_direction: "FLAT"
recommended_broker: "${RECOMMENDED_BROKERS[genre]}"
tldr_points: ["AI生成パイプライン一時停止", "公開テクニカル: 終値 ${cp}", "リスク管理の優先"]
chart_image: "/images/market-analysis-${genre.toLowerCase()}.png"
excerpt: "シナプス解析データの自動生成に遅延が発生しています。公開指標のみ参照し、慎重な判断を推奨します。"
---

## 1. 市場環境とファンダメンタルズ
- **キーワード**: \`#ボラティリティ\` \`#流動性\` \`#マクロ\`
- **サマリー**: <strong>自動生成システム</strong>が一時的に完全な解析を返せない状態です。ニュースフローは各情報源で直接確認してください。

## 2. AI多角分析（シナプス解析）
- **金利相関解析**: データ不足のため記述を省略。政策金利・実質金利の方向をモニタリングしてください。
- **オーダーブック解析**: 板情報は取引所・ブローカー画面で確認してください。
- **センチメント解析**: 極度の楽観・悲観は反転リスクとして扱うべきです。

## 3. テクニカル分析
- **参照データ**: 終値 ${cp}、RSI(14) ${marketData?.rsi != null ? parseFloat(marketData.rsi).toFixed(2) : '---'}、MA20 ${marketData?.ma20 != null ? parseFloat(marketData.ma20).toFixed(2) : '---'}
- **分析ポイント**: 主要移動平均との位置関係を確認 / 直近高値・安値のブレイク可否を監視

## 4. プロ・トレーディング戦略
- **全体方針**: 新規エントリーは控えめにし、既存ポジションのリスク上限を優先する。
- **利確ターゲット**: 0.00
- **損切りライン**: 0.00

## 5. 結論とアクションプラン
- **結論サマリー**: 本日のAI解析はシステム制約により完全版を提供できません。数値はツール出力を優先し、ファンダとテクニカルの両面で独自検証してください。
- **Next Step**:
- 経済カレンダー上の重要イベントを確認する
- 想定シナリオ別の損益分岐を整理する
- ポジションサイズをボラティリティに合わせて再評価する

\`\`\`json
{
  "pair": "${symbol}",
  "status": "NEUTRAL",
  "comment": "自動生成フォールバック",
  "entry": "${cp}",
  "tp": "${cp}",
  "sl": "${cp}",
  "reliability": "LOW"
}
\`\`\``;
            }

            markdown = stripLeadingCodeFenceAroundFrontmatter(markdown);

            fs.writeFileSync(filePath, markdown);
            console.log(`✅ Saved: ${filePath}`);

            const indexPath = './content/reports-index.json';
            let index = [];
            if (fs.existsSync(indexPath)) {
                try {
                    index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
                } catch {
                    index = [];
                }
            }

            const newEntry = extractIndexEntry(markdown, genre, dateStr);
            const existingIdx = index.findIndex((item) => item.id === newEntry.id);
            if (existingIdx !== -1) index[existingIdx] = { ...index[existingIdx], ...newEntry };
            else index.unshift(newEntry);
            if (index.length > 100) index = index.slice(0, 100);
            fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
            console.log(`✅ Updated reports-index.json`);

            const sigPath = './content/latest-signals.json';
            let sigs = {};
            if (fs.existsSync(sigPath)) {
                try {
                    sigs = JSON.parse(fs.readFileSync(sigPath, 'utf8'));
                } catch {
                    sigs = {};
                }
            }
            sigs[genre] = buildMergedSignalForGenre(genre, markdown, marketData);
            fs.writeFileSync(sigPath, JSON.stringify(sigs, null, 2));
            console.log(`✅ Updated latest-signals.json (${genre})`);
        } catch (e) {
            console.error(`❌ Failed ${genre}:`, e.message);
        }
    }

    // Index should be derived from the existing markdown files,
    // so older articles never “disappear” due to partial/failed runs.
    rebuildReportsIndexFromReportsDir();
}

main();
