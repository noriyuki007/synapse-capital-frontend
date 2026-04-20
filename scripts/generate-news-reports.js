import fs from 'fs';
import path from 'path';
import { generateWithGemini, generateWithOpenRouter, FREE_MODELS } from './lib/llm-client.js';

const NEWS_FILE = 'content/notion-news.json';
const STATE_FILE = 'content/news-reports-state.json';
const REPORTS_DIR = 'content/reports';
const QUALITY_RULES_FILE = 'scripts/quality-rules.json';
const MAX_ITEMS_PER_RUN = 3;

const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Genre mapping based on news metadata.
 * Order matters: check CRYPTO first because it might contain the string "通貨" (FX)
 */
function detectGenre(newsItem) {
  const m = newsItem.markets || [];
  const a = newsItem.assetClasses || [];
  const joined = [...m, ...a].join(' ');
  
  if (/仮想通貨|暗号資産|crypto/i.test(joined)) return 'CRYPTO';
  if (/FX|為替|通貨/i.test(joined)) return 'FX';
  return 'STOCKS';
}

function getMapping(genre) {
  switch (genre) {
    case 'FX':
      return { pair: 'USD/JPY', broker: 'dmm-fx', image: '/images/market-analysis-fx.png' };
    case 'CRYPTO':
      return { pair: 'BTC/USD', broker: 'bitbank', image: '/images/market-analysis-crypto.png' };
    default:
      return { pair: 'S&P 500', broker: 'moomoo', image: '/images/market-analysis-stocks.png' };
  }
}

function loadQualityRules() {
  try {
    if (fs.existsSync(QUALITY_RULES_FILE)) {
      return JSON.parse(fs.readFileSync(QUALITY_RULES_FILE, 'utf8'));
    }
  } catch (e) {
    console.warn('[news-reports] ⚠️ Failed to load quality rules:', e.message);
  }
  return null;
}

function validateReport(text, { expectedDate, rules }) {
  if (!rules) return { ok: true, violations: [] };
  const violations = [];

  // Structure
  const content = text.trim();
  if (!content.startsWith('---')) violations.push('missing frontmatter open');
  const delims = (content.match(/^---\s*$/gm) || []).length;
  if (delims < 2) violations.push('missing frontmatter close');

  // Prompt leakage
  if (/BEGIN\s*OUTPUT|END\s*OUTPUT/i.test(content.slice(0, 500))) {
    violations.push('prompt leakage marker');
  }

  // Length
  if (content.length < rules.min_length_chars) violations.push(`too short: ${content.length}`);
  if (content.length > rules.max_length_chars) violations.push(`too long: ${content.length}`);

  // Forbidden phrases / regex / chars
  for (const p of rules.forbidden_phrases || []) {
    if (content.includes(p)) violations.push(`forbidden phrase: ${p}`);
  }
  for (const p of rules.forbidden_regex || []) {
    if (new RegExp(p, 'i').test(content)) violations.push(`forbidden regex: ${p}`);
  }
  if (rules.banned_chinese_chars && rules.banned_char_list) {
    for (const c of rules.banned_char_list) {
      if (content.includes(c)) violations.push(`banned char: ${c}`);
    }
  }

  // Date consistency
  if (expectedDate) {
    const m = content.match(/^date:\s*"?(\d{4}-\d{2}-\d{2})/m);
    if (m && m[1] !== expectedDate) violations.push(`date mismatch: ${m[1]} vs ${expectedDate}`);
  }

  return { ok: violations.length === 0, violations };
}

async function generateOne({ systemInstruction, userPrompt, logPrefix }) {
  if (process.env.GEMINI_API_KEY) {
    try {
      const raw = await generateWithGemini({ systemInstruction, userPrompt, logPrefix });
      if (raw) return raw;
    } catch (e) {
      console.warn(`${logPrefix} Gemini failed: ${e.message}`);
    }
  }
  if (process.env.OPENROUTER_API_KEY) {
    for (const mId of FREE_MODELS) {
      try {
        const raw = await generateWithOpenRouter({ systemInstruction, userPrompt, modelId: mId, logPrefix });
        if (raw) return raw;
      } catch (e) {
        console.warn(`${logPrefix} OpenRouter ${mId} failed: ${e.message}`);
      }
    }
  }
  return null;
}

function buildUserPrompt(newsItem, genre, locale = 'ja') {
  const mapping = getMapping(genre);
  const isEn = locale === 'en';
  
  const jstNow = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 16);

  if (isEn) {
    return `Analyze how the following news impact the ${genre} market (Main target: ${mapping.pair}) and output a tradable report.

【News Info】
- Title: ${newsItem.title}
- Published: ${newsItem.publishedAt}
- Source: ${newsItem.sourceUrl || 'Notion'}
- Core Message: ${newsItem.coreMessage || ''}
- Action: ${newsItem.actionableAdvice || ''}
- Sentiment: ${newsItem.sentiment || ''}
- Keywords: ${newsItem.categories?.join(', ') || ''}

【Requirements】
- Markdown only (No code fences)
- Start with YAML Frontmatter (--- to ---)
- 5 Sections:
  ## 1. News Summary & Market Reaction
  ## 2. Synapse Analysis (3 bullets)
  ## 3. Technical Perspective
  ## 4. Trading Strategy (Including specific levels)
  ## 5. Conclusion & Action Plan

【Required Frontmatter Fields】
---
title: "[${mapping.pair}] UP/DOWN/FLAT: {Summary within 30 chars}"
date: "${jstNow}"
genre: "${genre}"
target_pair: "${mapping.pair}"
prediction_direction: "UP" or "DOWN" or "FLAT"
recommended_broker: "${mapping.broker}"
tldr_points: ["Point 1", "Point 2", "Point 3"]
chart_image: "${mapping.image}"
excerpt: "Approx 120 chars summary"
news_source_id: "${newsItem.id}"
news_source_url: "${newsItem.sourceUrl || ''}"
---

(Body)`;
  }

  return `以下の新着ニュースが ${genre} 市場（主対象: ${mapping.pair}）に与える影響を分析し、取引可能なレポートとして出力してください。

【ニュース情報】
- タイトル: ${newsItem.title}
- 公開日時: ${newsItem.publishedAt}
- 情報ソース: ${newsItem.sourceUrl || 'Notion'}
- コアメッセージ: ${newsItem.coreMessage || ''}
- 初心者向けアクション: ${newsItem.actionableAdvice || ''}
- 市場センチメント: ${newsItem.sentiment || ''}
- キーワード: ${newsItem.categories?.join(', ') || ''}

【出力要件】
- Markdown のみで出力（コードフェンス禁止）
- 冒頭は YAML Frontmatter（--- 〜 ---）
- 以降 5 セクション:
  ## 1. ニュース要約とマーケット反応
  ## 2. シナプス解析（3 bullets）
  ## 3. テクニカル視点
  ## 4. トレーディング戦略（具体的な価格レベル含む）
  ## 5. 結論とアクションプラン

【Frontmatter 必須フィールド】
---
title: "[${mapping.pair}] UP/DOWN/FLAT: {30文字以内の要旨}"
date: "${jstNow}"
genre: "${genre}"
target_pair: "${mapping.pair}"
prediction_direction: "UP" または "DOWN" または "FLAT"
recommended_broker: "${mapping.broker}"
tldr_points: ["要点1", "要点2", "要点3"]
chart_image: "${mapping.image}"
excerpt: "120文字程度の要約"
news_source_id: "${newsItem.id}"
news_source_url: "${newsItem.sourceUrl || ''}"
---

（本文）`;
}

