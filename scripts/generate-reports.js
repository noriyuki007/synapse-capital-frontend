import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import matter from 'gray-matter';
import { generateWithGemini, generateWithOpenRouter, FREE_MODELS, GEMINI_MODEL_CANDIDATES, sleep } from './lib/llm-client.js';

// --- Configuration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const REPORTS_DIR = './content/reports';

const CLI_DATE_ARG = process.argv.find((a) => a.startsWith('--date='));

// --- Quality Rules ---
let QUALITY_RULES = {
    forbidden_phrases: [],
    forbidden_regex: [],
    banned_chinese_chars: false,
    banned_char_list: [],
    min_length_chars: 0,
    max_length_chars: 100000
};
try {
    const rulesPath = path.join(process.cwd(), 'scripts/quality-rules.json');
    if (fs.existsSync(rulesPath)) {
        QUALITY_RULES = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
    }
} catch (e) {
    console.warn('⚠️ Failed to load quality-rules.json, using defaults.');
}

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

const TARGET_DATE_RAW = process.env.FORCE_DATE || process.env.TARGET_DATE || (CLI_DATE_ARG ? CLI_DATE_ARG.split('=')[1] : '');
const REBUILD_ONLY = process.argv.includes('--rebuild-only');
const DRY_RUN = process.argv.includes('--dry-run');
const GENRES_TO_PROCESS = process.env.GENRES ? process.env.GENRES.split(',').map(g => g.trim().toUpperCase()) : Object.keys(TICKER_MAP);

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

/**
 * Quality Check Logic
 * Returns { ok: boolean, violations: string[] }
 */
