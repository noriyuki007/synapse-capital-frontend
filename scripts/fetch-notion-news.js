import fs from 'fs';
import path from 'path';
import { fetchNotionNews } from './notion-client.js';

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  console.log(`[fetch-notion-news] Starting fetch... ${isDryRun ? '(DRY RUN)' : ''}`);

  // Fetch news: Defaulting to ★3 or higher in the last 24 hours
  const news = await fetchNotionNews({
    importance: ['★★★', '★★★★', '★★★★★'],
    hoursWindow: 24
  });

  console.log(`[fetch-notion-news] Fetched ${news.length} items`);

  if (isDryRun) {
    if (news.length > 0) {
      console.log('[fetch-notion-news] Top 3 items (dry-run):');
      news.slice(0, 3).forEach((item, i) => {
        console.log(`  ${i + 1}. [${item.importance}] ${item.title}`);
      });
    }
  } else {
    const outputPath = path.resolve('content/notion-news.json');
    const outputDir = path.dirname(outputPath);

    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, JSON.stringify(news, null, 2), 'utf8');
      console.log(`[fetch-notion-news] wrote ${news.length} items to ${outputPath}`);
    } catch (err) {
      console.log(`[fetch-notion-news] Failed to write JSON: ${err.message}`);
    }
  }
}

main().catch(err => {
  console.log(`[fetch-notion-news] Fatal Error: ${err.message}`);
});
