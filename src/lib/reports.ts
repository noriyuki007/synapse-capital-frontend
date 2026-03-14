import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const reportsDirectory = path.join(process.cwd(), 'content/reports');

export async function getSortedReportsData() {
    if (!fs.existsSync(reportsDirectory)) {
        return [];
    }
    const fileNames = fs.readdirSync(reportsDirectory);
    const allReportsData = await Promise.all(fileNames.map(async (fileName) => {
        const id = fileName.replace(/\.md$/, '');
        const fullPath = path.join(reportsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
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

    return allReportsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

export async function getReportData(id: string) {
    const fullPath = path.join(reportsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
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

    return {
        id,
        contentHtml,
        signalData: signalData,
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
    const filePath = path.join(process.cwd(), 'content/latest-signals.json');
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return {
        FX: { pair: "USD/JPY", status: "BUY", comment: "...", entry: "---", tp: "---", sl: "---", reliability: "LOW" },
        STOCKS: { pair: "S&P 500", status: "BUY", comment: "...", entry: "---", tp: "---", sl: "---", reliability: "LOW" },
        CRYPTO: { pair: "BTC/USD", status: "BUY", comment: "...", entry: "---", tp: "---", sl: "---", reliability: "LOW" }
    };
}
