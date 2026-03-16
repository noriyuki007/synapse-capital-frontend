'use client';

import React from 'react';
import { Activity, Globe, ChevronDown, CheckCircle2, AlertCircle, Search, Moon, Zap, BarChart3, Bitcoin, TrendingUp, ArrowRight, ShieldCheck, Cpu, LayoutGrid, Building2 } from 'lucide-react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Modal } from '@/components/Modal';

/**
 * Shared Pro Ticker (Light Version)
 */
const ProTicker = () => {
    const fxItems = [
        { label: "USD/JPY", val: "150.45", chg: "-0.12%", up: false },
        { label: "EUR/USD", val: "1.0820", chg: "+0.05%", up: true },
        { label: "BTC/USD", val: "51,200.00", chg: "+1.20%", up: true },
        { label: "金(GOLD)", val: "2,024.10", chg: "+0.15%", up: true },
        { label: "US 10Y", val: "4.28%", chg: "-0.02", up: false },
        { label: "S&P 500", val: "5,026.61", chg: "+0.57%", up: true },
        { label: "NASDAQ", val: "15,906.17", chg: "+0.90%", up: true },
        { label: "NIKKEI 225", val: "38,157.94", chg: "+0.86%", up: true },
    ];
    return (
        <div className="w-full bg-slate-50 border-b border-slate-100 py-1.5 overflow-hidden sticky top-[57px] z-[40] backdrop-blur-sm">
            <div className="flex animate-ticker whitespace-nowrap">
                {[...fxItems, ...fxItems].map((item, i) => (
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



/**
 * FX Pro Dashboard
 */
export default function FXProDashboard() {
    const pairs = [
        { label: "USD/JPY", status: "安定", sync: 50, levels: [true, true, false, false], consistency: "中" },
        { label: "EUR/USD", status: "安定", sync: 50, levels: [true, true, null, false], consistency: "中" },
        { label: "GBP/USD", status: "同期中", sync: 100, levels: [false, false, false, false], consistency: "中" },
        { label: "AUD/USD", status: "安定", sync: 50, levels: [true, true, null, false], consistency: "低" },
        { label: "USD/CAD", status: "進行中", sync: 75, levels: [false, true, true, false], consistency: "高" },
        { label: "EUR/JPY", status: "安定", sync: 25, levels: [false, false, false, false], consistency: "低" },
        { label: "GBP/JPY", status: "安定", sync: 50, levels: [false, false, false, false], consistency: "中" },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            <ProTicker />

            <Header />

            <main className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-slate-100 bg-white shadow-sm">
                
                {/* Main Content Area (8 columns) */}
                <div className="lg:col-span-8 p-6 md:p-12 lg:p-16 space-y-20 border-r border-slate-100">
                    
                    {/* Hero Section */}
                    <div className="space-y-8 max-w-2xl">
                        <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-none text-[12px] font-black text-slate-500 uppercase tracking-widest">
                            プロフェッショナル・インサイト V2.4 ライブ
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none font-sans uppercase whitespace-nowrap">
                            FX市場の動きを、AIが先読み。
                        </h1>
                        <p className="text-base font-medium text-slate-500 max-w-xl leading-relaxed uppercase border-l-2 border-slate-100 pl-8">
                            AIが通貨ペアの値動き・経済指標・市場センチメントを複合解析。世界中のトレーダーが見落とすパターンを、あなたの画面に先出しします。
                        </p>
                    </div>

                    {/* FX Board Area */}
                    <section className="space-y-10 pt-16 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[13px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-slate-900 leading-none">
                                <Activity className="w-4 h-4 text-indigo-600" />
                                FX シナプス・ターミナル
                            </h2>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">最終同期: 8:52:37</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pairs.map((pair, i) => (
                                <FXCard key={i} {...pair} />
                            ))}
                        </div>
                    </section>

                    {/* Analysis Themes */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-16 border-t border-slate-100">
                        <div className="space-y-4">
                            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">ドル相場テーマ</div>
                            <h4 className="text-xl font-black tracking-tight text-slate-900 font-sans uppercase">米利下げ期待の後退</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed uppercase">
                                強含みな経済指標を受け、ドルの独歩高の様相。各国の金利差が為替市場の主要なドライバーとなっています。
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">円相場テーマ</div>
                            <h4 className="text-xl font-black tracking-tight text-slate-900 font-sans uppercase">マイナス金利解除の模索</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed uppercase">
                                日銀の政策修正タイミングに注目が集まっています。賃金と物価の好循環が確認されるかが鍵となります。
                            </p>
                        </div>
                    </section>

                    {/* New Pro Content: Sentiment Radar & Volatility */}
                    <section className="space-y-12 pt-16 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                    <Globe className="w-4 h-4 text-indigo-600" />
                                    市場センチメント・レーダー
                                </h3>
                                <div className="p-8 bg-slate-50 border border-slate-100 rounded-none space-y-6">
                                    {[
                                        { label: "強気期待", val: 68, color: "bg-emerald-500" },
                                        { label: "中立", val: 22, color: "bg-slate-300" },
                                        { label: "弱気期待", val: 10, color: "bg-rose-500" },
                                    ].map((item, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                                                <span>{item.label}</span>
                                                <span>{item.val}%</span>
                                            </div>
                                            <div className="h-1.5 bg-white rounded-none overflow-hidden">
                                                <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase">
                                    独自のAIアルゴリズムにより、SNS、ニュース、オプション市場の歪みをリアルタイム解析。群衆の心理から一歩先を行く市場の方向性を算出します。
                                </p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    ボラティリティ・スキャナー
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { pair: "USD/JPY", vola: "高", val: "1.24%" },
                                        { pair: "EUR/USD", vola: "低", val: "0.45%" },
                                        { pair: "GBP/JPY", vola: "中", val: "0.88%" },
                                        { pair: "AUD/USD", vola: "中", val: "0.72%" },
                                    ].map((item, i) => (
                                        <div key={i} className="p-4 bg-white border border-slate-100 rounded-none space-y-1">
                                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.pair}</div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-black text-slate-900 tabular-nums">{item.val}</span>
                                                <span className={`text-[11px] font-black px-1 py-0.5 rounded-none ${
                                                    item.vola === '高' ? 'bg-rose-50 text-rose-500 border border-rose-100' :
                                                    item.vola === '中' ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                                                    'bg-emerald-50 text-emerald-500 border border-emerald-100'
                                                }`}>
                                                    {item.vola}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase">
                                    ボラティリティの異常値を瞬時に検知。統計的な平均振幅からの乖離を測定することで、突発的な価格変動やトレンド転換の予兆を捉えます。
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Additional Pro Content: Correlation Matrix */}
                    <section className="space-y-10 pt-16 border-t border-slate-100">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-slate-900 leading-none">
                            <Globe className="w-4 h-4 text-slate-400" />
                            相関資産マトリクス
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[12px] uppercase font-black tracking-tight">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400">
                                        <th className="py-4 text-left font-black">通貨ペア</th>
                                        <th className="py-4 text-center font-black">相関係数</th>
                                        <th className="py-4 text-right font-black">ステータス</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {[
                                        { pair: "USD/JPY vs US10Y", corr: "+0.88", status: "強い正相関" },
                                        { pair: "EUR/USD vs GOLD", corr: "+0.64", status: "中程度の正相関" },
                                        { pair: "USD/CAD vs OIL", corr: "-0.82", status: "強い逆相関" },
                                        { pair: "GBP/USD vs FTSE", corr: "+0.45", status: "弱い正相関" },
                                    ].map((row, i) => (
                                        <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                            <td className="py-5 font-black text-slate-900">{row.pair}</td>
                                            <td className="py-5 text-center tabular-nums text-indigo-600">{row.corr}</td>
                                            <td className="py-5 text-right text-slate-400">{row.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[11px] font-bold text-slate-300 leading-relaxed uppercase">
                            主要通貨ペアとマクロ資産（金利、商品、指数）の動的な相関係数を算出。資産間の資金移動から、現在の相場テーマが「金利」なのか「リスク・オフ」なのかを判定します。
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

const FXCard = ({ label, status, sync, levels, consistency }: any) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    return (
        <div className="bg-white border border-slate-100 rounded-none p-6 space-y-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-crosshair group">
            <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900 tracking-tighter uppercase font-sans">{label}</span>
                <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-none tracking-widest uppercase border ${
                    status === '逆行中' || status === '進行中' ? 'bg-rose-50 border-rose-100 text-rose-500' :
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
                    <span className="text-slate-400">シナプス同期率</span>
                    <span className="text-indigo-600">{sync}%</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-none overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${sync}%` }} />
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">不整合アラート: {consistency}</span>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:underline transition-all"
                >
                    詳細分析 →
                </button>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={`${label} シナプス・ターミナル詳細`}
            >
                <div className="space-y-8">
                    <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100">
                        <div className="space-y-1">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">現在のステータス</div>
                            <div className="text-xl font-black text-slate-900">{status}</div>
                        </div>
                        <div className="text-right space-y-1">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">同期の整合性</div>
                            <div className="text-xl font-black text-indigo-600">{consistency}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-200 pb-2">マルチタイムフレーム解析</div>
                        <div className="grid grid-cols-4 gap-4">
                            {['15M', '1H', '4H', '1D'].map((tf, i) => {
                                const dir = levels[i];
                                return (
                                    <div key={tf} className="p-4 bg-white border border-slate-100 flex flex-col items-center gap-3">
                                        <div className="text-[13px] font-black text-slate-400 uppercase">{tf}</div>
                                        {dir === true && <TrendingUp className="w-6 h-6 text-emerald-500" />}
                                        {dir === false && <TrendingUp className="w-6 h-6 text-rose-500 rotate-180" />}
                                        {dir === null && <Activity className="w-6 h-6 text-slate-200" />}
                                        <div className="text-[10px] font-bold text-slate-900">{dir === true ? '上昇優位' : dir === false ? '下降優位' : '中立'}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 border border-slate-100 space-y-4">
                        <div className="text-[11px] font-black text-slate-900 uppercase tracking-widest">シナプス・ AI 診断</div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {label}の価格行動は現在、{sync}%の確率で主要なアルゴリズムと同期しています。{consistency === '高' ? '不整合が少なく、テクニカル指標通りの推移が期待されます。' : '一部の指標でノイズが発生しており、突発的な変動に注意が必要です。'}短期的にはレジスタンスラインの突破を試みる動きをAIが検知しています。
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