const SYSTEM_INSTRUCTIONS = {
  ja: `あなたは機関投資家向け金融メディアのシニアアナリストです。
個別ニュース事象が市場に与える影響を、データ駆動・客観的に分析します。
個人的感想・会話調・挨拶は禁止。分析主体は「シナプス解析」と表現してください。
多言語混入（中国語簡体字・ハングル・キリル文字）は絶対に禁止。`,
  en: `You are a senior analyst at an institutional investor-facing financial media outlet.
Analyze how this specific news event impacts the market using a data-driven, objective approach.
No personal opinion, no conversational tone, no greetings. Refer to the analysis as "Synapse Analysis".
Respond in English only. Non-English scripts (Cyrillic, Hangul, simplified Chinese) are strictly forbidden.`
};

async function main() {
  try {
    if (!process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY) {
      console.log('[news-reports] No LLM API keys found. Skipping.');
      process.exit(0);
    }

    if (!fs.existsSync(NEWS_FILE)) {
      console.log('[news-reports] No news file found. Skipping.');
      process.exit(0);
    }

    const news = JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8'));
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const importantNews = news
      .filter(item => item.importanceLevel === 5)
      .filter(item => {
        const pub = new Date(item.publishedAt);
        return pub >= fortyEightHoursAgo;
      })
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    if (importantNews.length === 0) {
      console.log('[news-reports] No ★5 news items found within 48h.');
      process.exit(0);
    }

    let state = { processedIds: [], lastRunAt: null };
    if (fs.existsSync(STATE_FILE)) {
      state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }

    const unbuiltNews = importantNews.filter(item => !state.processedIds.includes(item.id));
    const targetItems = unbuiltNews.slice(0, MAX_ITEMS_PER_RUN);

    if (targetItems.length === 0) {
      console.log('[news-reports] All ★5 news items already processed.');
      process.exit(0);
    }

    const rules = loadQualityRules();
    const dateStr = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    
    let processedCount = 0;
    let writtenCount = 0;
    let skippedCount = 0;

    for (const item of targetItems) {
      const shortId = item.id.replace(/-/g, '').slice(0, 8);
      const genre = detectGenre(item);
      const logPrefix = `[news-reports][${item.title.slice(0, 20)}...]`;
      
      let itemSuccess = false;

      for (const locale of ['ja', 'en']) {
        const path = `${REPORTS_DIR}/${dateStr}-news-${shortId}-${locale}.md`;
        
        if (DRY_RUN) {
          console.log(`[news-reports] [DRY RUN] would write: ${path}`);
          itemSuccess = true;
          continue;
        }

        const userPrompt = buildUserPrompt(item, genre, locale);
        const systemInstruction = SYSTEM_INSTRUCTIONS[locale];
        
        const raw = await generateOne({ systemInstruction, userPrompt, logPrefix: `${logPrefix}[${locale}]` });
        
        if (raw) {
          const q = validateReport(raw, { expectedDate: dateStr, rules });
          if (q.ok) {
            fs.writeFileSync(path, raw);
            console.log(`[news-reports] ✅ wrote ${path}`);
            writtenCount++;
            itemSuccess = true;
          } else {
            console.warn(`[news-reports] ⚠️ quality fail ${item.id} [${locale}]: ${q.violations.join(', ')}`);
          }
        } else {
          console.warn(`[news-reports] ❌ generation failed for ${item.id} [${locale}]`);
        }
      }

      if (itemSuccess) {
        state.processedIds.push(item.id);
      } else {
        skippedCount++;
      }
      processedCount++;
    }

    state.lastRunAt = new Date().toISOString();
    if (!DRY_RUN) {
      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    }

    console.log(`[news-reports] summary: processed=${processedCount}, written=${writtenCount}, skipped=${skippedCount}`);
    process.exit(0);

  } catch (err) {
    console.error(`[news-reports] Fatal: ${err.message}`);
    process.exit(0);
  }
}

main();
