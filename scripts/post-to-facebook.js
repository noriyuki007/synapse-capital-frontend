const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Facebook Auto-Poster for Synapse Capital
 * Posts the latest report to the configured Facebook page.
 */

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;
const BASE_URL = 'https://synapsecapital.net';

async function postToMakeWebhook() {
    if (!MAKE_WEBHOOK_URL) {
        console.log('MAKE_WEBHOOK_URL not configured. Skipping post.');
        return;
    }

    const reportsDir = path.join(__dirname, '../content/reports');
    if (!fs.existsSync(reportsDir)) return;

    const files = fs.readdirSync(reportsDir)
        .filter(f => f.endsWith('.md'))
        .map(f => ({
            name: f,
            path: path.join(reportsDir, f)
        }))
        .sort((a, b) => b.name.localeCompare(a.name));

    if (files.length === 0) return;

    const latestReport = files[0];
    const slug = latestReport.name.replace('.md', '');
    const url = `${BASE_URL}/ja/reports/${slug}/`;
    
    // Read markdown to get basic metadata
    const content = fs.readFileSync(latestReport.path, 'utf8');
    const titleMatch = content.match(/title:\s*"(.*?)"/);
    const genreMatch = content.match(/genre:\s*"(.*?)"/);
    
    const title = titleMatch ? titleMatch[1] : '最新のマーケットレポート';
    const genre = genreMatch ? genreMatch[1] : 'MARKET';

    console.log(`Sending data to Make Webhook: ${title}`);

    const postData = JSON.stringify({
        title: title,
        url: url,
        genre: genre,
        message: `【最新レポート更新】\n${title}\n\nAIによる最新のマーケット分析を公開しました。詳細はサイトをご確認ください。\n\n${url}`
    });

    const parsedUrl = new URL(MAKE_WEBHOOK_URL);
    const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };

    const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log('Successfully sent data to Make Webhook!');
            } else {
                console.error(`Failed to send data to Make. Status: ${res.statusCode}`);
                console.error(responseBody);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.write(postData);
    req.end();
}

postToMakeWebhook();
