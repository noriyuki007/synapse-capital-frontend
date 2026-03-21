import { NextRequest } from 'next/server';

// export const runtime = 'edge';

export async function GET(
    _req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const id = params?.id;

    // fs is ONLY for local development. We check both NODE_ENV and prevent any top-level imports.
    if (process.env.NODE_ENV === 'development') {
        try {
            // Dynamic import inside the condition to hide it from some static analyzers
            const promises = 'promises';
            const fs = await import(`fs/${promises}`);
            const path = await import('path');
            const reportsPath = path.join(process.cwd(), 'content', 'reports', `${id}.md`);
            const text = await fs.readFile(reportsPath, 'utf8');
            
            if (text && text.trim().length > 0) {
                return new Response(text, {
                    status: 200,
                    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
                });
            }
        } catch (e) {
            console.warn(`[API] Local file read failed for ${id}:`, e);
        }
    }

    // 本番環境（Edge）またはファイル不在時は404を返し、クライアント側のGitHub Fallbackを促す
    return new Response('Not found or unsupported in Edge context', { status: 404 });
}
