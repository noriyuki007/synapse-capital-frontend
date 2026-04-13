import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import fs from 'fs';
import path from 'path';

// Report files are pre-defined for Edge runtime compatibility
// In a real production app, these would come from an API or a pre-built JSON index
import reportIndexLocal from '../../content/reports-index.json';

const reportsDirectory = path.join(process.cwd(), 'content', 'reports');

/**
 * Fetch the dynamic report index
 */
async function getReportIndex(): Promise<any[]> {
    // In development and for local changes, use the imported local JSON
    if (reportIndexLocal && Array.isArray(reportIndexLocal)) {
        return reportIndexLocal;
    }

    try {
        const response = await fetch('https://raw.githubusercontent.com/noriyuki007/synapse-capital-frontend/main/content/reports-index.json', { cache: 'force-cache' });
        if (response.ok) return await response.json();
    } catch (e) {
        console.error("Failed to fetch report index:", e);
    }
    
    return [];
}

/**
 * Helper to get report content
 * Priority: local filesystem (build/SSR) > browser API > GitHub fallback
 */
async function getRawReportContent(id: string, locale?: string) {
    const filenames = locale ? [`${id}-${locale}`, id] : [id];

    for (const filename of filenames) {
        // Server-side: read from local filesystem (works during build and SSR)
        if (typeof window === 'undefined') {
            try {
                const filePath = path.join(reportsDirectory, `${filename}.md`);
                if (fs.existsSync(filePath)) {
                    return fs.readFileSync(filePath, 'utf8');
                }
            } catch (e) {}
        }

        try {
            // Browser-side check
            if (typeof window !== 'undefined') {
                const res = await fetch(`/api/reports/content/${filename}`);
                if (res.ok) return await res.text();
            }
        } catch (e) {}

        try {
            // GitHub Fallback (for Edge Runtime or when local file not found)
            const response = await fetch(`https://raw.githubusercontent.com/noriyuki007/synapse-capital-frontend/main/content/reports/${filename}.md`);
            if (response.ok) return await response.text();
        } catch (e) {}
    }
    return '';
}

