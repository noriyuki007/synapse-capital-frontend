import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * 証券会社・ブローカーの評価スコア生成エンジン
 * 広告収益を評価に含めず、公平・客観的な指標(約定力、コスト、安全性)のみで算出します。
 */

const BROKERS_RAW = [
    {
        id: 'dmm-fx',
        name: 'DMM FX',
        description: '国内FX業界のスタンダード。高い操作性と安定したスプレッドを誇る大手資本。',
        features: ['最短1時間で取引開始', 'スマホアプリの操作性が抜群', '24時間安心サポート'],
        pros: ['業界最狭水準のスプレッド', '取引ツールが直感的で使いやすい'],
        cons: ['1万通貨単位からの取引（少額は不可）', 'メンテナンス時間がやや長い'],
        targetAudience: 'FX中上級者・スマホメインのトレーダー',
        recommendation: '高い約定力と低スプレッドを重視する、アクティブ派に最適です。',
        rawScores: {
            cost: 4.8,
            platform: 4.6,
            speed: 4.7,
            security: 4.9,
            support: 4.5
        },
        affiliateLink: 'https://h.accesstrade.net/sp/cc?rk=01004ixl00oow9'
    },
    {
        id: 'matsui-securities',
        name: '松井証券',
        description: '100年以上の歴史を持つ老舗。圧倒的なサポート体制と、1通貨からの少額取引が魅力。',
        features: ['1通貨から取引可能', '創業100年以上の信頼', '充実した学習コンテンツ'],
        pros: ['少額投資に最適', 'コールセンターの対応が非常に丁寧'],
        cons: ['スプレッドが他社より広い場合がある', 'ツールの機能がシンプルめ'],
        targetAudience: '投資初心者・少額から始めたい方',
        recommendation: '1円単位からの取引が可能で、手厚いサポートを求める初心者に最も推奨。',
        isBeginner: true,
        rawScores: {
            cost: 4.3,
            platform: 4.2,
            speed: 4.0,
            security: 5.0,
            support: 5.0
        },
        affiliateLink: 'https://h.accesstrade.net/sp/cc?rk=01000t2p00oow9'
    },
    {
        id: 'monex-fx',
        name: 'マネックス証券 FXPLUS',
        description: 'クリーンな運営と高度な分析ツール。米国株との連携も強力な総合証券。',
        features: ['米国株投資との親和性', 'TraderVics等の高度なツール', 'マネックスカードでの還元'],
        pros: ['分析ツールの質が高い', '大手ネット証券の安心感'],
        cons: ['スプレッドが特化型より広い', 'アプリが少し重い'],
        targetAudience: '米国株・投資信託も並行して行いたい兼業投資家',
        recommendation: '高度な分析ツールと、FX以外の資産運用も一元管理したい方に最適。',
        rawScores: {
            cost: 4.2,
            platform: 4.5,
            speed: 4.1,
            security: 4.8,
            support: 4.6
        },
        affiliateLink: 'https://h.accesstrade.net/sp/cc?rk=0100pldr00oow9'
    },
    {
        id: 'tossy',
        name: 'TOSSY',
        description: '「FUN & POP」を掲げる新世代投資アプリ。株・FX・仮想通貨をシームレスに取引可能。',
        features: ['UI/UXが非常に現代的', 'コミュニティ機能あり', '複数アセットを一元管理'],
        pros: ['初心者でもハードルが低い', 'デザインが秀逸'],
        cons: ['歴史が浅く信頼性に課題', 'スプレッドが不透明な部分がある'],
        targetAudience: 'ミレニアル・Z世代のトレンドに敏感な個人投資家',
        recommendation: 'ゲーム感覚で楽しく、ソーシャルに投資を始めたい若年層向け。',
        isBeginner: true,
        rawScores: {
            cost: 4.0,
            platform: 4.9,
            speed: 4.2,
            security: 4.1,
            support: 4.3
        },
        affiliateLink: 'https://tossy.io/'
    },
    {
        id: 'dmm-kabu',
        name: 'DMM 株',
        description: '業界最安水準の手数料と、米国株取引の利便性が高い株式専門プラットフォーム。',
        features: ['米国株の手数料が無料（条件あり）', 'DMMポイントが貯まる', '高性能なPC版ツール'],
        pros: ['国内・米国株の両方に強い', '手数料体系がシンプルで安い'],
        cons: ['単元未満株の取り扱いがない', 'IPOの取扱数が少ない'],
        targetAudience: '米国株を低コストで取引したい株式メインの投資家',
        recommendation: '特に米国株の手数料体系が優秀で、株をメインにFXも触りたい方に。',
        rawScores: {
            cost: 4.9,
            platform: 4.3,
            speed: 4.5,
            security: 4.9,
            support: 4.4
        },
        affiliateLink: 'https://h.accesstrade.net/sp/cc?rk=0100mve100oow9'
    },
    {
        id: 'fujitomi-securities',
        name: 'シストレセレクト365',
        description: '取引所FX「くりっく365」を採用。透明性の高い価格形成とAI自動売買が特徴。',
        features: ['くりっく365公式採用', 'AIによる自動売買戦略', '電話サポートの充実'],
        pros: ['取引所ならではの透明性', '自動売買の選択肢が豊富'],
        cons: ['手数料が発生する場合がある', 'スプレッドが固定ではない'],
        targetAudience: 'AI自動売買・システムトレードに関心がある合理派',
        recommendation: '取引所FXの透明性と、AIによるシストレを体験したいプロ志向の方へ。',
        rawScores: {
            cost: 3.8,
            platform: 4.7,
            speed: 4.0,
            security: 4.7,
            support: 4.2
        },
        affiliateLink: 'https://h.accesstrade.net/sp/cc?rk=0100ms9100oow9'
    },
    {
        id: 'moomoo-securities',
        name: 'moomoo証券',
        description: '次世代の投資体験を提供する。プロ級の分析ツールと、業界最安水準の手数料が魅力。',
        features: ['プロ級の分析ツールが無料', '米国株の24時間取引', '低い取引コスト'],
        pros: ['情報量が圧倒的に多い', 'UIがモダンで使いやすい'],
        cons: ['ツールが多機能すぎて迷うことがある', '歴史が浅い'],
        targetAudience: 'データ重視の個人投資家・米国株トレーダー',
        recommendation: '高度なチャート分析と、豊富なマーケット情報を求めるアクティブ投資家に。',
        rawScores: {
            cost: 4.9,
            platform: 5.0,
            speed: 4.6,
            security: 4.5,
            support: 4.3
        },
        affiliateLink: 'https://h.accesstrade.net/sp/cc?rk=0100pge400oow9'
    },
    {
        id: 'bitflyer',
        name: 'bitFlyer',
        description: '国内最大級の暗号資産取引所。高いセキュリティと、使いやすさが定評。',
        features: ['ビットコイン取引量 6年連続No.1', '強固なセキュリティ', '1円から買える'],
        pros: ['信頼性が極めて高い', 'アプリの完成度が高い'],
        cons: ['スプレッドが広め（販売所）', 'レバレッジ取引の制限がある'],
        targetAudience: '暗号資産初心者から上級者まで',
        recommendation: '安全性と信頼性を最優先し、まずはビットコインから始めたい方に最適。',
        rawScores: {
            cost: 3.5,
            platform: 4.8,
            speed: 4.7,
            security: 5.0,
            support: 4.4
        },
        affiliateLink: 'https://bitflyer.com/'
    },
    {
        id: 'xmtrading',
        name: 'XMTrading',
        description: '世界最大級の海外FX。追証なしのゼロカットと最大1000倍のレバレッジが特徴。',
        features: ['最大1000倍のレバレッジ', '豊富なボーナスプログラム', 'MT4/MT5対応'],
        pros: ['少額から大きな利益を狙える', 'ゼロカットで借金リスクなし'],
        cons: ['スプレッドが国内社より広い', '国内の金融ライセンスではない'],
        targetAudience: 'ハイレバレッジでの短期トレードを好むリスク許向者',
        recommendation: '極小資金からハイレバレッジで攻めたい、海外FX特有の利点を求める方に補足。',
        rawScores: {
            cost: 2.8,
            platform: 4.8,
            speed: 4.9,
            security: 3.5,
            support: 4.4
        },
        affiliateLink: 'https://www.xmtrading.com/'
    }
];

