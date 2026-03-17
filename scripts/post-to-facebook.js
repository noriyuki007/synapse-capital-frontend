import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Facebook Auto-Poster for Synapse Capital
 * Posts today's reports to the configured Facebook page.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;
const BASE_URL = 'https://synapsecapital.net';

async function postToMakeWebhook() {
    if (!MAKE_WEBHOOK_URL) {
        console.log('MAKE_WEBHOOK_URL not configured. Skipping post.');
        return;
    }

    const reportsDir = path.join(__dirname, '../content/reports');
    if (!fs.existsSync(reportsDir)) {
        console.error('Reports directory not found.');
        return;
    }

    const jstDate = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));
    const today = jstDate.toISOString().split('T')[0];
    console.log(`Checking for reports on date: ${today} (JST)`);
    
    // 1. Check for today's reports
    let targetDate = today;
    let reportsToPost = fs.readdirSync(reportsDir)
        .filter(f => f.startsWith(today) && f.endsWith('.md'))
        .map(f => ({ name: f, path: path.join(reportsDir, f) }));

    // 2. Fallback logic: Find the most recent date with reports
    if (reportsToPost.length === 0) {
        console.log(`⚠️ No reports found for today (${today}). Searching for the most recent active date...`);
        
        const allFiles = fs.readdirSync(reportsDir)
            .filter(f => f.endsWith('.md'))
            .sort((a, b) => b.localeCompare(a)); // Sort descending (latest first)

        if (allFiles.length > 0) {
            // Get the date string from the latest file (e.g., "2026-03-15")
            const latestFile = allFiles[0];
            const dateMatch = latestFile.match(/^(\d{4}-\d{2}-\d{2})/);
            
            if (dateMatch) {
                targetDate = dateMatch[1];
                console.log(`ℹ️ Most recent reports found for date: ${targetDate}`);
                
                // Get ALL reports for that specific date to ensure all genres are covered
                reportsToPost = allFiles
                    .filter(f => f.startsWith(targetDate))
                    .map(f => ({ name: f, path: path.join(reportsDir, f) }));
            }
        }
    }

    if (reportsToPost.length === 0) {
        console.error('❌ No reports found to post (neither for today nor any past date).');
        return;
    }
    console.log(`🚀 Found ${reportsToPost.length} report(s) for ${targetDate} to process.`);

    for (const report of reportsToPost) {
        const slug = report.name.replace('.md', '');
        const url = `${BASE_URL}/ja/reports/${slug}/`;
        
        // Read markdown to get basic metadata
        const content = fs.readFileSync(report.path, 'utf8');
        const titleMatch = content.match(/title:\s*"(.*?)"/);
        const genreMatch = content.match(/genre:\s*"(.*?)"/);
        
        const title = titleMatch ? titleMatch[1] : '最新のマーケットレポート';
        const genre = genreMatch ? genreMatch[1] : 'MARKET';

        console.log(`Sending to Make Webhook [${genre}]: ${title}`);

        try {
            const response = await fetch(MAKE_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    url: url,
                    genre: genre,
                    message: `【最新レポート更新：${genre}】\n${title}\n\nAIによる最新のマーケット分析を公開しました。詳細はサイトをご確認ください。\n\n${url}`
                })
            });

            if (response.ok) {
                console.log(`Successfully posted ${genre} report.`);
            } else {
                console.error(`Failed to post ${genre}. Status: ${response.status}`);
                const text = await response.text();
                console.error(text);
            }
        } catch (error) {
            console.error(`Error posting ${genre}:`, error.message);
        }
    }
}

postToMakeWebhook().catch(err => {
    console.error('Fatal error in auto-poster:', err);
    process.exit(1);
});
