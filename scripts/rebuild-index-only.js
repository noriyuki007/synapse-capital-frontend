import fs from 'fs';
import matter from 'gray-matter';

const REPORTS_DIR = './content/reports';
const INDEX_PATH = './content/reports-index.json';

function rebuild() {
    console.log('Rebuilding index from filesystem...');
    const files = fs.readdirSync(REPORTS_DIR).filter(f => f.endsWith('.md'));
    let index = [];

    files.forEach(file => {
        const content = fs.readFileSync(`${REPORTS_DIR}/${file}`, 'utf8');
        const { data } = matter(content);
        const id = file.replace('.md', '');
        const localeMatch = file.match(/[-.](ja|en)\.md$/i);
        const locale = localeMatch ? localeMatch[1].toLowerCase() : 'ja';
        
        index.push({
            id: id,
            date: data.date ? String(data.date).trim() : id.substring(0, 10),
            title: (data.title || '').trim(),
            genre: (data.genre || '').trim().toUpperCase(),
            target_pair: (data.target_pair || '').trim(),
            prediction_direction: (data.prediction_direction || 'FLAT').trim(),
            recommended_broker: (data.recommended_broker || '').trim(),
            excerpt: (data.excerpt || '').trim(),
            result: (data.result || 'PENDING').trim(),
            locale: locale
        });
    });

    index.sort((a, b) => (a.date < b.date ? 1 : -1));
    if (index.length > 100) index = index.slice(0, 100);

    fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
    console.log('✅ Index rebuilt successfully.');
}

rebuild();