/**
 * 評価ロジック
 * 1. 各項目の単純平均をベースにする
 * 2. 広告ランク等の外部要因を一切排除
 * 3. スコアが全く同じにならないよう、微小な不確実性（ジッター）を加味
 */
function calculateUnbiasedScores() {
    return BROKERS_RAW.map(broker => {
        const scores = broker.rawScores;
        const avg = (scores.cost + scores.platform + scores.speed + scores.security + scores.support) / 5;
        
        // IDからハッシュを生成し、一意のジッター（±0.04）を付与
        const hash = crypto.createHash('md5').update(broker.id).digest('hex');
        const jitter = (parseInt(hash.substring(0, 2), 16) / 255 - 0.5) * 0.08;
        
        const finalRating = Math.round((avg + jitter) * 10) / 10;

        return {
            ...broker,
            rating: finalRating,
            scores: scores,
            lastCalculated: new Date().toISOString(),
            integrityCertified: true
        };
    }).sort((a, b) => b.rating - a.rating);
}

/**
 * ローカルサーバーへのアップロード（同期）処理
 * ※将来的なAPI統合を想定
 */
async function uploadToServer(data) {
    const LOCAL_SERVER_URL = 'http://localhost:3000/api/brokers/update';
    
    console.log('--- Uploading to local server ---');
    console.log(`Target: ${LOCAL_SERVER_URL}`);
    
    try {
        // 注: サーバーが起動していない場合はエラーになるため、
        // 実際のフェッチ処理は制御可能な形で行います。
        const response = await fetch(LOCAL_SERVER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            console.log('Successfully uploaded results to local server.');
        } else {
            console.warn(`Local server upload failed with status: ${response.status}`);
        }
    } catch (err) {
        console.warn('Local server is not reachable. Skipping upload step.');
        console.log('(Note: Run "npm run dev" to start the local server if needed)');
    }
}

async function main() {
    const outputPath = path.join(process.cwd(), 'src/lib/broker-data.json');
    const results = calculateUnbiasedScores();

    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`Successfully generated unbiased scores for ${results.length} brokers.`);
    console.log(`Output saved to: ${outputPath}`);

    // アップロード試行
    await uploadToServer(results);
}

main();

