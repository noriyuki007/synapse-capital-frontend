import fs from 'fs';
import path from 'path';

/**
 * Automated Result Evaluator
 * Strategy 1: TP/SL evaluation via Twelve Data (precise)
 * Strategy 2: Direction-based evaluation via Yahoo Finance (fallback, no API key needed)
 *
 * Direction-based: If prediction was UP and price moved up from entry -> HIT
 *                  Reports older than 24h get evaluated with direction-based fallback
 */

const INDEX_PATH = './content/reports-index.json';
const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;

async function fetchPriceHistory(symbol, date) {
    if (!TWELVE_DATA_KEY) return [];

    const cleanSym = symbol.replace('=X', '').replace('^', '').replace('/', '');
    const startDate = new Date(date).toISOString().split('T')[0];
    const url = `https://api.twelvedata.com/time_series?symbol=${cleanSym}&interval=1h&start_date=${startDate}&apikey=${TWELVE_DATA_KEY}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        const data = await res.json();

        if (data.status !== 'ok') {
            console.warn(`[${cleanSym}] Twelve Data Error: ${data.message}`);
            return [];
        }

        return data.values.map(v => ({
            high: parseFloat(v.high),
            low: parseFloat(v.low),
            close: parseFloat(v.close)
        })).reverse();

    } catch (e) {
        console.error(`Failed to fetch history for ${symbol}:`, e.message);
        return [];
    }
}

/**
 * Fallback: fetch current price from Yahoo Finance (no API key needed)
 */
async function fetchCurrentPriceYahoo(symbol) {
    const yahooSymMap = {
        'USD/JPY': 'USDJPY=X',
        'EUR/USD': 'EURUSD=X',
        'GBP/USD': 'GBPUSD=X',
        'S&P 500': '^GSPC',
        'BTC/USD': 'BTC-USD',
    };
    const yahooSym = yahooSymMap[symbol] || symbol.replace('/', '');

    try {
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSym}?interval=1d&range=2d`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SynapseBot/1.0)' }
        });
        if (!res.ok) return null;
        const data = await res.json();
        const result = data.chart?.result?.[0];
        if (!result) return null;

        const closes = result.indicators?.quote?.[0]?.close?.filter(c => c != null);
        if (!closes || closes.length === 0) return null;

        return {
            currentPrice: closes[closes.length - 1],
            previousClose: closes.length > 1 ? closes[closes.length - 2] : null,
        };
    } catch (e) {
        console.error(`Yahoo fetch failed for ${symbol}:`, e.message);
        return null;
    }
}

/**
 * Direction-based evaluation:
 * BUY/UP prediction -> current price > entry price = HIT
 * SELL/DOWN prediction -> current price < entry price = HIT
 * NEUTRAL/FLAT -> skip (remain PENDING)
 */
function evaluateByDirection(signal, currentPrice, entry) {
    const direction = signal.status?.toUpperCase();
    if (!direction || direction === 'NEUTRAL') return null;

    if (direction === 'BUY') {
        return currentPrice > entry ? 'HIT' : 'MISS';
    } else if (direction === 'SELL') {
        return currentPrice < entry ? 'HIT' : 'MISS';
    }
    return null;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    if (!fs.existsSync(INDEX_PATH)) return;

    let index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
    let updatedCount = 0;

    const pendingItems = index.filter(item => item.result === 'PENDING');
    const evaluatedKeys = new Map();

    // Determine which items are old enough for direction-based fallback (>24h)
    const now = Date.now();
    const EVAL_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

    let twelveDataCallCount = 0;

    for (let i = 0; i < pendingItems.length; i++) {
        const item = pendingItems[i];
        const baseKey = item.id.replace(/-(ja|en)$/, '');

        // Reuse cached result for locale variant
        if (evaluatedKeys.has(baseKey)) {
            const cached = evaluatedKeys.get(baseKey);
            if (cached.result) {
                item.result = cached.result;
                updatedCount++;
                console.log(`♻️ ${item.id} -> ${cached.result} (reused from ${baseKey})`);
            }
            continue;
        }

        // Read report for signal data
        const reportPath = path.join('./content/reports', `${item.id}.md`);
        if (!fs.existsSync(reportPath)) continue;

        const content = fs.readFileSync(reportPath, 'utf8');
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (!jsonMatch) continue;

        try {
            const signal = JSON.parse(jsonMatch[1]);
            const entry = parseFloat(signal.entry);
            const tp = parseFloat(signal.tp);
            const sl = parseFloat(signal.sl);

            if (isNaN(entry)) continue;

            const reportDate = new Date(item.date).getTime();
            const ageMs = now - reportDate;
            let evalResult = null;

            // Strategy 1: Precise TP/SL evaluation via Twelve Data (if available and within rate limit)
            if (TWELVE_DATA_KEY && !isNaN(tp) && !isNaN(sl) && twelveDataCallCount < 6) {
                const sym = item.id.includes('fx') ? `${signal.pair.replace('/', '')}=X` : signal.pair;
                const history = await fetchPriceHistory(sym, item.date);
                twelveDataCallCount++;

                if (history.length > 0) {
                    for (let bar of history) {
                        if (signal.status === 'BUY') {
                            if (bar.high >= tp) { evalResult = 'HIT'; break; }
                            if (bar.low <= sl) { evalResult = 'MISS'; break; }
                        } else if (signal.status === 'SELL') {
                            if (bar.low <= tp) { evalResult = 'HIT'; break; }
                            if (bar.high >= sl) { evalResult = 'MISS'; break; }
                        }
                    }
                }

                // Rate limit delay
                if (twelveDataCallCount < 6) {
                    await sleep(8000);
                }
            }

            // Strategy 2: Direction-based fallback for reports older than 24h
            if (!evalResult && ageMs > EVAL_THRESHOLD_MS) {
                const yahoo = await fetchCurrentPriceYahoo(signal.pair);
                if (yahoo?.currentPrice != null) {
                    evalResult = evaluateByDirection(signal, yahoo.currentPrice, entry);
                    if (evalResult) {
                        console.log(`📊 ${item.id} -> ${evalResult} (direction: entry=${entry}, current=${yahoo.currentPrice.toFixed(2)}, status=${signal.status})`);
                    }
                }
                await sleep(1000); // Gentle rate limit for Yahoo
            }

            if (evalResult) {
                item.result = evalResult;
                updatedCount++;
                console.log(`${evalResult === 'HIT' ? '✅' : '❌'} ${item.id} -> ${evalResult}`);
            }

            evaluatedKeys.set(baseKey, { result: evalResult });

        } catch (e) {
            console.error(`Evaluation failed for ${item.id}:`, e.message);
        }
    }

    if (updatedCount > 0) {
        fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
        console.log(`Updated ${updatedCount} results.`);
    } else {
        console.log("No new results to update.");
    }
}

main();
