import fs from 'fs';
import path from 'path';

/**
 * Automated Result Evaluator
 * Compares AI predicted Entry/TP/SL vs Real Market Data (via Yahoo/TwelveData/FMP)
 */

const INDEX_PATH = './content/reports-index.json';
const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;

async function fetchPriceHistory(symbol, date) {
    if (!TWELVE_DATA_KEY) {
        console.warn("⚠️ TWELVE_DATA_API_KEY not found. Skipping evaluation.");
        return [];
    }

    // Map Yahoo/Report symbols (e.g. USDJPY=X) to Twelve Data format (e.g. USDJPY) 
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

        // Return values mapped to high/low format for the evaluator
        return data.values.map(v => ({
            high: parseFloat(v.high),
            low: parseFloat(v.low),
            close: parseFloat(v.close)
        })).reverse(); // Oldest to newest

    } catch (e) {
        console.error(`Failed to fetch history for ${symbol}:`, e.message);
        return [];
    }
}

async function main() {
    if (!fs.existsSync(INDEX_PATH)) return;

    let index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
    let updatedCount = 0;

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const pendingItems = index.filter(item => item.result === 'PENDING');

    // Track evaluated date-genre combos to avoid duplicate API calls for ja/en variants
    const evaluatedKeys = new Map(); // "2026-03-30-fx" -> { result, signal }

    for (let i = 0; i < pendingItems.length; i++) {
        const item = pendingItems[i];
        console.log(`Evaluating [${i+1}/${pendingItems.length}] ${item.id}...`);

        // Derive the base key (strip locale suffix) to detect ja/en duplicates
        const baseKey = item.id.replace(/-(ja|en)$/, '');

        // If we already evaluated the other locale variant, reuse its result
        if (evaluatedKeys.has(baseKey)) {
            const cached = evaluatedKeys.get(baseKey);
            if (cached.result) {
                item.result = cached.result;
                updatedCount++;
                console.log(`♻️ ${item.id} -> ${cached.result} (reused from ${baseKey})`);
            }
            continue;
        }

        // Read the report file to get Entry/TP/SL
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

            if (isNaN(entry) || isNaN(tp) || isNaN(sl)) continue;

            const history = await fetchPriceHistory(item.id.includes('fx') ? `${signal.pair.replace('/', '')}=X` : signal.pair, item.date);

            let evalResult = null;
            if (history.length > 0) {
                let hit = false;
                let missed = false;

                for (let bar of history) {
                    if (signal.status === 'BUY') {
                        if (bar.high >= tp) { hit = true; break; }
                        if (bar.low <= sl) { missed = true; break; }
                    } else if (signal.status === 'SELL') {
                        if (bar.low <= tp) { hit = true; break; }
                        if (bar.high >= sl) { missed = true; break; }
                    }
                }

                if (hit) {
                    evalResult = 'HIT';
                    item.result = 'HIT';
                    updatedCount++;
                    console.log(`✅ ${item.id} -> HIT`);
                } else if (missed) {
                    evalResult = 'MISS';
                    item.result = 'MISS';
                    updatedCount++;
                    console.log(`❌ ${item.id} -> MISS`);
                }
            }

            // Cache result so the other locale variant can reuse it
            evaluatedKeys.set(baseKey, { result: evalResult });

            // Respect Twelve Data Rate Limit (8/min) -> ~8s delay
            if (i < pendingItems.length - 1) {
                console.log(`[Rate Limit] Waiting 8s for next evaluation...`);
                await sleep(8000);
            }
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
