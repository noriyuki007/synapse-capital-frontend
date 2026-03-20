import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * レポートの生コンテンツを取得するAPI
 * Cloudflare Pages (Edge) 環境ではファイルシステム(fs)が利用できないため、
 * このAPIは主にローカル開発環境での即時反映用として機能します。
 * 本番環境では src/lib/reports.ts の GitHub Fallback が優先されます。
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Edge環境でのビルドエラーを防ぐため、fsは実行時にインポートを試みる（ローカルのみ成功想定）
    if (process.env.NODE_ENV === 'development') {
        try {
            const fs = await import('fs/promises');
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
