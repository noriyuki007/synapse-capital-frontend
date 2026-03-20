import fs from 'fs/promises';
import path from 'path';
import { NextRequest } from 'next/server';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const reportsPath = path.join(process.cwd(), 'content', 'reports', `${id}.md`);

    try {
        const text = await fs.readFile(reportsPath, 'utf8');
        if (!text || text.trim().length === 0) {
            return new Response('', { status: 404 });
        }

        return new Response(text, {
            status: 200,
            headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
        });
    } catch {
        return new Response('', { status: 404 });
    }
}

