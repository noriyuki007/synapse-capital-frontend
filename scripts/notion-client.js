import https from 'https';

/**
 * Fetch news from Notion DB.
 * @param {Object} options
 * @param {string[]} [options.importance] - e.g. ['★★★★', '★★★★★']. Default: all.
 * @param {number} [options.hoursWindow] - lookback window in hours. Default: 24.
 * @param {number} [options.pageSize] - per-request page size (max 100). Default: 50.
 * @param {number} [options.maxPages] - safety cap on pagination. Default: 5.
 * @returns {Promise<Array>} Normalized array. Empty array on any error.
 */
async function fetchNotionNews(options = {}) {
  const {
    importance = [],
    hoursWindow = 24,
    pageSize = 50,
    maxPages = 5
  } = options;

  const apiKey = process.env.NOTION_API_KEY;
  const dbId = process.env.NOTION_DB_ID;

  if (!apiKey || !dbId) {
    console.log('[notion] NOTION_API_KEY or NOTION_DB_ID not set');
    return [];
  }

  const results = [];
  let nextCursor = undefined;
  let pageCount = 0;

  try {
    while (pageCount < maxPages) {
      const response = await queryNotion(dbId, apiKey, {
        importance,
        hoursWindow,
        pageSize,
        nextCursor
      });

      if (!response || !response.results) break;

      for (const page of response.results) {
        results.push(normalizePage(page));
      }

      if (!response.has_more) break;
      nextCursor = response.next_cursor;
      pageCount++;
    }
  } catch (err) {
    console.log(`[notion] Error: ${err.message}`);
    return [];
  }

  return results;
}

/**
 * Perform the actual HTTPS request to Notion API.
 */
function queryNotion(dbId, apiKey, params) {
  return new Promise((resolve) => {
    const { importance, hoursWindow, pageSize, nextCursor } = params;

    const filter = { and: [] };

    // Importance filter
    if (importance && importance.length > 0) {
      filter.and.push({
        or: importance.map(imp => ({
          property: '重要度',
          select: { equals: imp }
        }))
      });
    }

    // Time window filter (publishedAt on or after calculation)
    if (hoursWindow) {
      const targetDate = new Date(Date.now() - hoursWindow * 60 * 60 * 1000);
      filter.and.push({
        property: '公開日時',
        date: { on_or_after: targetDate.toISOString() }
      });
    }

    const body = JSON.stringify({
      filter: filter.and.length > 0 ? filter : undefined,
      sorts: [{ property: '公開日時', direction: 'descending' }],
      page_size: pageSize,
      start_cursor: nextCursor
    });

    const options = {
      hostname: 'api.notion.com',
      port: 443,
      path: `/v1/databases/${dbId}/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          console.log(`[notion] API Error: ${res.statusCode} ${data}`);
          return resolve(null);
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          console.log(`[notion] JSON Parse Error: ${e.message}`);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.log(`[notion] Request Error: ${e.message}`);
      resolve(null);
    });

    req.on('timeout', () => {
      req.destroy();
      console.log('[notion] Request Timeout');
      resolve(null);
    });

    req.write(body);
    req.end();
  });
}

/**
 * Normalize Notion page object to NewsItem schema.
 */
function normalizePage(page) {
  const props = page.properties || {};

  const getRichText = (prop) => {
    if (!prop || !prop.rich_text) return '';
    return prop.rich_text.map(t => t.plain_text).join('');
  };

  const getTitle = (prop) => {
    if (!prop || !prop.title) return '';
    return prop.title.map(t => t.plain_text).join('');
  };

  const getSelect = (prop) => prop?.select?.name || '';
  const getMultiSelect = (prop) => (prop?.multi_select || []).map(s => s.name);
  const getDate = (prop) => prop?.date?.start || '';
  const getUrl = (prop) => prop?.url || '';

  const importance = getSelect(props['重要度']);

  return {
    id: page.id,
    title: getTitle(props['title']),
    source: getSelect(props['情報ソース']),
    sourceUrl: getUrl(props['動画URL']) || getUrl(props['URL']) || '',
    coreMessage: getRichText(props['結論・コアメッセージ']),
    actionableAdvice: getRichText(props['初心者向けアクション']),
    publishedAt: getDate(props['公開日時']),
    updatedAt: getDate(props['更新日時']) || page.last_edited_time || '',
    importance: importance,
    importanceLevel: importance.length,
    markets: getMultiSelect(props['ターゲット市場']),
    assetClasses: getMultiSelect(props['アセットクラス']),
    categories: getMultiSelect(props['情報の種類']),
    sentiment: getSelect(props['センチメント']),
    freshness: getSelect(props['情報の鮮度']),
    keywords: getRichText(props['キーワード'])
  };
}

export { fetchNotionNews };
