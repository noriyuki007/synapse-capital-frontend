import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// Report files are pre-defined for Edge runtime compatibility
// In a real production app, these would come from an API or a pre-built JSON index
const REPORT_FILES = [
  '2026-03-17-crypto',
  '2026-03-17-fx',
  '2026-03-17-stocks',
  '2026-03-15-crypto',
  '2026-03-15-fx',
  '2026-03-15-stocks',
  '2026-03-11-crypto',
  '2026-03-11-fx',
  '2026-03-11-stocks',
  '2026-03-10-fx'
];

/**
 * Helper to get report content (This is a workaround for Edge Runtime's lack of fs)
 */
async function getRawReportContent(id: string) {
    try {
        // We use dynamic imports or fetch to get the content in a way that works in Edge
        // For simplicity and speed in this context, we'll try to use the raw GitHub content or a local fetch
        const response = await fetch(`https://raw.githubusercontent.com/noriyuki007/synapse-capital-frontend/main/content/reports/${id}.md`);
        if (response.ok) return await response.text();
    } catch (e) {
        console.error(`Failed to fetch report ${id} from GitHub:`, e);
    }
    return '';
}

export async function getSortedReportsData() {
    // In Edge runtime, we can't scan the filesystem.
    // We Map over our hardcoded list and fetch/process them.
    const allReportsData = await Promise.all(REPORT_FILES.map(async (id) => {
        const fileContents = await getRawReportContent(id);
        if (!fileContents) return null;

        const matterResult = matter(fileContents);

        return {
            id,
            ...(matterResult.data as { 
                date: string, 
                title: string, 
                genre: string, 
                excerpt: string,
                target_pair: string,
                prediction_direction: string,
                result: string,
                recommended_broker: string
            }),
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
        date: string, 
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
    const sectionTitleRegex = /## 5\. AI結論とアクションプラン/i;
    const sectionIndex = contentBeforeJson.search(sectionTitleRegex);
    
    let conclusionText = "";
    let nextSteps: string[] = [];

    if (sectionIndex !== -1) {
        const sectionContent = contentBeforeJson.substring(sectionIndex);
        const summaryMatch = sectionContent.match(/- 結論サマリー: (.*?)\n/i) || sectionContent.match(/## 5\. AI結論とアクションプラン\n(.*?)\n/i);
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
        date: data.date,
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

export async function getLatestSignals() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/noriyuki007/synapse-capital-frontend/main/content/latest-signals.json');
        if (response.ok) return await response.json();
    } catch (e) {
        console.error("Failed to fetch latest signals in Edge Runtime:", e);
    }
    
    return {
        FX: { pair: "USD/JPY", status: "BUY", comment: "...", entry: "---", tp: "---", sl: "---", reliability: "LOW" },
        STOCKS: { pair: "S&P 500", status: "BUY", comment: "...", entry: "---", tp: "---", sl: "---", reliability: "LOW" },
        CRYPTO: { pair: "BTC/USD", status: "BUY", comment: "...", entry: "---", tp: "---", sl: "---", reliability: "LOW" }
    };
}
