// scripts/notify-line-fx.js

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_USER_ID = process.env.LINE_USER_ID;
const API_URL = 'https://synapse-capital-frontend.pages.dev/api/internal-top-picks?assetClass=FX';

// The threshold score required to trigger an alert
const ALERT_THRESHOLD = 80;

async function sendLineMessage(text) {
    if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_USER_ID) {
        console.warn('⚠️ LINE credentials missing. Cannot send message:');
        console.log(text);
        return;
    }

    const response = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
            to: LINE_USER_ID,
            messages: [
                {
                    type: 'text',
                    text: text
                }
            ]
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`LINE API Error: ${response.status} ${errText}`);
    }
    console.log('✅ Successfully sent message to LINE.');
}

async function main() {
    console.log(`🔍 Scanning FX markets via Deep Intel API...`);
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        
        const data = await res.json();
        const topPicks = data.topPicks || [];

        if (topPicks.length === 0) {
            console.log('No signals generated.');
            return;
        }

        // Filter for high confidence picks
        const validPicks = topPicks.filter(p => p.score >= ALERT_THRESHOLD);

        if (validPicks.length === 0) {
            console.log(`No signals met the confidence threshold of ${ALERT_THRESHOLD}. Highest was: ${topPicks[0].score}`);
            return;
        }

        console.log(`🚨 Found ${validPicks.length} signals above threshold. Sending alert...`);

        // Build the alert message
        let messageText = `⚡️ 【Synapse Deep Intel: FX アラート】\nAI確信度 ${ALERT_THRESHOLD} 以上の優位性が高いセットアップを検知しました。\n\n`;

        validPicks.forEach((pick, index) => {
            const isBuy = pick.signal.decision === 'BUY';
            messageText += `[${index + 1}] ${pick.symbol} (${isBuy ? 'LONG 📈' : 'SHORT 📉'})\n`;
            messageText += `確率: ${pick.score}%\n`;
            messageText += `ENTRY: ${pick.signal.entry}\n`;
            messageText += `TP: ${pick.signal.tp} / SL: ${pick.signal.sl}\n`;
            messageText += `理由: ${pick.signal.summary}\n`;
            messageText += `--------------------------\n`;
        });

        messageText += `\n詳細確認: https://synapse-capital-frontend.pages.dev/private-cockpit-x92j`;

        await sendLineMessage(messageText.trim());

    } catch (error) {
        console.error('❌ Failed to execute alert task:', error.message);
        process.exit(1);
    }
}

main();
