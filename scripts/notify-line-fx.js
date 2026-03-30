import fs from 'fs';

/**
 * FX LINE Alert - Sends FX trading signals via LINE Messaging API
 * Triggered by: .github/workflows/fx-line-alert.yml
 * Schedule: Weekdays 6x daily (JST 09:00, 13:00, 17:00, 21:00, 01:00, 05:00)
 */

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_USER_ID = process.env.LINE_USER_ID;
const SIGNALS_PATH = './content/latest-signals-ja.json';
const BASE_URL = 'https://synapsecapital.net';

async function sendLineMessage(message) {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
            to: LINE_USER_ID,
            messages: [{ type: 'text', text: message }],
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`LINE API error: ${res.status} - ${body}`);
    }
}

function buildFxAlertMessage(signal) {
    const directionEmoji = {
        BUY: '\u{1F7E2}', // green circle
        SELL: '\u{1F534}', // red circle
        NEUTRAL: '\u{1F7E1}', // yellow circle
    };

    const emoji = directionEmoji[signal.status] || '\u{1F7E1}';
    const reportUrl = `${BASE_URL}/ja/reports/`;

    return [
        `${emoji} FX Alert: ${signal.pair}`,
        ``,
        `Signal: ${signal.status}`,
        `Direction: ${signal.prediction_direction}`,
        `Entry: ${signal.entry}`,
        `TP: ${signal.tp}`,
        `SL: ${signal.sl}`,
        `Reliability: ${signal.reliability}`,
        ``,
        signal.comment,
        ``,
        `Details: ${reportUrl}`,
    ].join('\n');
}

async function main() {
    if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_USER_ID) {
        console.log('LINE credentials not configured. Skipping alert.');
        return;
    }

    if (!fs.existsSync(SIGNALS_PATH)) {
        console.error(`Signal file not found: ${SIGNALS_PATH}`);
        return;
    }

    let signals;
    try {
        signals = JSON.parse(fs.readFileSync(SIGNALS_PATH, 'utf8'));
    } catch (e) {
        console.error('Failed to parse signals file:', e.message);
        return;
    }

    const fxSignal = signals.FX;
    if (!fxSignal) {
        console.log('No FX signal found. Skipping.');
        return;
    }

    const message = buildFxAlertMessage(fxSignal);
    console.log('Sending FX alert via LINE...');
    console.log(message);

    await sendLineMessage(message);
    console.log('LINE FX alert sent successfully.');
}

main().catch(err => {
    console.error('Fatal error in LINE FX alert:', err.message);
    process.exit(1);
});
