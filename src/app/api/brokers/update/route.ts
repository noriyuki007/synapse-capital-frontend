import { NextResponse } from 'next/server';
export const runtime = 'edge';
// Note: fs/path will not work in Edge runtime. This API is intended for local use.

/**
 * ブローカー評価データの更新を受け取るAPIエンドポイント
 * 外部スクリプトからのPOSTリクエストを受け取り、ローカルのJSONファイルを更新します。
 */
export async function POST(request: Request) {
    try {
        const data = await request.json();
        
        // 保存先のパス確定 (src/lib/broker-data.json)
        const filePath = path.join(process.cwd(), 'src/lib/broker-data.json');
        
        // ファイルに書き込み
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        
        console.log(`[API] Broker data updated via upload: ${data.length} brokers`);
        
        return NextResponse.json({ 
            success: true, 
            message: 'Broker data updated successfully',
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
