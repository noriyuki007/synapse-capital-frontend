'use client';

import React from 'react';
import { Activity, Globe, ChevronDown, CheckCircle2, AlertCircle, Search, Moon, Zap, BarChart3, Bitcoin, TrendingUp, ShieldCheck, Cpu, Building2, LayoutGrid, Clock, ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Modal } from '@/components/Modal';

/**
 * Shared Pro Ticker
 */
const ProTicker = () => {
    const items = [
        { label: "BTC/USDT", val: "51,200.00", chg: "+1.20%", up: true },
        { label: "ETH/USDT", val: "2,848.68", chg: "+0.85%", up: true },
        { label: "SOL/USDT", val: "105.45", chg: "-0.45%", up: false },
        { label: "XRP/USDT", val: "0.5432", chg: "-0.12%", up: false },
        { label: "ADA/USDT", val: "0.4851", chg: "+2.11%", up: true },
        { label: "BNB/USDT", val: "352.12", chg: "+0.15%", up: true },
        { label: "AVAX/USDT", val: "38.92", chg: "-0.90%", up: false },
        { label: "MATIC/USDT", val: "1.0432", chg: "+0.12%", up: true },
    ];
    return (
        <div className="w-full bg-slate-50 border-b border-slate-100 py-1.5 overflow-hidden sticky top-[57px] z-[40] backdrop-blur-sm">
            <div className="flex animate-ticker whitespace-nowrap">
                {[...items, ...items].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 text-[11px] font-bold tracking-tighter">
                        <span className="text-slate-400 uppercase">{item.label}</span>
                        <span className="text-slate-900 tabular-nums">{item.val}</span>
                        <span className={item.up ? "text-emerald-500" : "text-rose-500"}>{item.chg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};



export default function CryptoProDashboard() {
    const assets = [
        { label: "BTC/USD", status: "進行中", sync: 100, levels: [true, true, true, true], consistency: "低" },
        { label: "ETH/USD", status: "安定", sync: 80, levels: [true, true, false, true], consistency: "低" },
        { label: "SOL/USD", status: "進行中", sync: 45, levels: [false, true, null, true], consistency: "中" },
        { label: "XRP/USD", status: "逆行中", sync: 15, levels: [false, false, false, false], consistency: "高" },
        { label: "ADA/USD", status: "安定", sync: 55, levels: [true, false, true, false], consistency: "中" },
        { label: "DOT/USD", status: "安定", sync: 30, levels: [false, null, null, true], consistency: "高" },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-amber-100 selection:text-amber-900">
            <Header />
            <ProTicker />

            <main className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-slate-100 bg-white min-h-screen shadow-sm">
                
                {/* Main Content Area (8 columns) */}
                <div className="lg:col-span-8 p-6 md:p-12 lg:p-16 space-y-20 border-r border-slate-100">
                    
                    {/* Hero Section */}
                    <div className="space-y-8 max-w-2xl">
                        <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-none text-[12px] font-black text-slate-500 uppercase tracking-widest">
                            クリプト・インテリジェンス V2.4 ライブ
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none font-sans uppercase whitespace-nowrap">
                            暗号資産市場を、AIが解析し抜く。
                        </h1>
                        <p className="text-base font-medium text-slate-500 max-w-xl leading-relaxed uppercase border-l-2 border-slate-100 pl-8">
                            BTCからSOLまで、主要銘柄から新興L1までを網羅。大口の動きやDEXの出来高をAIが監視し、ボラティリティの波を捉えます。
                        </p>
                    </div>

                    {/* Crypto Board Area */}
                    <section className="space-y-10 pt-16 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[13px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-slate-900 leading-none">
                                <Bitcoin className="w-4 h-4 text-amber-500" />
                                クリプト・シナプス・ターミナル
                            </h2>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">オンチェーン同期済み</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assets.map((asset, i) => (
                                <CryptoCard key={i} {...asset} />
                            ))}
                        </div>
                    </section>

                    {/* Market Inter-correlation */}
                    <section className="space-y-10 pt-16 border-t border-slate-100">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <span className="w-4 h-px bg-slate-900" />
                            高度分析レイヤー
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-50 p-8 rounded-none space-y-4 shadow-sm border border-slate-100">
                                <div className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">市場間同期解析</div>
                                <h4 className="text-lg font-black tracking-tight text-slate-900 font-sans uppercase">BTC vs 米10年債</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase">
                                    金利上昇局面におけるBTCのヘッジ機能は低下中。リスク資産としての連動が鮮明になっています。
                                </p>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-none space-y-4 shadow-sm border border-slate-100">
                                <div className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">オンチェーン・パルス</div>
                                <h4 className="text-lg font-black tracking-tight text-slate-900 font-sans uppercase">クジラの蓄積状況</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase">
                                    主要取引所へのインフローが減少。クジラによるコールドウォレットへの移転が加速し、供給不足を示唆。
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* New Pro Content: Liquidity Depth & Node Pulse */}
                    <section className="space-y-12 pt-16 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                    <BarChart3 className="w-4 h-4 text-amber-500" />
                                    マーケット流動性深度 (Liquidity)
                                </h3>
                                <div className="p-8 bg-slate-50 border border-slate-100 rounded-none space-y-6">
                                    <div className="flex flex-col gap-4">
                                        {[
                                            { range: "+2% 厚み", bid: "$42.5M", ask: "$38.2M", ratio: 1.1 },
                                            { range: "+1% 厚み", bid: "$18.2M", ask: "$15.9M", ratio: 1.14 },
                                        ].map((depth, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="text-[11px] font-black text-slate-400 uppercase">{depth.range}</div>
                                                <div className="grid grid-cols-2 gap-1 bg-white p-2 border border-slate-100">
                                                    <div className="text-center">
                                                        <div className="text-[11px] font-black text-emerald-500 uppercase">買い板 (Bids)</div>
                                                        <div className="text-xs font-black text-slate-900">{depth.bid}</div>
                                                    </div>
                                                    <div className="text-center border-l border-slate-50">
                                                        <div className="text-[11px] font-black text-rose-500 uppercase">売り板 (Asks)</div>
                                                        <div className="text-xs font-black text-slate-900">{depth.ask}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase">
                                        主要中央集権取引所（CEX）のオーダーブックをミリ秒単位で統合・解析。価格急変時の実効的なスリッページと、機関投資家の仕掛けを予見させる「板の厚み」を可視化します。
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                    <Activity className="w-4 h-4 text-amber-500" />
                                    ノード・ネットワーク・パルス
                                </h3>
                                <div className="p-8 bg-white border border-slate-100 rounded-none space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <div className="text-[11px] font-black text-slate-300 uppercase">ネットワーク負荷</div>
                                            <div className="text-xl font-black text-slate-900 tabular-nums uppercase">稼働安定 (Stable)</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[11px] font-black text-slate-300 uppercase">平均ガス代</div>
                                            <div className="text-xl font-black text-slate-900 tabular-nums uppercase">12 Gwei</div>
                                        </div>
                                    </div>
                                    <div className="h-20 flex items-center gap-1">
                                        {[40, 20, 60, 30, 80, 50, 90, 40, 70].map((v, i) => (
                                            <div key={i} className="flex-1 bg-amber-100 rounded-none" style={{ height: `${v}%` }} />
                                        ))}
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase">
                                        メインネットおよびL1/L2層のトランザクション密度、平均ガス代、メモリプールを解析。ブロックチェーン自体の健全性と、DeFi等におけるオンチェーン需要の熱量をリアルタイムに測定します。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Additional Pro Content: Whale Tracking Feed */}
                    <section className="space-y-10 pt-16 border-t border-slate-100">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-slate-900 leading-none">
                            <Users className="w-4 h-4 text-slate-400" />
                            オンチェーン・クジラ追跡 (Real-time Feed)
                        </h2>
                        <div className="space-y-4">
                            {[
                                { address: "0x7a2...fE1", amount: "1,200 BTC", type: "資金流出", target: "コールドウォレット" },
                                { address: "bc1q...x9v", amount: "50,000 ETH", type: "資金流入", target: "Binance" },
                                { address: "0x98f...21c", amount: "5,000,000 SOL", type: "ステーキング", target: "プロトコル" },
                            ].map((whale, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-none relative overflow-hidden">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-1 h-8 ${whale.type === '資金流入' ? 'bg-rose-500' : whale.type === '資金流出' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                                        <div className="space-y-1">
                                            <div className="text-[12px] font-black text-slate-900 uppercase font-sans">{whale.amount}</div>
                                            <div className="text-[10px] font-bold text-slate-400 font-mono">{whale.address}</div>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <div className={`text-[11px] font-black uppercase tracking-widest ${whale.type === '資金流入' ? 'text-rose-500' : whale.type === '資金流出' ? 'text-emerald-500' : 'text-indigo-500'}`}>{whale.type}</div>
                                        <div className="text-[11px] font-bold text-slate-400 uppercase">→ {whale.target}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[11px] font-bold text-slate-300 leading-relaxed uppercase">
                            100万ドル以上の大規模オンチェーン・トランザクションをリアルタイムで抽出・追跡。取引所へのインフロー（売り圧力）とアウトフロー（長期保有への回帰）を監視し、需給バランスの極みをとらえます。
                        </p>
                    </section>
                </div>

                {/* Shared Sidebar */}
                <div className="lg:col-span-4 p-6 md:p-10 border-none bg-white">
                    <Sidebar 
                        latestReports={[]} 
                        stats={{ winRate: 100, total: 242 }} 
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}

const CryptoCard = ({ label, status, sync, levels, consistency }: any) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    return (
        <div className="bg-white border border-slate-100 rounded-none p-6 space-y-6 shadow-sm hover:shadow-xl hover:border-amber-100 transition-all cursor-crosshair group">
            <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900 tracking-tighter uppercase font-sans">{label}</span>
                <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-none tracking-widest uppercase border ${
                    status === '逆行中' || status === '進行中' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                    status === '同期中' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' :
                    'bg-slate-50 border-slate-100 text-slate-400'
                }`}>
                    {status}
                </span>
            </div>

            <div className="grid grid-cols-4 gap-1">
                {['15M', '1H', '4H', '1D'].map((tf, i) => {
                    const dir = levels[i];
                    return (
                        <div key={tf} className="bg-slate-50 p-2 rounded-none border border-slate-100 flex flex-col items-center gap-1.5">
                            <div className="text-[12px] font-black text-slate-300 tracking-tighter uppercase">{tf}</div>
                            {dir === true && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                            {dir === false && <TrendingUp className="w-4 h-4 text-rose-500 rotate-180" />}
                            {dir === null && <Activity className="w-4 h-4 text-slate-200" />}
                        </div>
                    );
                })}
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tighter">
                    <span className="text-slate-400">同期率</span>
                    <span className="text-amber-500">{sync}%</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-none overflow-hidden">
                    <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${sync}%` }} />
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">不整合アラート: {consistency}</span>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-[11px] font-black text-amber-500 uppercase tracking-widest hover:underline transition-all"
                >
                    詳細分析 →
                </button>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={`${label} シナプス・クリプト深層分析`}
            >
                <div className="space-y-8">
                    <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100">
                        <div className="space-y-1">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">現在のステータス</div>
                            <div className="text-xl font-black text-slate-900">{status}</div>
                        </div>
                        <div className="text-right space-y-1">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">市場整合性</div>
                            <div className="text-xl font-black text-amber-500">{consistency}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-200 pb-2">オンチェーン & 流動性マトリクス</div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white border border-slate-100 space-y-2">
                                <div className="text-[10px] font-black text-slate-400 uppercase">同期率</div>
                                <div className="text-lg font-black text-slate-900 tabular-nums">{sync}%</div>
                                <div className="w-full h-1 bg-slate-50">
                                    <div className="h-full bg-amber-500" style={{ width: `${sync}%` }} />
                                </div>
                            </div>
                            <div className="p-4 bg-white border border-slate-100 space-y-2">
                                <div className="text-[10px] font-black text-slate-400 uppercase">ボラティリティ</div>
                                <div className="text-lg font-black text-slate-900 uppercase">{sync > 80 ? '安定' : '活発'}</div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`h-1 flex-1 ${i <= (sync > 80 ? 4 : 2) ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border border-slate-100 space-y-4">
                        <div className="text-[11px] font-black text-slate-900 uppercase tracking-widest">AI オンチェーン診断レポート</div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {label}は現在、オンチェーンデータの挙動と価格アクションが{sync}%の精度で合致しています。AIは、大口のアカウントが特定のレンジで蓄積を行っているパターンを検出。{consistency === '高' ? 'ノイズが少なく、テクニカルな反発が期待できる領域にあります。' : '市場全体のボラティリティが高まっており、突発的なスリッページに注意が必要です。'}
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
