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

    // Extract AI Conclusion & Next Steps using regex
    const conclusionMatch = matterResult.content.match(/## 5\. AI結論とアクションプラン\n- 結論サマリー: ([\s\S]*?)\n- Next Step:\n([\s\S]*?)(?=\n##|$)/i) || 
                            matterResult.content.match(/## 5\. AI結論とアクションプラン\n([\s\S]*?)(?=\n##|$)/i);
    
    let conclusionText = "";
    let nextSteps: string[] = [];

    if (conclusionMatch) {
        const fullBlock = conclusionMatch[0];
        const textMatch = fullBlock.match(/- 結論サマリー: (.*?)\n/i) || fullBlock.match(/## 5\. AI結論とアクションプラン\n(.*?)\n/i);
        conclusionText = textMatch ? textMatch[1].trim() : "";
        
        const stepsMatch = fullBlock.match(/- Next Step:\n([\s\S]*?)$/i);
        if (stepsMatch) {
            nextSteps = stepsMatch[1].trim().split('\n').map(s => s.replace(/^[•\-\*]\s*/, '').trim());
        } else {
            // Fallback: search for any bullets in the block
            nextSteps = fullBlock.split('\n').filter(l => l.trim().match(/^[•\-\*]\s+/)).map(s => s.replace(/^[•\-\*]\s*/, '').trim());
        }
    }

    // Default fallbacks if parsing fails
    if (conclusionText === "") conclusionText = "現在の市場環境に基づき、AIは慎重かつ戦略的な取引を推奨します。";
    if (nextSteps.length === 0) nextSteps = ["主要なサポート・レジスタンスラインの監視", "経済指標発表時のボラティリティ警戒", "資金管理の徹底とリスク分散"];

    return {
        id,
        contentHtml,
        signalData: signalData,
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
