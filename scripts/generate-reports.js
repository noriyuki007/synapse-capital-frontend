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
const REBUILD_ONLY = process.argv.includes('--rebuild-only');

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
    ja: {
        FX: 'dmm-fx',
        STOCKS: '',
        CRYPTO: 'bitflyer',
    },
    en: {
        FX: 'xm-trading',
        STOCKS: '',
        CRYPTO: 'bybit',
    }
};

const TICKER_MAP = {
    FX: { symbol: 'USD/JPY', ticker: 'USDJPY=X' },
    STOCKS: { symbol: 'S&P 500', ticker: '^GSPC' },
    CRYPTO: { symbol: 'BTC/USD', ticker: 'BTC-USD' },
};

function getJSTDateStr(dateOverride, includeTime = false) {
    const jstNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
    const y = jstNow.getFullYear();
    const m = String(jstNow.getMonth() + 1).padStart(2, '0');
    const d = String(jstNow.getDate()).padStart(2, '0');
    const hh = String(jstNow.getHours()).padStart(2, '0');
    const mm = String(jstNow.getMinutes()).padStart(2, '0');
    
    const baseDate = (dateOverride && /^\d{4}-\d{2}-\d{2}$/.test(dateOverride)) ? dateOverride : `${y}-${m}-${d}`;
    if (!includeTime) return baseDate;
    
    // If override is today, use current time, else use 00:00
    const isToday = baseDate === `${y}-${m}-${d}`;
    return `${baseDate} ${isToday ? hh : '00'}:${isToday ? mm : '00'}`;
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

function buildArticlePrompt(genre, newsHeadlines, marketData, jstDateStr, locale = 'ja') {
    const symbol = TICKER_MAP[genre].symbol;
    const isCrypto = genre === 'CRYPTO';
    const broker = RECOMMENDED_BROKERS[locale] ? RECOMMENDED_BROKERS[locale][genre] : RECOMMENDED_BROKERS.ja[genre];

    const cp = marketData?.current_price ?? (locale === 'ja' ? '不明' : 'Unknown');
    const ma20 = marketData?.ma20 ?? (locale === 'ja' ? '不明' : 'Unknown');
    const rsi = marketData?.rsi_14 ?? (locale === 'ja' ? '不明' : 'Unknown');

    const headlinesBlock = newsHeadlines.map(n => `- ${n.title}`).join('\n');

    if (locale === 'en') {
        return `You are a top-tier financial analyst. Write a tactical market report for ${symbol} based on the data below.

---
## Style & Tone
- Extremely professional, institutional tone (like Goldman Sachs/Bloomberg Terminal).
- No fluff, no introductory pleasantries, highly actionable.
- Focus strictly on technical levels and fundamental catalysts.
- Respond in ENGLISH only.
- Output MUST be **Markdown ONLY**, starting with the YAML Frontmatter.

---
## Output Structure
1. **YAML Frontmatter** (MUST be at the very top, no code fences before it)
   - **title**: Create a high-impact, professional, and SEO-friendly title that hooks the reader (e.g., "Countdown to 160? AI Analytics Identifies Target for USD/JPY Breakout" instead of a generic header).
2. **Executive Summary** (1 short paragraph)
3. **Technical Framework** (Price action vs MA20, RSI momentum)
4. **Professional Trading Strategy** (Directional bias, TP, SL)
5. **JSON Signal Block** (MUST be the final element, exactly as requested)

---
## Required Affiliate Link
Integrate the following recommended broker seamlessly into your strategy section or conclusion:
Broker: ${broker}
Integration Example: "For executing this specific setup, we recommend utilizing [${broker}] due to optimal liquidity."

---
## Input: Latest News (RSS/Scraping)
${headlinesBlock}

## Input: Chart/Technical Data
- Current Price: ${cp}
- MA20: ${ma20}
- RSI(14): ${rsi}
- Chart Image Path (for YAML): /images/market-analysis-${genre.toLowerCase()}.png

---
## YAML Frontmatter Template (Place at the START, no code fences)
---
title: "${genre}: Institutional Market Intelligence"
date: "${jstDateStr}"
genre: "${genre}"
target_pair: "${symbol}"
prediction_direction: "UP or DOWN or FLAT"
recommended_broker: "${broker}"
tldr_points: ["Key point 1", "Key point 2", "Key point 3"]
chart_image: "/images/market-analysis-${genre.toLowerCase()}.png"
excerpt: "120 character summary (no greetings)"
---

## Technical Framework & Strategy
... (Your analysis here) ...

## Final Signal JSON Template (1 block at the very end of the article)
\`\`\`json
{
  "pair": "${symbol}",
  "status": "BUY or SELL or NEUTRAL",
  "comment": "1 sentence brief rationale in English",
  "entry": "0.00",
  "tp": "0.00",
  "sl": "0.00",
  "reliability": "HIGH or MEDIUM or LOW"
}
\`\`\`
`;
    } else {
        return `あなたはヘッジファンドのチーフアナリストです。以下のデータに基づき、${symbol} の超実践的・戦術的なマーケットレポートを作成してください。

---
## トーン＆マナー
- 機関投資家向け（野村證券やブルームバーグ端末）のプロフェッショナルで冷徹なトーン。
- 「こんにちは」「いかがでしょうか」等の挨拶や無駄な装飾は一切排除。
- 結論ファースト、具体的かつアクション可能（Actionable）な内容に。
- 出力は **Markdown のみ**。YAML Frontmatterから開始してください。

---
## 記事の構成
1. **YAML Frontmatter**（必ず文頭。フェンス不要）
   - **title**: 読者の目を引き、SEOを意識したプロフェッショナルなタイトルを作成してください（例：「160円突破は秒読みか？AI需給解析が導き出した円安・ドル高の『到達点』」など、具体的でフックのある表現）。
2. **エグゼクティブサマリー**（1段落で市場のコアテーマを要約）
3. **テクニカル・フレームワーク**（MA20、RSIとの位置関係による力学解析）
4. **プロフェッショナルトレーディング戦略**（バイアス、TP、SLの具体的数値化）
5. **JSON シグナルブロック**（必ず記事の末尾に1ブロックのみ）

---
## アフィリエイト（指定ブローカー）への誘導
記事の戦略部分または結論において、必ず以下のブローカーへの自然な誘導を含めてください。
指定ブローカー: ${broker}
誘導例: 「本戦略の実行にあたっては、流動性の観点から[${broker}]の利用を推奨する。」

---
## Input: 最新ニュース (RSS/Scraping)
${headlinesBlock}

## Input: チャート・テクニカルデータ
- 現在価格: ${cp}
- MA20: ${ma20}
- RSI(14): ${rsi}
- 指定画像パス: /images/market-analysis-${genre.toLowerCase()}.png

---
## YAML Frontmatter テンプレート（この形でファイル先頭に配置、フェンス禁止）
---
title: "${genre}：最新マーケット分析インテリジェンス"
date: "${jstDateStr}"
genre: "${genre}"
target_pair: "${symbol}"
prediction_direction: "UP または DOWN または FLAT"
recommended_broker: "${broker}"
tldr_points: ["要点1", "要点2", "要点3"]
chart_image: "/images/market-analysis-${genre.toLowerCase()}.png"
excerpt: "120文字前後の要約（挨拶なし）"
---

## テクニカル・フレームワークと戦略
... (本文) ...

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
}

async function generateWithGemini(genre, newsHeadlines, marketData, jstDateStr, locale = 'ja') {
    const systemInstruction = PERSONAS[genre];
    const userPrompt = buildArticlePrompt(genre, newsHeadlines, marketData, jstDateStr, locale);

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
    'minimax/minimax-m2.5:free',
    'stepfun/step-3.5-flash:free',
    'arcee-ai/trinity-large-preview:free',
    'google/gemma-3-27b-it:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen3-coder:free',
    'mistralai/mistral-small-3.1-24b-instruct:free',
    'google/gemma-3-12b-it:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
    'liquid/lfm-2.5-1.2b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free',
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithOpenRouter(genre, newsHeadlines, marketData, modelId = FREE_MODELS[0], jstDateStr, locale = 'ja') {
    if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not set.');

    const isExplicitlyFree = modelId.endsWith(':free');
    const isGeminiFlash2 = modelId === 'google/gemini-2.0-flash-001';

    if (!isExplicitlyFree && !isGeminiFlash2) {
        console.error(`⚠️ SECURITY ALERT: Blocking non-free model call: ${modelId}`);
        throw new Error(`Permission Denied: Model ${modelId} is not verified as FREE.`);
    }

    const userPrompt = buildArticlePrompt(genre, newsHeadlines, marketData, jstDateStr, locale);

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
function buildMergedSignalForGenre(genre, markdown, marketData, locale = 'ja') {
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
        recommended_broker: fm.recommended_broker || (RECOMMENDED_BROKERS[locale] || RECOMMENDED_BROKERS.ja)[genre],
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
            date: data.date ? String(data.date) : dateStr,
            title: (data.title || `${genre} Analysis`).trim(),
            genre,
            target_pair: data.target_pair || TICKER_MAP[genre].symbol,
            prediction_direction: data.prediction_direction || 'FLAT',
            recommended_broker: data.recommended_broker || RECOMMENDED_BROKERS[genre],
            excerpt: data.excerpt || '',
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

        const entryDate = data.date ? String(data.date) : (file.match(/^(\d{4}-\d{2}-\d{2})-/)?.[1] || '');
        const genreFromFile = String(file.match(/-(fx|stocks|crypto)[-.](ja|en)\.md$/i)?.[1] || file.match(/-(fx|stocks|crypto)\.md$/i)?.[1] || '').toUpperCase();
        const genre = String(data.genre || genreFromFile || 'FX').trim().toUpperCase();
        const localeMatch = file.match(/[-.](ja|en)\.md$/i);
        const locale = localeMatch ? localeMatch[1].toLowerCase() : 'ja';

        return {
            id,
            date: String(data.date || entryDate || '').trim(),
            title: String(data.title || `${genre} Analysis`).trim(),
            genre,
            target_pair: String(data.target_pair || '').trim(),
            prediction_direction: String(data.prediction_direction || 'FLAT').trim(),
            recommended_broker: String(data.recommended_broker || '').trim(),
            excerpt: String(data.excerpt || '').trim(),
            result: String(existingById.get(id)?.result || 'PENDING').trim(),
            locale
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

async function generateDeterministicReport(genre, newsHeadlines, marketData, jstDateStr, locale = 'ja') {
    const isEn = locale === 'en';
    const broker = (RECOMMENDED_BROKERS[locale] || RECOMMENDED_BROKERS.ja)[genre];
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
            ? (isEn ? ['#RateDiff', '#RiskOn', '#USD_Buy', '#Liquidity'] : ['#金利差', '#リスクオン', '#ドル買い', '#流動性'])
            : status === 'SELL'
                ? (isEn ? ['#JPY_Strong', '#NarrowingDiff', '#RiskOff', '#Volatility'] : ['#円高圧力', '#金利差縮小', '#リスクオフ', '#ボラティリティ'])
                : (isEn ? ['#Range', '#RateWatch', '#Liquidity', '#Uncertainty'] : ['#レンジ', '#金利観測', '#流動性', '#不確実性']),
        STOCKS: status === 'BUY'
            ? (isEn ? ['#FallingYields', '#RiskOn', '#Rotation', '#Liquidity'] : ['#利回り低下', '#リスクオン', '#セクターローテ', '#流動性'])
            : status === 'SELL'
                ? (isEn ? ['#RisingYields', '#RiskOff', '#Defensive', '#Volatility'] : ['#利回り上昇', '#リスクオフ', '#ディフェンシブ', '#ボラティリティ'])
                : (isEn ? ['#Neutral', '#RateWatch', '#SupplyDemand', '#Caution'] : ['#中立', '#金利観測', '#需給', '#警戒']),
        CRYPTO: status === 'BUY'
            ? (isEn ? ['#BitcoinETF', '#LiquidityRecovery', '#TrendCont', '#OnChain'] : ['#BitcoinETF', '#流動性回復', '#トレンド継続', '#オンチェーン'])
            : status === 'SELL'
                ? (isEn ? ['#VolatilityUp', '#RiskOff', '#PoorSupply', '#Regulation'] : ['#ボラティリティ上昇', '#リスクオフ', '#需給悪化', '#規制警戒'])
                : (isEn ? ['#Range', '#Adjustment', '#Liquidity', '#Caution'] : ['#レンジ', '#ポジション調整', '#流動性', '#警戒']),
    };
    const keywords = keywordsByGenre[genre].slice(0, 5).join(' ');

    let sentimentText = '';
    if (genre === 'CRYPTO') {
        const fng = await fetchCryptoFearGreed();
        if (fng?.score != null) {
            sentimentText = isEn 
                ? `Fear & Greed Index (F&G): ${fng.score} (${fng.label}). Extreme bias is evaluated as room for reversal.`
                : `恐怖・強欲指数（F&G）: ${fng.score}（${fng.label}）。極端な偏りはリバーサル余地として評価する。`;
        } else {
            sentimentText = isEn
                ? `Fear & Greed Index: Calculation failed. Evaluating sentiment via RSI and supply/demand.`
                : `恐怖・強欲指数: 算出できず。代替としてRSIと直近レンジの需給を通じて心理を評価する。`;
        }
    } else {
        const vixNum = vix != null ? Number(vix) : null;
        if (vixNum != null) {
            const bucket = isEn
                ? (vixNum >= 25 ? 'Fear' : vixNum <= 18 ? 'Greed/Calm' : 'Neutral')
                : (vixNum >= 25 ? '恐怖' : vixNum <= 18 ? '安心' : '中立');
            sentimentText = isEn
                ? `VIX-Equivalent Risk Sentiment: ${vixNum.toFixed(2)} (${bucket}).`
                : `VIX相当のリスク心理: ${vixNum.toFixed(2)}（${bucket}）。`;
        } else {
            sentimentText = isEn
                ? 'VIX-Equivalent Risk Sentiment: Calculation failed. Using RSI positioning as psychological indicator.'
                : 'VIX相当のリスク心理: 算出できず。代替としてRSIの位置づけを心理指標として扱う。';
        }
    }

    const newsBlockLines = newsHeadlines.slice(0, 5).map((n) => {
        const title = typeof n === 'string' ? n : n.title;
        const link = typeof n === 'string' ? '' : n.link;
        if (link) return `* [${title}](${link})`;
        return `* ${title}`;
    }).join('\n');

    const bbU = bbUpper != null ? fmt2(bbUpper) : null;
    const bbL = bbLower != null ? fmt2(bbLower) : null;
    const hi20 = recentHigh != null ? fmt2(recentHigh) : null;
    const lo20 = recentLow != null ? fmt2(recentLow) : null;

    const liquidityLine = (() => {
        const parts = [];
        if (bbU) parts.push(isEn ? `Upper Band ${bbU}` : `上限帯 ${bbU}`);
        if (bbL) parts.push(isEn ? `Lower Band ${bbL}` : `下限帯 ${bbL}`);
        if (hi20) parts.push(isEn ? `Recent High ${hi20}` : `直近高値 ${hi20}`);
        if (lo20) parts.push(isEn ? `Recent Low ${lo20}` : `直近安値 ${lo20}`);
        return parts.join(' / ');
    })();

    const getDeterministicTitle = (symbol, status, locale) => {
        const isEn = locale === 'en';
        const templates = {
            BUY: isEn 
                ? [
                    `${symbol}: AI Analysis Identifies High-Probability Bullish Scenario`,
                    `${symbol} Outlook: Strategic Upside Potential and Risk Evaluation`,
                    `Tactical Intelligence: ${symbol} Positioning for Growth Phase`
                  ]
                : [
                    `${symbol}：AI解析が示す上昇シナリオと戦略的リスク管理`,
                    `${symbol}の見通し：需給バランスから見る「押し目買い」の優位性`,
                    `インテリジェンス：${symbol}の強気相場における利益確定ポイント`
                  ],
            SELL: isEn 
                ? [
                    `${symbol}: AI Analytics Detects Bearish Structural Shift`,
                    `${symbol} Strategy: Defense and Risk Mitigation in Downtrend`,
                    `Critical Alert: ${symbol} Navigating Potential Correction Phase`
                  ]
                : [
                    `${symbol}：AI解析が示す下落シナリオと防御的ポジション管理`,
                    `警戒アラート：${symbol}の構造的変化と下落リスクの徹底検証`,
                    `${symbol}戦略：ベア相場におけるドローダウン極小化プロトコル`
                  ],
            NEUTRAL: isEn 
                ? [
                    `${symbol}: Range-Bound Cautiousness and Tactical Execution`,
                    `${symbol} Framework: Analyzing Liquidity Zones in Consolidation`,
                    `Professional Outlook: ${symbol} Equilibrium and Breakout Triggers`
                  ]
                : [
                    `${symbol}：レンジ圏内での警戒感とプロフェッショナル実行戦略`,
                    `${symbol}分析：持ち合い局面における流動性ゾーンの特定`,
                    `戦術的インサイト：${symbol}の均衡状態とブレイク条件の定義`
                  ]
        };
        const list = templates[status] || templates.NEUTRAL;
        const day = new Date(jstDateStr).getDate() || 0;
        return list[day % list.length];
    };

    const title = getDeterministicTitle(symbol, status, locale);

    const tldr_points = isEn 
        ? [ `Interest Correlation (Approx): ${corrStr} (${corr != null && corr >= 0 ? 'Positive' : 'Negative'})`,
            `Technical: Driven by Price ${cp ?? '---'} vs MA20 ${ma20 ?? '---'}`,
            `Liquidity: Targets based on ${liquidityLine || 'critical levels'}` ]
        : [ `金利相関（近似）: ${corrStr}で${corr != null && corr >= 0 ? '正相関' : '負相関'}傾向`,
            `テクニカル: 現在価格 ${cp ?? '---'} と MA20 ${ma20 ?? '---'} の位置関係が主導`,
            `需給: ${liquidityLine || '重要帯の確認が必要'} によるターゲット設計` ];

    const excerpt = isEn
        ? `Today's AI analysis outlines the execution plan for ${symbol} around Price ${cp ?? 'Unknown'}, RSI(${rsi ?? '---'}), and MA20(${ma20 ?? '---'}).`
        : `本日のAI解析では、${symbol}の現在価格 ${cp ?? '不明'}、RSI(${rsi ?? '---'})、MA20(${ma20 ?? '---'})を軸に、金利相関と需給帯から実行プランを整理する。`;

    const maRelKey = cp && ma20
        ? (Number(cp) > Number(ma20) ? 'UP' : 'DOWN')
        : 'FLAT';

    const LOCALIZATION = {
        ja: {
            maRel: { UP: '強気圏', DOWN: '弱気圏', FLAT: '位置関係は未取得' },
            conclusion: {
                BUY: '本日のAI解析では、金利相関の方向性とテクニカルの整合性が確認され、押し目買いを優先する。上値は主要帯で利確し、損切りは直近の下支えを基準に厳格運用する。',
                SELL: '本日のAI解析では、金利相関の方向性とテクニカルの整合性が下方向に傾き、防御的な売り戦略が妥当となる。反転リスクを想定し、損切りは直近の上支え基準で即時執行する。',
                NEUTRAL: '本日のAI解析では、トレンド優位が限定的でレンジ警戒が合理的となる。金利相関と需給帯のブレイク条件を待ち、エントリーは選別してリスク上限を最優先する。'
            },
            nextSteps: {
                BUY: [
                    `損切り帯（SL ${slStr}）を維持できるか監視。`,
                    `利確ターゲット（TP ${tpStr}）到達時は段階的に収益確定。`,
                    hi20 ? `直近高値 ${hi20} の上抜け可否を判断材料にする。` : `ボラティリティの拡大に注意しつつポジションを管理。`
                ],
                SELL: [
                    `上値の防御ライン（SL ${slStr}）を超えないか監視。`,
                    `利確ターゲット（TP ${tpStr}）到達時は迅速にポジション調整。`,
                    lo20 ? `直近安値 ${lo20} 近辺の反応を確認。` : `下落速度を監視し、段階的な利確を検討。`
                ],
                NEUTRAL: [
                    `ブレイク方向を確認（TP ${tpStr} / SL ${slStr} のどちら側か）。`,
                    rsi ? `RSI(14)が ${rsi} から明確に乖離するかを追跡。` : `主要な需給帯での反転・突破を監視。`,
                    ma20 ? `MA20（${ma20}）を跨ぐ終値の有無で次の判断を行う。` : `価格のボラティリティ縮小後の拡大を待機。`
                ]
            },
            fallbackSteps: [
                `主要帯（${tpStr ?? 'TP'}, ${slStr ?? 'SL'}）の反応を確認。`,
                `RSIとMA20の位置関係を日次で再評価。`,
                `金利相関の変化（相関係数 ${corrStr}）をモニタリング。`
            ],
            jsonComment: `本日のAI解析（シナプス解析）: 金利相関 ${corrStr} とテクニカルの整合性に基づく戦略設計。`,
            deterministic: {
                s1Title: "市場環境とファンダメンタルズ",
                s1Keywords: "キーワード",
                s1Summary: "サマリー",
                s1Text: `<strong>本日のAI解析</strong>では、${symbol}の需給が主要移動平均（MA20）と整合しており、<strong>${status === 'BUY' ? '上方向の優位' : status === 'SELL' ? '下方向の優位' : '方向性の限定'}</strong>を示す。加えて<strong>金利相関</strong>の変化が、トレンドの継続可否を規定する。`,
                s1NewsTitle: "最新ニュース見出し",
                s3Title: "テクニカル分析",
                s3RefData: "参照データ",
                s3Price: "現在価格",
                s3MARel: "MA20との関係",
                s3MARelTextPrefix: "終値は",
                s3MARelTextSuffix: "に位置する。",
                s3PointsTitle: "分析ポイント",
                s3Point1: `${cp ?? '---'}がMA20 ${ma20 ?? '---'}を維持し続ける限り、優位側のシナリオが優先される。`,
                s3Point2: `${rsi ?? '---'}がレンジを抜けるタイミングは、需給帯（BB/直近高安）への再評価を促す。`,
                s3Point3: `${status === 'BUY' ? (tpStr ? `利確ターゲット TP ${tpStr} 近辺で収益確定を検討。` : '上限帯への接近で利確を検討。') : status === 'SELL' ? (tpStr ? `利確ターゲット TP ${tpStr} 近辺で反応を確認。` : '下限帯への接近で利確を検討。') : `TP ${tpStr ?? '---'} と SL ${slStr ?? '---'} のどちら側にブレイクするかを観測。`}`,
                s4Title: "プロ・トレーディング戦略",
                s4PolicyTitle: "全体方針",
                s4Policy: `${status === 'NEUTRAL' ? 'レンジのブレイク待ちと選別エントリー' : status === 'BUY' ? '押し目での優位側エントリーを優先' : '反転待ちではなく下方向を先行する防御的売り'}`,
                s4TP: "利確ターゲット",
                s4SL: "損切りライン",
                s5Title: "結論とアクションプラン",
                s5Summary: "結論サマリー"
            }
        },
        en: {
            maRel: { UP: 'Bullish Zone', DOWN: 'Bearish Zone', FLAT: 'Position context not acquired' },
            conclusion: {
                BUY: "Today's AI analysis confirms alignment between interest rate correlation and technical indicators, prioritizing a 'buy on dips' strategy. Profit-taking is advised at key dynamic resistance levels, with strict stop-loss management based on recent support.",
                SELL: "Today's AI analysis shows a downward shift in both interest rate correlation and technical alignment, making a defensive selling strategy appropriate. Anticipating reversal risks, immediate stop-loss execution based on recent resistance is recommended.",
                NEUTRAL: "Today's AI analysis indicates limited trend dominance, making range-bound caution rational. Wait for breakout conditions in interest correlations and liquidity zones, selecting entries with the highest priority on risk caps."
            },
            nextSteps: {
                BUY: [
                    `Monitor if the stop-loss zone (SL ${slStr}) can be maintained.`,
                    `Execute phased profit-taking once the target (TP ${tpStr}) is reached.`,
                    hi20 ? `Use the breakout of the recent high ${hi20} as a primary decision factor.` : `Manage positions while monitoring for increased volatility.`
                ],
                SELL: [
                    `Monitor that the upper defensive line (SL ${slStr}) is not breached.`,
                    `Adjust positions rapidly upon reaching the take-profit target (TP ${tpStr}).`,
                    lo20 ? `Verify reaction around the recent low ${lo20}.` : `Monitor downside velocity and consider phased profit-taking.`
                ],
                NEUTRAL: [
                    `Confirm breakout direction (whether TP ${tpStr} or SL ${slStr} is tested).`,
                    rsi ? `Track if RSI(14) diverges significantly from ${rsi}.` : `Monitor for reversals or breakouts at major liquidity zones.`,
                    ma20 ? `Base next decisions on daily closes crossing the MA20 (${ma20}).` : `Wait for post-consolidation volatility expansion.`
                ]
            },
            fallbackSteps: [
                `Confirm price reaction at major zones (${tpStr ?? 'TP'}, ${slStr ?? 'SL'}).`,
                `Re-evaluate daily the relationship between RSI and MA20.`,
                `Monitor changes in interest correlation (Coefficient: ${corrStr}).`
            ],
            jsonComment: `AI Synapse Analysis: Strategy designed based on interest correlation ${corrStr} and technical alignment.`,
            deterministic: {
                s1Title: "1. Market Environment & Fundamentals",
                s1Keywords: "Keywords",
                s1Summary: "Executive Summary",
                s1Text: `<strong>Today's AI analysis</strong> indicates that supply and demand for ${symbol} are aligned with the major moving average (MA20), showing <strong>${status === 'BUY' ? 'upward dominance' : status === 'SELL' ? 'downward dominance' : 'limited directional bias'}</strong>. Furthermore, shifts in <strong>interest rate correlation</strong> will dictate whether the trend remains sustainable.`,
                s1NewsTitle: "Latest News Headlines",
                s2Title: "2. AI Multi-Angle Analysis (Synapse Analysis)",
                s2CorrTitle: "Interest Rate Correlation Analysis",
                s2CorrText: `The approximate correlation between interest rates (US10Y proxy) and ${symbol} shows a coefficient of ${corrStr}, with a <strong>${corr != null && corr >= 0 ? 'positive direction' : 'negative direction'}</strong> observed. This implies that the <strong>direction of interest rates</strong> is likely to be a primary driver for price movement.`,
                s2OrderTitle: "Order Book Analysis",
                s2OrderText: `The ${liquidityLine || 'monitoring of major zones'} is likely to serve as a short-term liquidity concentration point. Specifically, we anticipate <strong>${status === 'BUY' ? 'profit-taking at upper levels' : status === 'SELL' ? 'profit-taking at lower levels' : 'shuffling before a breakout'}</strong>.`,
                s3Title: "3. Technical Analysis",
                s3RefData: "Reference Data",
                s3Price: "Current Price",
                s3RSI: "RSI(14)",
                s3MA20: "20-Day Moving Average (MA20)",
                s3MARel: "Relationship with MA20",
                s3MARelTextPrefix: "The price is currently in the ",
                s3MARelTextSuffix: ".",
                s3PointsTitle: "Analysis Points",
                s3Point1: `As long as ${cp ?? '---'} stays ${Number(cp) > Number(ma20) ? 'above' : 'below'} MA20 ${ma20 ?? '---'}, the dominant side's scenario remains prioritized.`,
                s3Point2: `The timing of RSI(14) ${rsi ?? '---'} breaking its range will trigger a re-evaluation of liquidity zones (BB/recent highs and lows).`,
                s3Point3: `${status === 'BUY' ? (tpStr ? `Consider securing profits near TP ${tpStr}.` : 'Consider profit-taking as it approaches upper levels.') : status === 'SELL' ? (tpStr ? `Monitor reaction near TP ${tpStr}.` : 'Consider profit-taking as it approaches lower levels.') : `Observe whether it breaks towards TP ${tpStr ?? '---'} or SL ${slStr ?? '---'}.`}`,
                s4Title: "4. Professional Trading Strategy",
                s4PolicyTitle: "Overall Policy",
                s4Policy: `${status === 'NEUTRAL' ? 'Wait for range breakout and selective entries' : status === 'BUY' ? 'Prioritize entries on the dominant side during pullbacks' : 'Defensive selling rather than waiting for a reversal'}`,
                s4TP: "Take Profit Target",
                s4SL: "Stop Loss Line",
                s5Title: "5. Conclusion & Action Plan",
                s5Summary: "Executive Summary"
            }
        }
    };

    const L = LOCALIZATION[locale] || LOCALIZATION.ja;
    const D = L.deterministic;

    const maRelText = L.maRel[maRelKey];
    const conclusionText = L.conclusion[status] || L.conclusion.NEUTRAL;
    const finalNextSteps = (L.nextSteps[status] || L.nextSteps.NEUTRAL).slice(0, 3);
    const nextSteps3 = finalNextSteps.length === 3 ? finalNextSteps : L.fallbackSteps;

    const jsonBlock = `\`\`\`json\n{\n  "pair": "${symbol}",\n  "status": "${status}",\n  "comment": "${L.jsonComment}",\n  "entry": "${entryStr ?? '0.00'}",\n  "tp": "${tpStr ?? '0.00'}",\n  "sl": "${slStr ?? '0.00'}",\n  "reliability": "${relScore === 'HIGH' ? 'HIGH' : 'MEDIUM'}"\n}\n\`\`\``;

    return `---\ntitle: "${title}"\ndate: "${jstDateStr}"\ngenre: "${genre}"\ntarget_pair: "${symbol}"\nprediction_direction: "${prediction_direction}"\nrecommended_broker: "${broker}"\ntldr_points: ["${tldr_points[0]}", "${tldr_points[1]}", "${tldr_points[2]}"]\nchart_image: "/images/market-analysis-${genre.toLowerCase()}.png"\nexcerpt: "${excerpt}"\n---\n\n## ${D.s1Title}\n- **${D.s1Keywords}**: ${keywords}\n- **${D.s1Summary}**: ${D.s1Text}\n\n* ${D.s1NewsTitle}\n${newsBlockLines}\n\n## ${D.s3Title}\n- **${D.s3RefData}**: ${D.s3Price} ${cp ?? '---'}, RSI(14) ${rsi ?? '---'}, ${D.s3MA20} ${ma20 ?? '---'}.\n- **${D.s3MARel}**: ${D.s3MARelTextPrefix}${maRelText}${D.s3MARelTextSuffix}\n**${D.s3PointsTitle}**:\n* ${D.s3Point1}\n* ${D.s3Point2}\n* ${D.s3Point3}\n\n## ${D.s4Title}\n- **${D.s4PolicyTitle}**: ${D.s4Policy}.\n- **${D.s4TP}**: ${tpStr ?? '0.00'}\n- **${D.s4SL}**: ${slStr ?? '0.00'}\n\n## ${D.s5Title}\n- **${D.s5Summary}**: ${conclusionText}\n- **Next Step**:\n${nextSteps3.map((s) => `  * ${s}`).join('\n')}\n\n${jsonBlock}\n`;
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

        allNews = [...new Map(allNews.map((n) => [n.title, n])).values()].slice(0, 8);

        if (allNews.length === 0) {
            console.log(`[${genre}] ⚠️ No news found. Using neutral placeholders.`);
            allNews = [
                { title: 'Market volatility driven by central bank policy expectations', link: '' },
                { title: 'Geopolitical and supply chain factors impacting risk premiums', link: '' },
                { title: 'Real interest rates and USD trends affecting cross-asset flows', link: '' },
            ];
        }

        const newsForPrompt = allNews.slice(0, 5);
        const marketData = generateChart(genre);
        const dateStr = getJSTDateStr(TARGET_DATE_RAW);
        const displayDateStr = getJSTDateStr(TARGET_DATE_RAW, true);

        for (const locale of ['ja', 'en']) {
            console.log(`[${genre}:${locale}] 🚀 Starting generation for ${dateStr}...`);
            let markdown = '';

            try {
                if (deterministicOnly) {
                    markdown = await generateDeterministicReport(genre, newsForPrompt, marketData, displayDateStr, locale);
                } else {
                    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'dummy_key') {
                        try {
                            markdown = await generateWithGemini(genre, newsForPrompt, marketData, displayDateStr, locale);
                        } catch (e) {
                            console.warn(`[${genre}:${locale}] ⚠️ Gemini generation failed: ${e.message}`);
                        }
                    }

                    if (!markdown && OPENROUTER_API_KEY) {
                        console.log(`[${genre}:${locale}] Trying OpenRouter fallback chain...`);
                        for (const mId of FREE_MODELS) {
                            try {
                                markdown = await generateWithOpenRouter(genre, newsForPrompt, marketData, mId, displayDateStr, locale);
                                if (markdown) {
                                    console.log(`[${genre}:${locale}] ✅ Fallback successful with ${mId}`);
                                    break;
                                }
                            } catch (e2) {
                                console.error(`[${genre}:${locale}] ❌ OpenRouter ${mId}: ${e2.message}`);
                            }
                        }
                    }
                }

                if (!markdown) {
                    console.warn(`[${genre}:${locale}] ⚠️ All AI generation failed. Using high-quality Deterministic fallback.`);
                    markdown = await generateDeterministicReport(genre, newsForPrompt, marketData, displayDateStr, locale);
                }

                markdown = stripLeadingCodeFenceAroundFrontmatter(markdown);
                const fileName = `${dateStr}-${genre.toLowerCase()}-${locale}.md`;
                const filePath = path.join(REPORTS_DIR, fileName);

                fs.writeFileSync(filePath, markdown);
                console.log(`✅ [${genre}:${locale}] Saved: ${filePath}`);

                const sigPath = `./content/latest-signals-${locale}.json`;
                let sigs = {};
                if (fs.existsSync(sigPath)) {
                    try { sigs = JSON.parse(fs.readFileSync(sigPath, 'utf8')); } catch { sigs = {}; }
                }
                sigs[genre] = buildMergedSignalForGenre(genre, markdown, marketData, locale);
                fs.writeFileSync(sigPath, JSON.stringify(sigs, null, 2));
                console.log(`✅ Updated latest-signals-${locale}.json (${genre})`);

                if (locale === 'ja') {
                    fs.writeFileSync('./content/latest-signals.json', JSON.stringify(sigs, null, 2));
                }

            } catch (err) {
                console.error(`❌ [${genre}:${locale}] Critical error:`, err.message);
            }
        }

        rebuildReportsIndexFromReportsDir();

        if (Object.keys(TICKER_MAP).indexOf(genre) < Object.keys(TICKER_MAP).length - 1) {
            console.log(`[Queue] Waiting 10s for next genre...`);
            await sleep(10000);
        }
    }

    rebuildReportsIndexFromReportsDir();
}

if (REBUILD_ONLY) {
    console.log('🔄 Running index rebuild only...');
    rebuildReportsIndexFromReportsDir();
    process.exit(0);
}

main();