function checkQuality(markdownText, genre, locale, expectedDateStr) {
    const violations = [];
    const text = markdownText.trim();

    // 0. Structure check (run FIRST — other checks assume valid frontmatter)

    // Strip optional leading code fence (```markdown / ```md / ```yaml)
    let s = text.replace(/^```(?:markdown|md|yaml|yml)?\s*\n/i, '').trim();

    // Reject if not starting with ---
    if (!s.startsWith('---')) {
        violations.push("Structure: does not start with '---' frontmatter delimiter");
    }

    // Require at least 2 '---' delimiters (open + close)
    const delimiters = s.match(/^---\s*$/gm) || [];
    if (delimiters.length < 2) {
        violations.push("Structure: missing closing '---' for frontmatter block");
    }

    // Reject prompt-leakage markers anywhere in the first 500 chars
    const head = s.slice(0, 500);
    const forbiddenMarkers = [
        /BEGIN\s*OUTPUT/i,
        /END\s*OUTPUT/i,
        /^BEGIN\s*$/im,
        /^END\s*$/im,
        /^OUTPUT:?\s*$/im
    ];
    for (const re of forbiddenMarkers) {
        if (re.test(head)) {
            violations.push(`Structure: contains prompt marker /${re.source}/`);
            break;
        }
    }

    // Required frontmatter fields (only check if structure is otherwise OK)
    if (delimiters.length >= 2 && s.startsWith('---')) {
        const fmBlock = s.slice(3, s.indexOf('\n---', 3));
        for (const field of ['title', 'date', 'genre']) {
            const re = new RegExp(`^${field}\\s*:`, 'm');
            if (!re.test(fmBlock)) {
                violations.push(`Structure: missing required field "${field}"`);
            }
        }
    }

    // 1. Length Check
    if (text.length < QUALITY_RULES.min_length_chars) {
        violations.push(`Length too short: ${text.length} < ${QUALITY_RULES.min_length_chars}`);
    }
    if (text.length > QUALITY_RULES.max_length_chars) {
        violations.push(`Length too long: ${text.length} > ${QUALITY_RULES.max_length_chars}`);
    }

    // 2. Forbidden Phrases
    for (const phrase of QUALITY_RULES.forbidden_phrases) {
        if (text.includes(phrase)) {
            violations.push(`Forbidden phrase detected: "${phrase}"`);
        }
    }

    // 3. Forbidden Regex
    for (const pattern of QUALITY_RULES.forbidden_regex) {
        const re = new RegExp(pattern, 'i');
        if (re.test(text)) {
            violations.push(`Forbidden regex match: "${pattern}"`);
        }
    }

    // 4. Banned Characters (Chinese etc.)
    if (QUALITY_RULES.banned_chinese_chars && QUALITY_RULES.banned_char_list) {
        for (const char of QUALITY_RULES.banned_char_list) {
            if (text.includes(char)) {
                violations.push(`Banned character detected: "${char}"`);
            }
        }
    }

    // 5. Frontmatter date vs filename date consistency
    if (expectedDateStr) {
        const fmDateMatch = text.match(/^date:\s*"?(\d{4}-\d{2}-\d{2})/m);
        if (fmDateMatch && fmDateMatch[1] !== expectedDateStr) {
            violations.push(`Frontmatter date mismatch: frontmatter="${fmDateMatch[1]}" expected="${expectedDateStr}"`);
        }
    }

    const ok = violations.length === 0;
    if (!ok) {
        console.warn(`[Quality] [${genre}:${locale}] VIOLATIONS:\n- ${violations.join('\n- ')}`);
    }

    return { ok, violations };
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

Style & Tone:
- Extremely professional, institutional tone (like Goldman Sachs/Bloomberg Terminal).
- No fluff, no introductory pleasantries, highly actionable.
- Focus strictly on technical levels and fundamental catalysts.
- Respond in ENGLISH only.
- Output MUST be **Markdown ONLY**, starting with the YAML Frontmatter (no code fences).

Required Affiliate Link:
Integrate the following recommended broker seamlessly into your strategy section or conclusion.
Broker: ${broker}
Integration Example: "For executing this specific setup, we recommend utilizing [${broker}] due to optimal liquidity."

Input — Latest News (RSS/Scraping):
${headlinesBlock}

Input — Chart/Technical Data:
- Current Price: ${cp}
- MA20: ${ma20}
- RSI(14): ${rsi}
- Chart Image Path (for YAML): /images/market-analysis-${genre.toLowerCase()}.png

======================================================================
OUTPUT FORMAT — FOLLOW EXACTLY. Output ONLY what is between the BEGIN/END markers (exclusive). Do NOT output the markers themselves.
======================================================================
BEGIN OUTPUT
---
title: "[${symbol}] [Direction] [Rationale] (e.g. '[${symbol}] UP: AI Detects Support at MA20 as Fundamentals Turn Bullish')"
date: "${jstDateStr}"
genre: "${genre}"
target_pair: "${symbol}"
prediction_direction: "UP or DOWN or FLAT"
recommended_broker: "${broker}"
tldr_points: ["Key point 1", "Key point 2", "Key point 3"]
chart_image: "/images/market-analysis-${genre.toLowerCase()}.png"
excerpt: "120-character summary (no greetings)"
---

## 1. Market Environment & Fundamentals

Two to three paragraphs covering macro backdrop, key catalysts from the news headlines above, and the fundamental thesis. Institutional prose only.

## 2. AI Multi-Factor Analysis

Exactly THREE bullet points in this format (each one label + colon + one-sentence explanation). No sub-bullets.

- **Rates Correlation**: One-sentence finding on yield/rate dynamics driving the pair.
- **Order Flow**: One-sentence finding on liquidity, positioning, or order book structure.
- **Sentiment**: One-sentence finding on market sentiment, CoT data, or news tone.

## 3. Technical Analysis

Two to three paragraphs of technical breakdown citing the current price (${cp}), MA20 (${ma20}), and RSI-14 (${rsi}). Discuss trend structure, key levels, and momentum.

## 4. Professional Trading Strategy

Open with ONE italicized sentence stating the directional bias in quotation form (this sentence will be pulled into a highlighted card), e.g. *"Buy the dip toward MA20 with tight risk control."* Then a short paragraph naming the entry, take-profit, and stop-loss levels explicitly, and naturally recommending [${broker}] for execution.

## 5. AI Conclusion & Action Plan

- **Conclusion Summary**: One to two sentences summarizing the trade thesis.
- Next Step:
    - First concrete action for the trader
    - Second concrete action
    - Third concrete action

\`\`\`json
{
  "pair": "${symbol}",
  "status": "BUY or SELL or NEUTRAL",
  "comment": "1-sentence rationale",
  "entry": "0.00",
  "tp": "0.00",
  "sl": "0.00",
  "reliability": "HIGH or MEDIUM or LOW"
}
\`\`\`
END OUTPUT

Hard rules:
- The article body MUST contain exactly five H2 headings: "## 1. ...", "## 2. ...", "## 3. ...", "## 4. ...", "## 5. ...". No other H2.
- Section 2 MUST contain exactly three bullet items in the "- **Label**: description" format.
- Section 4 MUST start with one italicized sentence wrapped in asterisks.
- Section 5 MUST contain the "**Conclusion Summary**:" line and a "Next Step:" block with bullet items.
- The JSON block MUST be the final element and MUST NOT be preceded by its own H2 heading.
`;
    } else {
        return `あなたはヘッジファンドのチーフアナリストです。以下のデータに基づき、${symbol} の超実践的・戦術的なマーケットレポートを作成してください。

トーン＆マナー:
- 機関投資家向け（野村證券やブルームバーグ端末）のプロフェッショナルで冷徹なトーン。
- 「こんにちは」「いかがでしょうか」等の挨拶や無駄な装飾は一切排除。
- 結論ファースト、具体的かつアクション可能（Actionable）な内容に。
- 出力は **Markdown のみ**。YAML Frontmatterから開始（フェンス禁止）。

アフィリエイト（指定ブローカー）への誘導:
記事の戦略部分または結論において、必ず以下のブローカーへの自然な誘導を含めてください。
指定ブローカー: ${broker}
誘導例: 「本戦略の実行にあたっては、流動性の観点から[${broker}]の利用を推奨する。」

Input — 最新ニュース (RSS/Scraping):
${headlinesBlock}

Input — チャート・テクニカルデータ:
- 現在価格: ${cp}
- MA20: ${ma20}
- RSI(14): ${rsi}
- 指定画像パス: /images/market-analysis-${genre.toLowerCase()}.png

======================================================================
出力フォーマット — 以下の BEGIN/END マーカーの間（マーカー自身は含めない）だけを、この構造通りに出力してください。
======================================================================
BEGIN OUTPUT
---
title: "[${symbol}] [方向性] [根拠] （例：「[${symbol}] UP: MA20での反発と強気ファンダメンタルズの整合性を確認」）"
date: "${jstDateStr}"
genre: "${genre}"
target_pair: "${symbol}"
prediction_direction: "UP または DOWN または FLAT"
recommended_broker: "${broker}"
tldr_points: ["要点1", "要点2", "要点3"]
chart_image: "/images/market-analysis-${genre.toLowerCase()}.png"
excerpt: "120文字前後の要約（挨拶なし）"
---

## 1. 市場環境とファンダメンタルズ分析

2〜3段落でマクロ環境、上記ニュースから読み取れる主要カタリスト、ファンダメンタルズの主張を記述。機関投資家向けの散文のみ。

## 2. AIによる多角市場分析（シナプス解析）

以下の形式で **必ず3つ** の箇条書き（各行：ラベル + コロン + 1文）。サブ箇条書き禁止。

- **金利相関解析**: 金利・利回りがペアに与えている動きを1文で。
- **オーダーフロー解析**: 流動性・ポジショニング・板状況の所見を1文で。
- **センチメント解析**: 市場心理・投機筋動向・報道トーンの所見を1文で。

## 3. テクニカル分析

現在価格（${cp}）、MA20（${ma20}）、RSI(14)（${rsi}）を引用しながら、2〜3段落でトレンド構造・主要節目・モメンタムを分析。

## 4. プロフェッショナルトレーディング戦略

冒頭に1文だけ、方向性バイアスをアスタリスクで囲んだイタリック文で宣言してください（このイタリック文はハイライトカードに抽出されます）。例：*「MA20付近までの押し目買いを、厳格なリスク管理下で推奨する。」* その後、短い段落でエントリー、TP、SLの具体的数値を明示し、流動性の観点から [${broker}] の利用を自然に推奨すること。

## 5. AI結論とアクションプラン

- **結論サマリー**: トレードの根拠を1〜2文で要約。
- Next Step:
    - 具体的なアクション1
    - 具体的なアクション2
    - 具体的なアクション3

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
END OUTPUT

厳守事項:
- 本文には H2 見出しを **正確に5つ** だけ含めること：「## 1. ...」「## 2. ...」「## 3. ...」「## 4. ...」「## 5. ...」。これ以外の H2 を出力しない。
- 2章は必ず「- **ラベル**: 説明」形式の箇条書きを3項目。
- 4章は必ず *アスタリスクで囲んだイタリック宣言文* から開始。
- 5章は必ず「**結論サマリー**:」行と、「Next Step:」以下の箇条書きを含める。
- JSON ブロックは記事末尾に1つだけ。JSON ブロックの直前に H2 見出しを置かない。
`;
    }
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

    const MA_REL_MAP = {
        ja: { UP: '強気圏', DOWN: '弱気圏', FLAT: '位置関係は未取得' },
        en: { UP: 'Bullish Zone', DOWN: 'Bearish Zone', FLAT: 'Position context not acquired' }
    };
    const maRelText = MA_REL_MAP[locale][maRelKey];

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
                s1Title: "1. 市場環境とファンダメンタルズ分析",
                s1Text: `<strong>本日のAI解析</strong>では、${symbol}の需給が主要移動平均（MA20 ${ma20 ?? '---'}）と整合しており、<strong>${status === 'BUY' ? '上方向の優位' : status === 'SELL' ? '下方向の優位' : '方向性の限定'}</strong>を示す。金利相関 ${corrStr} の推移がトレンドの継続可否を規定し、当日のニュースフローは以下の主要トピックに集約される。`,
                s1NewsTitle: "最新ニュース見出し",
                s2Title: "2. AIによる多角市場分析（シナプス解析）",
                s2Corr: `**金利相関解析**: 米10年債利回りと${symbol}の相関係数は ${corrStr}。${corr != null && corr >= 0 ? '正相関' : '負相関'}傾向が${status === 'BUY' ? '上値追い' : status === 'SELL' ? '下値試し' : 'レンジ継続'}を規定している。`,
                s2Order: `**オーダーフロー解析**: ${liquidityLine || '主要帯の監視'} が短期的な流動性の集中点として機能し、${status === 'BUY' ? '上値での利確売りを吸収しながら押し目買い' : status === 'SELL' ? '戻り売りを伴う下値トライ' : 'ブレイク前の玉整理'}が進行中。`,
                s2Sentiment: `**センチメント解析**: ${sentimentText || '心理指標は取得できず、RSIと需給帯で代替評価。'}`,
                s3Title: "3. テクニカル分析",
                s3Body: `現在価格 ${cp ?? '---'}、RSI(14) ${rsi ?? '---'}、20日移動平均 ${ma20 ?? '---'}。終値は${maRelText}に位置する。${cp && ma20 ? (Number(cp) > Number(ma20) ? `${cp}がMA20 ${ma20}を維持し続ける限り、優位側のシナリオが優先される。` : `${cp}がMA20 ${ma20}を下回る状態が続く限り、下方向の優位が維持される。`) : 'MA20との位置関係は未取得。'} RSI(14) ${rsi ?? '---'} がレンジを抜けるタイミングで、需給帯（BB/直近高安）の再評価を促す。${status === 'BUY' ? (tpStr ? `利確ターゲット TP ${tpStr} 近辺で段階的な収益確定を検討。` : '上限帯への接近で利確を検討。') : status === 'SELL' ? (tpStr ? `利確ターゲット TP ${tpStr} 近辺での反応を確認。` : '下限帯への接近で利確を検討。') : `TP ${tpStr ?? '---'} と SL ${slStr ?? '---'} のどちら側にブレイクするかを観測する。`}`,
                s4Title: "4. プロフェッショナルトレーディング戦略",
                s4Italic: `*「${status === 'BUY' ? `${symbol}は MA20 ${ma20 ?? '---'} を支持に、TP ${tpStr ?? '---'} 方向への優位側ロングを選別実行する。` : status === 'SELL' ? `${symbol}は反転待ちではなく、TP ${tpStr ?? '---'} 方向への防御的ショートを先行する。` : `${symbol}はレンジ内で選別エントリーに徹し、TP ${tpStr ?? '---'} / SL ${slStr ?? '---'} のブレイク方向を待つ。`}」*`,
                s4Body: `戦略のエントリー基準価格は ${entryStr ?? '---'}、利確ターゲット TP は ${tpStr ?? '---'}、損切りライン SL は ${slStr ?? '---'} とする。本戦略の執行にあたっては、流動性とスプレッドの観点から [${broker || '推奨ブローカー'}] の利用を推奨する。`,
                s5Title: "5. AI結論とアクションプラン"
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
                s1Text: `<strong>Today's AI analysis</strong> indicates that supply and demand for ${symbol} are aligned with the 20-day moving average (MA20 ${ma20 ?? '---'}), showing <strong>${status === 'BUY' ? 'upward dominance' : status === 'SELL' ? 'downward dominance' : 'limited directional bias'}</strong>. Shifts in the interest rate correlation coefficient ${corrStr} will dictate whether the trend remains sustainable, and the current news flow is summarized in the headlines below.`,
                s1NewsTitle: "Latest News Headlines",
                s2Title: "2. AI Multi-Factor Analysis",
                s2Corr: `**Rates Correlation**: The correlation coefficient between US 10Y yields and ${symbol} prints at ${corrStr} — a ${corr != null && corr >= 0 ? 'positive' : 'negative'} regime that currently governs ${status === 'BUY' ? 'upside continuation' : status === 'SELL' ? 'downside pressure' : 'range behavior'}.`,
                s2Order: `**Order Flow**: ${liquidityLine || 'Major reference zones'} serve as a short-term liquidity concentration point, where ${status === 'BUY' ? 'bids absorb offers on dips' : status === 'SELL' ? 'offers fade rallies' : 'flows rotate ahead of a breakout'}.`,
                s2Sentiment: `**Sentiment**: ${sentimentText || 'Sentiment metrics unavailable; falling back to RSI positioning and liquidity-zone behavior.'}`,
                s3Title: "3. Technical Analysis",
                s3Body: `Current price ${cp ?? '---'}, RSI(14) ${rsi ?? '---'}, 20-day MA ${ma20 ?? '---'}. Price is currently in the ${maRelText}. ${cp && ma20 ? (Number(cp) > Number(ma20) ? `As long as ${cp} holds above MA20 ${ma20}, the dominant bullish scenario remains prioritized.` : `As long as ${cp} trades below MA20 ${ma20}, the dominant bearish scenario remains in force.`) : 'The relationship with MA20 has not been acquired.'} The moment RSI(14) ${rsi ?? '---'} decisively breaks its range will trigger a re-evaluation of liquidity zones (BB / recent highs & lows). ${status === 'BUY' ? (tpStr ? `Consider scaling out of longs near TP ${tpStr}.` : 'Consider profit-taking as price approaches upper bands.') : status === 'SELL' ? (tpStr ? `Monitor reaction near TP ${tpStr}.` : 'Consider profit-taking as price approaches lower bands.') : `Observe whether price breaks toward TP ${tpStr ?? '---'} or SL ${slStr ?? '---'}.`}`,
                s4Title: "4. Professional Trading Strategy",
                s4Italic: `*"${status === 'BUY' ? `${symbol} rides MA20 ${ma20 ?? '---'} as support; execute selective longs toward TP ${tpStr ?? '---'}.` : status === 'SELL' ? `${symbol} leads with a defensive short bias toward TP ${tpStr ?? '---'} rather than waiting for a reversal.` : `${symbol} stays selective inside the range, waiting on a confirmed break between TP ${tpStr ?? '---'} and SL ${slStr ?? '---'}.`}"*`,
                s4Body: `The trigger entry is set at ${entryStr ?? '---'}, with take-profit at TP ${tpStr ?? '---'} and stop-loss at SL ${slStr ?? '---'}. For executing this specific setup, we recommend utilizing [${broker || 'the recommended broker'}] due to optimal liquidity and tight spreads.`,
                s5Title: "5. AI Conclusion & Action Plan"
            }
        }
    };

    const L = LOCALIZATION[locale] || LOCALIZATION.ja;
    const D = L.deterministic;

    const conclusionText = L.conclusion[status] || L.conclusion.NEUTRAL;
    const finalNextSteps = (L.nextSteps[status] || L.nextSteps.NEUTRAL).slice(0, 3);
    const nextSteps3 = finalNextSteps.length === 3 ? finalNextSteps : L.fallbackSteps;

    const jsonBlock = `\`\`\`json\n{\n  "pair": "${symbol}",\n  "status": "${status}",\n  "comment": "${L.jsonComment}",\n  "entry": "${entryStr ?? '0.00'}",\n  "tp": "${tpStr ?? '0.00'}",\n  "sl": "${slStr ?? '0.00'}",\n  "reliability": "${relScore === 'HIGH' ? 'HIGH' : 'MEDIUM'}"\n}\n\`\`\``;

    const summaryLabel = isEn ? 'Conclusion Summary' : '結論サマリー';

    return `---
title: "${title}"
date: "${jstDateStr}"
genre: "${genre}"
target_pair: "${symbol}"
prediction_direction: "${prediction_direction}"
recommended_broker: "${broker}"
tldr_points: ["${tldr_points[0]}", "${tldr_points[1]}", "${tldr_points[2]}"]
chart_image: "/images/market-analysis-${genre.toLowerCase()}.png"
excerpt: "${excerpt}"
---

## ${D.s1Title}

${D.s1Text}

${D.s1NewsTitle}:
${newsBlockLines}

## ${D.s2Title}

- ${D.s2Corr}
- ${D.s2Order}
- ${D.s2Sentiment}

## ${D.s3Title}

${D.s3Body}

## ${D.s4Title}

${D.s4Italic}

${D.s4Body}

## ${D.s5Title}

- **${summaryLabel}**: ${conclusionText}
- Next Step:
${nextSteps3.map((s) => `    - ${s}`).join('\n')}

${jsonBlock}
`;
}

