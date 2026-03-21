import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// Report files are pre-defined for Edge runtime compatibility
// In a real production app, these would come from an API or a pre-built JSON index
import reportIndexLocal from '../../content/reports-index.json';

/**
 * Fetch the dynamic report index
 */
async function getReportIndex(): Promise<any[]> {
    // In development and for local changes, use the imported local JSON
    if (reportIndexLocal && Array.isArray(reportIndexLocal)) {
        return reportIndexLocal;
    }

    try {
        const response = await fetch('https://raw.githubusercontent.com/noriyuki007/synapse-capital-frontend/main/content/reports-index.json', { next: { revalidate: 60 } });
        if (response.ok) return await response.json();
    } catch (e) {
        console.error("Failed to fetch report index:", e);
    }
    
    return [];
}

/**
 * Helper to get report content (This is a workaround for Edge Runtime's lack of fs)
 */
async function getRawReportContent(id: string) {
    try {
        // Prefer local filesystem so newly generated reports are visible immediately.
        // If the local file doesn't exist (or runtime doesn't allow fs), fall back to GitHub raw.
        if (typeof window === 'undefined') {
            const fsMod = await import('fs/promises');
            const localPath = `${process.cwd()}/content/reports/${id}.md`;
            const localText = await fsMod.readFile(localPath, 'utf8');
            if (localText && localText.trim().length > 0) return localText;
        }
        // Browser-side: read via internal API route (server reads local fs).
        if (typeof window !== 'undefined') {
            const res = await fetch(`/api/reports/content/${id}`);
            if (res.ok) return await res.text();
        }
    } catch (e) {
        // ignore and fall back
    }

    try {
        const response = await fetch(`https://raw.githubusercontent.com/noriyuki007/synapse-capital-frontend/main/content/reports/${id}.md`);
        if (response.ok) return await response.text();
    } catch (e) {
        console.error(`Failed to fetch report ${id} from GitHub:`, e);
    }
    return '';
}

export async function getSortedReportsData() {
    const reportIndex = await getReportIndex();
    
    const allReportsData = await Promise.all(reportIndex.map(async (item) => {
        const id = item.id;
        let fileContents = await getRawReportContent(id);
        if (!fileContents || fileContents.length < 50) return null; // Filter empty/malformed

        // Fuzzy cleaning: AI sometimes wraps frontmatter in a code block
        fileContents = fileContents.replace(/^```markdown\n/i, '').replace(/^```\n/i, '');
        if (fileContents.startsWith('---')) {
            // Check for nested triple backticks inside the matter and strip them
            const parts = fileContents.split('---');
            if (parts.length >= 3) {
                parts[1] = parts[1].replace(/```markdown\n/gi, '').replace(/```\n/gi, '').replace(/```/g, '');
                fileContents = parts.join('---');
            }
        }

        const matterResult = matter(fileContents);
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
            recommended_broker: (data.recommended_broker || '').trim()
        };
    }));

    return allReportsData
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getReportData(id: string) {
    const fileContents = await getRawReportContent(id);
    if (!fileContents) throw new Error(`Report ${id} not found`);

    const matterResult = matter(fileContents);
    
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
    contentHtml = contentHtml.replace(/<h2>(.*?)<\/h2>/g, (match, title) => {
        const id = title.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');
        return `<h2 id="${id}">${title}</h2>`;
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
        chart_image?: string
    };

    // Extract AI Conclusion & Next Steps using regex
    const contentBeforeJson = matterResult.content.split('```json')[0];
    const sectionTitleRegex = /## 5\.\s*(?:AI結論とアクションプラン|結論とアクションプラン)|##\s*結論とアクションプラン/i;
    const sectionIndex = contentBeforeJson.search(sectionTitleRegex);
    
    let conclusionText = "";
    let nextSteps: string[] = [];

    if (sectionIndex !== -1) {
        const sectionContent = contentBeforeJson.substring(sectionIndex);
        const summaryMatch =
            sectionContent.match(/[*-]\s*\*?\*?結論サマリー\*?\*?:\s*([\s\S]+?)(?=\n[*-]|\n##|\n*$)/i) ||
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

    if (conclusionText === "") conclusionText = "現在の市場環境に基づき、AIは慎重かつ戦略的な取引を推奨します。";
    if (nextSteps.length === 0) nextSteps = ["主要なサポート・レジスタンスラインの監視", "経済指標発表時のボラティリティ警戒", "資金管理の徹底とリスク分散"];

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
    };
}

export async function getTrackRecordStats() {
    const reports = await getSortedReportsData();
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
function normalizeSignalData(genre: string, raw: any) {
    const defaults = {
        FX: { pair: "USD/JPY", status: "NEUTRAL", comment: "分析中", entry: "---", tp: "---", sl: "---", reliability: "MEDIUM" },
        STOCKS: { pair: "S&P 500", status: "NEUTRAL", comment: "分析中", entry: "---", tp: "---", sl: "---", reliability: "MEDIUM" },
        CRYPTO: { pair: "BTC/USD", status: "NEUTRAL", comment: "分析中", entry: "---", tp: "---", sl: "---", reliability: "MEDIUM" }
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

    // Structural deviation handling
    if (genre === 'FX') {
        if (raw.market_sentiment) data.status = raw.market_sentiment.toUpperCase();
        if (raw.key_themes) data.comment = raw.key_themes.join(' / ');
        if (raw.currency_pair_signals) {
            const firstPair = Object.keys(raw.currency_pair_signals)[0];
            if (firstPair) {
                data.pair = firstPair;
                data.comment = `${raw.currency_pair_signals[firstPair]} | ${data.comment}`;
            }
        }
    } else if (genre === 'STOCKS') {
        if (raw.market_sentiment) data.status = raw.market_sentiment.toUpperCase();
        if (raw.recommendation) data.comment = raw.recommendation;
        else if (raw.key_factors) data.comment = raw.key_factors.join(' / ');
    } else if (genre === 'CRYPTO') {
        if (raw.market_sentiment) data.status = raw.market_sentiment.toUpperCase();
        if (raw.btc_price_trend) data.comment = `BTC: ${raw.btc_price_trend} | ${raw.key_events?.slice(0, 2).join(', ') || ''}`;
    }

    return data;
}

export async function getLatestSignals() {
    try {
        const rawSignals = latestSignalsJson as any;
        return {
            FX: normalizeSignalData('FX', rawSignals.FX),
            STOCKS: normalizeSignalData('STOCKS', rawSignals.STOCKS),
            CRYPTO: normalizeSignalData('CRYPTO', rawSignals.CRYPTO)
        };
    } catch (e) {
        console.error("Failed to process latest signals:", e);
    }
    
    return {
        FX: { pair: "USD/JPY", status: "BUY", comment: "...", entry: "---", tp: "---", sl: "---", reliability: "LOW" },
        STOCKS: { pair: "S&P 500", status: "BUY", comment: "...", entry: "---", tp: "---", sl: "---", reliability: "LOW" },
        CRYPTO: { pair: "BTC/USD", status: "BUY", comment: "...", entry: "---", tp: "---", sl: "---", reliability: "LOW" }
    };
}
