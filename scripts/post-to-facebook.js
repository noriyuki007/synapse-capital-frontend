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
            const latestFile = allFiles[0];
            const dateMatch = latestFile.match(/^(\d{4}-\d{2}-\d{2})/);
            
            if (dateMatch) {
                targetDate = dateMatch[1];
                console.log(`ℹ️ Most recent reports found for date: ${targetDate}`);
                
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
    console.log(`📋 Found ${reportsToPost.length} report(s) for ${targetDate}.`);

    // Group reports by genre, then randomly select 1 genre and post both ja/en versions
    const genreRegex = /^\d{4}-\d{2}-\d{2}-([a-zA-Z0-9]+)[-.](ja|en)\.md$/i;
    const genreGroups = {};
    for (const r of reportsToPost) {
        const m = r.name.match(genreRegex);
        const genre = m ? m[1].toLowerCase() : 'unknown';
        if (!genreGroups[genre]) genreGroups[genre] = [];
        genreGroups[genre].push(r);
    }

    const genres = Object.keys(genreGroups);
    const selectedGenre = genres[Math.floor(Math.random() * genres.length)];
    const selectedReports = genreGroups[selectedGenre];
    console.log(`🎲 Selected genre: ${selectedGenre.toUpperCase()} (${selectedReports.length} locale(s))`);

    for (let i = 0; i < selectedReports.length; i++) {
        const report = selectedReports[i];
        // [Requirement 1] Extract locale (ja/en) and genre from filename
        // Matches e.g., 2026-03-21-fx.ja.md or 2026-03-21-crypto-en.md
        const filenameRegex = /^\d{4}-\d{2}-\d{2}-([a-zA-Z0-9]+)[-.](ja|en)\.md$/i;
        const match = report.name.match(filenameRegex);
        
        let extractedGenre = 'MARKET';
        let extractedLocale = 'ja';
        
        if (match) {
            extractedGenre = match[1].toUpperCase();
            extractedLocale = match[2].toLowerCase();
        } else {
            // Fallback for non-compliant filenames just in case
            const localeFallback = report.name.match(/[-.](ja|en)\.md$/i);
            if (localeFallback) extractedLocale = localeFallback[1].toLowerCase();
        }

        // Generate ID URL slug by stripping locale suffix
        const reportId = report.name.replace(/[-.](ja|en)\.md$/i, '').replace(/\.md$/i, '');
        const reportUrl = `${BASE_URL}/${extractedLocale}/reports/${reportId}/`;
        const GITHUB_REPO = process.env.GITHUB_REPOSITORY || 'noriyuki007/synapse-capital-frontend';

        // Read markdown to get basic metadata
        const content = fs.readFileSync(report.path, 'utf8');
        const titleMatch = content.match(/title:\s*"(.*?)"/);
        const genreMatch = content.match(/genre:\s*"(.*?)"/);
        const chartImageMatch = content.match(/chart_image:\s*"(.+?)"/);
        
        const title = titleMatch ? titleMatch[1] : (extractedLocale === 'ja' ? '最新のマーケットレポート' : 'Latest Market Report');
        const genre = genreMatch ? genreMatch[1] : extractedGenre;
        const chartImagePath = chartImageMatch ? chartImageMatch[1] : '';

        // GitHub Raw URLへの変換
        let imageUrl = '';
        if (chartImagePath) {
            const cleanPath = chartImagePath.startsWith('/') ? chartImagePath.slice(1) : chartImagePath;
            const repoFilePath = `public/${cleanPath}`;
            imageUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${repoFilePath}`;
        }

        // [Requirement 4] ログ出力の強化
        console.log(`🚀 Sending to Make [${genre} (${extractedLocale})]: ${title}`);
        console.log(`📸 Image URL: ${imageUrl}`);
        console.log(`🔗 Report URL: ${reportUrl}`);

        const message = extractedLocale === 'ja' 
            ? `【最新レポート更新：${genre}】\n${title}\n\nAIによる最新のマーケット解析を公開しました。詳細はサイトをご確認ください。\n\n${reportUrl}`
            : `【Market Report: ${genre}】\n${title}\n\nOur AI-driven market analysis has been updated. Check the full report on our terminal.\n\n${reportUrl}`;

        // [Requirement 2] Webhook送信処理 (Both languages loop over automatically since fs.readdirSync picks up all files)
        try {
            if (MAKE_WEBHOOK_URL) {
                const response = await fetch(MAKE_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: title,
                        content: content,
                        image_url: imageUrl,
                        url: reportUrl,
                        report_url: reportUrl,
                        genre: genre,
                        locale: extractedLocale, // [Requirement 3] Payloadへの追加
                        message: message,
                        status: "success"
                    })
                });

                if (response.ok) {
                    console.log(`✅ Successfully posted ${genre} (${extractedLocale}) report.`);
                } else {
                    const errorBody = await response.text();
                    console.error(`❌ Failed to post ${genre} (${extractedLocale}). Status: ${response.status}, Body: ${errorBody}`);
                }
            } else {
                console.log(`ℹ️ [Dry Run] Would POST: ${genre} (${extractedLocale}) -> ${reportUrl}`);
            }
        } catch (error) {
            console.error(`❌ Error posting ${genre} (${extractedLocale}):`, error.message);
        }
    }
}

postToMakeWebhook().catch(err => {
    console.error('Fatal error in auto-poster:', err);
    process.exit(1);
});