async function generateReportForGenre(genre, newsForPrompt, marketData, dateStr, displayDateStr) {
    const localeResults = [];
    for (const locale of ['ja', 'en']) {
        console.log(`[${genre}:${locale}] 🚀 Starting generation for ${dateStr}...`);
        let markdown = '';
        let isFallback = false;

        const deterministicOnly = !GEMINI_API_KEY && !OPENROUTER_API_KEY;

        try {
            if (deterministicOnly) {
                markdown = await generateDeterministicReport(genre, newsForPrompt, marketData, displayDateStr, locale);
                isFallback = true;
            } else {
                // Priority: Gemini
                if (GEMINI_API_KEY && GEMINI_API_KEY !== 'dummy_key') {
                    for (const modelId of GEMINI_MODEL_CANDIDATES) {
                        try {
                            const systemInstruction = PERSONAS[genre];
                            const userPrompt = buildArticlePrompt(genre, newsForPrompt, marketData, displayDateStr, locale);
                            const raw = await generateWithGemini({
                                systemInstruction,
                                userPrompt,
                                logPrefix: `[${genre}]`
                            });
                            const q = checkQuality(raw, genre, locale, dateStr);
                            if (q.ok) {
                                markdown = raw;
                                break;
                            }
                        } catch (e) {
                            console.warn(`[${genre}:${locale}] ⚠️ Gemini ${modelId} failed: ${e.message}`);
                        }
                    }
                }

                // Fallback: OpenRouter
                if (!markdown && OPENROUTER_API_KEY) {
                    console.log(`[${genre}:${locale}] Trying OpenRouter fallback chain...`);
                    for (const mId of FREE_MODELS) {
                        try {
                            const systemInstruction = PERSONAS[genre];
                            const userPrompt = buildArticlePrompt(genre, newsForPrompt, marketData, displayDateStr, locale);
                            const raw = await generateWithOpenRouter({
                                systemInstruction,
                                userPrompt,
                                modelId: mId,
                                logPrefix: `[${genre}]`
                            });
                            const q = checkQuality(raw, genre, locale, dateStr);
                            if (q.ok) {
                                markdown = raw;
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
                console.warn(`[${genre}:${locale}] ⚠️ All AI/Quality checks failed. Using Deterministic fallback.`);
                markdown = await generateDeterministicReport(genre, newsForPrompt, marketData, displayDateStr, locale);
                isFallback = true;
                markdown += '\n\n<!-- fallback-template -->';
            }

            markdown = stripLeadingCodeFenceAroundFrontmatter(markdown);
            const fileName = `${dateStr}-${genre.toLowerCase()}-${locale}.md`;
            const filePath = path.join(REPORTS_DIR, fileName);

            if (!DRY_RUN) {
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
            } else {
                console.log(`[DRY-RUN] [${genre}:${locale}] Would save to: ${filePath}`);
            }
            localeResults.push(true);

        } catch (err) {
            console.error(`❌ [${genre}:${locale}] Error:`, err.message);
            localeResults.push(false);
        }
    }
    return localeResults.some(r => r === true);
}

async function main() {
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

    let successCount = 0;
    let totalGenres = 0;

    for (const genre of GENRES_TO_PROCESS) {
        if (!TICKER_MAP[genre]) continue;
        totalGenres++;
        console.log(`--- Processing genre: ${genre} ---`);

        try {
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

            const isSuccess = await generateReportForGenre(genre, newsForPrompt, marketData, dateStr, displayDateStr);
            if (isSuccess) successCount++;

            rebuildReportsIndexFromReportsDir();

            if (GENRES_TO_PROCESS.indexOf(genre) < GENRES_TO_PROCESS.length - 1) {
                console.log(`[Queue] Waiting 10s for next genre...`);
                await sleep(10000);
            }
        } catch (genreErr) {
            console.error(`[FAIL] genre=${genre.toLowerCase()} reason=${genreErr.message}`);
        }
    }

    if (!DRY_RUN) {
        rebuildReportsIndexFromReportsDir();
    }

    if (totalGenres > 0 && successCount === 0) {
        console.error('❌ All genres failed.');
        process.exit(1);
    } else {
        console.log(`✅ Generation completed (${successCount}/${totalGenres} genres succeeded).`);
        process.exit(0);
    }
}

if (REBUILD_ONLY) {
    console.log('🔄 Running index rebuild only...');
    rebuildReportsIndexFromReportsDir();
    process.exit(0);
}

main();
