import fs from 'fs';
import path from 'path';

/**
 * Automated Result Evaluator
 * Compares AI predicted Entry/TP/SL vs Real Market Data (via Yahoo/TwelveData/FMP)
 */

const INDEX_PATH = './content/reports-index.json';
const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;

async function fetchPriceHistory(symbol, date) {
    // For simplicity, we use the Yahoo Finance Query API as it's free and reliable for history
    const yahooSym = symbol.replace('/', '');
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSym}?period1=${Math.floor(new Date(date).getTime()/1000)}&period2=${Math.floor(Date.now()/1000)}&interval=1h`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        const prices = data.chart?.result?.[0]?.indicators?.quote?.[0];
        if (!prices) return [];
        return prices.high.map((h, i) => ({ high: h, low: prices.low[i] })).filter(p => p.high !== null);
    } catch (e) {
        console.error(`Failed to fetch history for ${symbol}:`, e.message);
        return [];
    }
}

async function main() {
    if (!fs.existsSync(INDEX_PATH)) return;

    let index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
    let updatedCount = 0;

    for (let item of index) {
        if (item.result !== 'PENDING') continue;

        console.log(`Evaluating ${item.id}...`);
        
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
                item.result = 'HIT';
                updatedCount++;
                console.log(`✅ ${item.id} -> HIT`);
            } else if (missed) {
                item.result = 'MISS';
                updatedCount++;
                console.log(`❌ ${item.id} -> MISS`);
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
