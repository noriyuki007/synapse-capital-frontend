import { NextResponse } from 'next/server';
// Note: This API is intended for local use.

/**
 * ブローカー評価データの更新を受け取るAPIエンドポイント
 * 外部スクリプトからのPOSTリクエストを受け取り、ローカルのJSONファイルを更新します。
 */
export async function POST(request: Request) {
    try {
        // Note: Writing to the filesystem is not possible in Cloudflare Pages (Edge).
        // This API is intended for local development only.
        const data = await request.json();
        
        console.log(`[API] Broker data update requested in production: ${data.length} brokers (Action Skip)`);
        
        return NextResponse.json({ 
            success: true, 
            message: 'Broker data received (Update skipped in production/edge context)',
            count: data.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[API] Failed to update broker data:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to process update request' 
        }, { status: 500 });
    }
}
