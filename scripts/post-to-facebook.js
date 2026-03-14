const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Facebook Auto-Poster for Synapse Capital
 * Posts the latest report to the configured Facebook page.
 */

const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const BASE_URL = 'https://synapsecapital.net';

async function postToFacebook() {
    if (!FB_PAGE_ID || !FB_ACCESS_TOKEN) {
        console.log('Facebook credentials not configured. Skipping auto-post.');
        return;
    }

    const reportsDir = path.join(__dirname, '../content/reports');
    if (!fs.existsSync(reportsDir)) return;

    const files = fs.readdirSync(reportsDir)
        .filter(f => f.endsWith('.md'))
        .map(f => ({
            name: f,
            path: path.join(reportsDir, f),
            mtime: fs.statSync(path.join(reportsDir, f)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

    if (files.length === 0) return;

    const latestReport = files[0];
    const slug = latestReport.name.replace('.md', '');
    const url = `${BASE_URL}/ja/reports/${slug}/`;
    
    // Read markdown to get title
    const content = fs.readFileSync(latestReport.path, 'utf8');
    const titleMatch = content.match(/title:\s*"(.*?)"/);
    const title = titleMatch ? titleMatch[1] : '最新のマーケットレポート';

    console.log(`Preparing to post to Facebook: ${title}`);

    const message = `【最新レポート更新】\n${title}\n\nAIによる最新のマーケット分析を公開しました。詳細はサイトをご確認ください。\n\n${url}`;

    const postData = JSON.stringify({
        message: message,
        link: url,
        access_token: FB_ACCESS_TOKEN
    });

    const options = {
        hostname: 'graph.facebook.com',
        path: `/v19.0/${FB_PAGE_ID}/feed`,
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
            if (res.statusCode === 200) {
                console.log('Successfully posted to Facebook!');
            } else {
                console.error(`Failed to post to Facebook. Status: ${res.statusCode}`);
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

postToFacebook();
