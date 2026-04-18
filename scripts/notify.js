/**
 * sc-frontend/scripts/notify.js
 * LINE Messaging API (Bot Push) notification utility.
 */

const message = process.argv[2];
const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const userId = process.env.LINE_USER_ID;

if (!message) {
  console.error('Usage: node notify.js "<message>"');
  process.exit(1);
}

if (!token || !userId) {
  console.warn('LINE credentials not set. Skipping notification.');
  process.exit(0);
}

async function main() {
  try {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: 'text', text: message }],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`LINE API error: ${res.status} - ${body}`);
      process.exit(1);
    }

    console.log('Notification sent.');
  } catch (error) {
    console.error('Failed to send notification:', error.message);
    process.exit(1);
  }
}

main();