export async function getSortedReportsData(locale?: string) {
    const reportIndex = await getReportIndex();
    
    // Filter by locale if provided
    const filteredIndex = locale 
        ? reportIndex.filter(item => item.locale === locale)
        : reportIndex;

    const allReportsData = await Promise.all(filteredIndex.map(async (item) => {
        const id = item.id;
        const itemLocale = item.locale || 'ja';
        // If ID ends with locale, remove it to get the base ID
        const baseId = id.replace(/-(ja|en)$/, '');
        
        let fileContents = await getRawReportContent(baseId, itemLocale);
        if (!fileContents || fileContents.length < 50) {
            // Try with original ID as fallback
            fileContents = await getRawReportContent(id);
        }
        if (!fileContents || fileContents.length < 50) return null;

        fileContents = cleanFrontmatter(fileContents);

        let matterResult;
        try {
            matterResult = matter(fileContents);
        } catch (e) {
            console.warn(`[reports] Failed to parse frontmatter for ${id}:`, (e as Error).message);
            return null;
        }
        const data = matterResult.data as any;

        // Ensure date is a string (gray-matter sometimes returns Date objects)
        const dateStr = data.date instanceof Date 
            ? data.date.toISOString().replace('T', ' ').substring(0, 16) 
            : String(data.date || item.date);

        return {
            id,
            date: dateStr,
            title: (data.title || item.title || 'Untitled Report').trim(),
            genre: (data.genre || item.genre || 'FX').trim(),
            excerpt: (data.excerpt || '').trim(),
            target_pair: (data.target_pair || item.target_pair || '').trim(),
            prediction_direction: (data.prediction_direction || item.prediction_direction || 'FLAT').trim(),
            result: (data.result || item.result || 'PENDING').trim(),
            recommended_broker: (data.recommended_broker || '').trim(),
            locale: data.locale || item.locale || 'ja'
        };
    }));

    return allReportsData
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getReportData(id: string, locale?: string) {
    // If ID ends with -ja or -en, extract base ID and locale
    let baseId = id.replace(/-(ja|en)$/, '');
    const detectedLocale = id.endsWith('-ja') ? 'ja' : id.endsWith('-en') ? 'en' : locale || 'ja';

    let fileContents = await getRawReportContent(baseId, detectedLocale);
    if (!fileContents) {
        // Fallback to original ID
        fileContents = await getRawReportContent(id);
    }
    if (!fileContents) throw new Error(`Report ${id} not found`);

    try {
        return await processMarkdown(baseId, fileContents, detectedLocale);
    } catch (e) {
        console.warn(`[reports] processMarkdown failed for ${id}:`, (e as Error).message);
        // Return minimal data so the build doesn't crash
        const isEn = detectedLocale === 'en';
        return {
            id: baseId,
            contentHtml: `<p>${isEn ? 'This report could not be rendered.' : 'このレポートの表示に失敗しました。'}</p>`,
            signalData: null,
            conclusionText: '',
            nextSteps: [],
            title: id,
            date: '',
            genre: 'FX',
            target_pair: '',
            prediction_direction: 'FLAT',
            recommended_broker: '',
            tldr_points: [],
            chart_image: '',
            excerpt: '',
            locale: detectedLocale
        };
    }
}

function cleanFrontmatter(raw: string): string {
    // Fuzzy cleaning: AI sometimes wraps frontmatter in a code block
    let cleaned = raw.replace(/^```markdown\n/i, '').replace(/^```\n/i, '');
    if (cleaned.startsWith('---')) {
        const parts = cleaned.split('---');
        if (parts.length >= 3) {
            parts[1] = parts[1].replace(/```markdown\n/gi, '').replace(/```\n/gi, '').replace(/```/g, '');
            // Remove "YAML Frontmatter" or similar preamble lines
            parts[1] = parts[1].replace(/^YAML Frontmatter:?\n/i, '');
            cleaned = parts.join('---');
        }
    }
    return cleaned;
}

async function processMarkdown(id: string, fileContents: string, locale: string) {
    const cleaned = cleanFrontmatter(fileContents);
    const matterResult = matter(cleaned);
    
    // Extract signal JSON
    const signalMatch = matterResult.content.match(/```json\n([\s\S]*?)\n```/);
    let signalData = null;
    if (signalMatch) {
        try {
            signalData = JSON.parse(signalMatch[1]);
        } catch (e) {
            console.error("Failed to parse signal data in markdown:", e);
        }
    }

    // Remove JSON signal block from main content display
    const contentWithoutJson = matterResult.content.replace(/```json[\s\S]*?```/g, '');

    const processedContent = await remark()
        .use(html)
        .process(contentWithoutJson);
    let contentHtml = processedContent.toString();

    // Inject IDs into H2 tags for TOC
    let h2Counter = 0;
    contentHtml = contentHtml.replace(/<h2>(.*?)<\/h2>/g, (match, title) => {
        h2Counter++;
        const slug = title.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
        const id = slug || `section-${h2Counter}`;
        return `<h2 id="s${h2Counter}-${id}">${title}</h2>`;
    });

    const data = matterResult.data as { 
        date: string | Date, 
        title: string, 
        genre?: string, 
        excerpt?: string,
        target_pair?: string,
        prediction_direction?: string,
        result?: string,
        recommended_broker?: string,
        tldr_points?: string[],
        chart_image?: string,
        locale?: string
    };

    // Extract AI Conclusion & Next Steps using regex
    const contentBeforeJson = matterResult.content.split('```json')[0];
    const sectionTitleRegex = /## 5\.\s*(?:AI結論とアクションプラン|結論とアクションプラン|AI Conclusion & Action Plan)|##\s*(?:結論とアクションプラン|AI Conclusion & Action Plan)/i;
    const sectionIndex = contentBeforeJson.search(sectionTitleRegex);
    
    let conclusionText = "";
    let nextSteps: string[] = [];

    if (sectionIndex !== -1) {
        const sectionContent = contentBeforeJson.substring(sectionIndex);
        const summaryMatch =
            sectionContent.match(/[*-]\s*\*?\*?(?:結論サマリー|Conclusion Summary)\*?\*?:\s*([\s\S]+?)(?=\n[*-]|\n##|\n*$)/i) ||
            sectionContent.match(/## 5\.[^\n]*\n+([^\n#]+)/i);
        conclusionText = summaryMatch ? summaryMatch[1].trim() : "";
        
        const stepsLines = sectionContent.split('\n');
        let inNextSteps = false;
        for (const line of stepsLines) {
            if (line.includes('Next Step:')) {
                inNextSteps = true;
                continue;
            }
            if (inNextSteps) {
                if (line.match(/^[•\-\*]/)) {
                    nextSteps.push(line.replace(/^[•\-\*]\s*/, '').trim());
                } else if (line.match(/^##/) || line.trim() === "") {
                    if (nextSteps.length > 0) break;
                }
            }
        }
    }

    const isEn = data.locale === 'en' || id.includes('-en');
    if (conclusionText === "") conclusionText = isEn ? "Based on current market conditions, AI recommends cautious and strategic trading." : "現在の市場環境に基づき、AIは慎重かつ戦略的な取引を推奨します。";
    if (nextSteps.length === 0) nextSteps = isEn 
        ? ["Monitor key support/resistance levels", "Stay alert during economic data releases", "Maintain disciplined risk management"]
        : ["主要なサポート・レジスタンスラインの監視", "経済指標発表時のボラティリティ警戒", "資金管理の徹底とリスク分散"];

    return {
        id,
        contentHtml,
        signalData,
        conclusionText,
        nextSteps,
        title: data.title,
        date: data.date instanceof Date 
            ? data.date.toISOString().replace('T', ' ').substring(0, 16) 
            : String(data.date || ''),
        genre: data.genre || 'FX',
        target_pair: data.target_pair || '',
        prediction_direction: data.prediction_direction || 'FLAT',
        recommended_broker: data.recommended_broker || '',
        tldr_points: data.tldr_points || [],
        chart_image: data.chart_image || '',
        excerpt: data.excerpt || '',
        locale: data.locale || (isEn ? 'en' : 'ja')
    };
}

export async function getTrackRecordStats(locale?: string) {
    const reports = await getSortedReportsData(locale);
    const stats = {
        total: reports.length,
        hits: reports.filter(r => r.result === 'HIT').length,
        misses: reports.filter(r => r.result === 'MISS').length,
        pending: reports.filter(r => r.result === 'PENDING').length,
        winRate: 0,
        byGenre: {} as Record<string, { total: number, hits: number, winRate: number }>
    };

    const evaluatedCount = stats.hits + stats.misses;
    if (evaluatedCount > 0) {
        stats.winRate = Math.round((stats.hits / evaluatedCount) * 100);
    }

    reports.forEach(r => {
        if (!stats.byGenre[r.genre]) {
            stats.byGenre[r.genre] = { total: 0, hits: 0, winRate: 0 };
        }
        stats.byGenre[r.genre].total++;
        if (r.result === 'HIT') stats.byGenre[r.genre].hits++;
    });

    Object.keys(stats.byGenre).forEach(genre => {
        const g = stats.byGenre[genre];
        const evaluated = g.total - reports.filter(r => r.genre === genre && r.result === 'PENDING').length;
        if (evaluated > 0) {
            g.winRate = Math.round((g.hits / evaluated) * 100);
        }
    });

    return stats;
}

import latestSignalsJson from '../../content/latest-signals.json';

/**
 * Normalizes varied AI JSON structures into consistent SignalCard props
 */
function normalizeSignalData(genre: string, raw: any, locale: string = 'ja') {
    const isEn = locale === 'en';
    const defaults = {
        FX: { pair: "USD/JPY", status: "NEUTRAL", comment: isEn ? "Analyzing" : "分析中", entry: "---", tp: "---", sl: "---", reliability: "MEDIUM" },
        STOCKS: { pair: "S&P 500", status: "NEUTRAL", comment: isEn ? "Analyzing" : "分析中", entry: "---", tp: "---", sl: "---", reliability: "MEDIUM" },
        CRYPTO: { pair: "BTC/USD", status: "NEUTRAL", comment: isEn ? "Analyzing" : "分析中", entry: "---", tp: "---", sl: "---", reliability: "MEDIUM" }
    } as any;

    const data = { ...defaults[genre] };
    if (!raw) return data;

    // Common field mapping (if already correct)
    if (raw.pair) data.pair = raw.pair;
    else if (raw.target_pair) data.pair = raw.target_pair;
    if (raw.status) data.status = raw.status;
    if (raw.comment) data.comment = raw.comment;
    if (raw.entry) data.entry = raw.entry;
    if (raw.tp) data.tp = raw.tp;
    if (raw.sl) data.sl = raw.sl;
    if (raw.reliability) data.reliability = raw.reliability;

    return data;
}

export async function getLatestSignals(locale: string = 'ja') {
    try {
        const rawSignals = latestSignalsJson;


        return {
            FX: normalizeSignalData('FX', rawSignals.FX, locale),
            STOCKS: normalizeSignalData('STOCKS', rawSignals.STOCKS, locale),
            CRYPTO: normalizeSignalData('CRYPTO', rawSignals.CRYPTO, locale)
        };
    } catch (e) {
        console.error(`Failed to process latest signals for ${locale}:`, e);
        return {
            FX: normalizeSignalData('FX', null, locale),
            STOCKS: normalizeSignalData('STOCKS', null, locale),
            CRYPTO: normalizeSignalData('CRYPTO', null, locale)
        };
    }
}
