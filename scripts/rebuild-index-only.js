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
        
        index.push({
            id: id,
            date: data.date,
            title: data.title,
            genre: data.genre,
            target_pair: data.target_pair,
            prediction_direction: data.prediction_direction,
            recommended_broker: data.recommended_broker,
            excerpt: data.excerpt,
            result: data.result || 'PENDING'
        });
    });

    index.sort((a, b) => (a.date < b.date ? 1 : -1));
    if (index.length > 100) index = index.slice(0, 100);

    fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
    console.log('✅ Index rebuilt successfully.');
}

rebuild();
