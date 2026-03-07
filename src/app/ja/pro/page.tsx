'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Globe, ChevronDown, CheckCircle2, AlertCircle, Search, Moon, Zap, BarChart3, Bitcoin, TrendingUp, ArrowRight, ShieldCheck, Cpu, LayoutGrid, Building2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Shared Pro Ticker (Light Version)
 */
const ProTicker = ({ type = "fx" }) => {
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
        <div className="w-full bg-slate-100/50 border-b border-slate-200/60 py-1 overflow-hidden sticky top-0 z-[60] backdrop-blur-sm">
            <div className="flex animate-ticker whitespace-nowrap">
                {[...fxItems, ...fxItems].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-6 text-[10px] font-bold tracking-tight">
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
 * Shared Footer (Integrity Declaration)
 */
const IntegrityFooter = () => {
    return (
        <footer className="bg-[#020617] text-white pt-24 pb-12 px-8 overflow-hidden relative">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="space-y-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter">誠実な運営宣言</h2>
                    </div>
                    <p className="text-xl text-slate-400 font-bold leading-relaxed max-w-xl">
                        当サービスのAIは、過去の実績を一切誇張しません。不確実な相場において、100%の勝率は存在しません。「偽りのないデータ」と「誠実なテクノロジー」を提供することをお約束します。
                    </p>
                    <div className="flex gap-8 items-center pt-4 opacity-50">
                        <Cpu className="w-8 h-8" />
                        <Activity className="w-8 h-8" />
                        <Building2 className="w-8 h-8" />
                    </div>
                </div>

                <div className="bg-slate-800/20 border border-slate-700/50 p-10 rounded-[40px] backdrop-blur-xl relative group">
                    <div className="text-xs font-black text-indigo-400 tracking-[0.3em] uppercase mb-8 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        運営の整合性
                    </div>
                    <div className="space-y-6">
                        {[
                            { label: "データの正確性", val: "100% リアルタイム" },
                            { label: "パフォーマンス報告", val: "ライブ更新" },
                            { label: "法令遵守ポリシー", val: "欺瞞ゼロ" },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-4 border-b border-slate-700/30">
                                <span className="text-xs font-bold text-slate-500">{item.label}</span>
                                <span className="text-sm font-black tracking-tight">{item.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto mt-32 pt-8 border-t border-slate-800 flex justify-between items-center opacity-40">
                <div className="text-[10px] font-black uppercase tracking-widest flex items-center gap-4">
                    <Activity className="w-4 h-4" />
                    Synapse Capital
                </div>
                <div className="text-[9px] font-bold tracking-widest uppercase flex gap-8">
                    <span>© 2026 SYNAPSE CAPITAL GLOBAL</span>
                    <span>POWERED BY ANTIGRAVITY AI</span>
                </div>
            </div>
        </footer>
    );
};

/**
 * FX Pro Dashboard
 */
export default function FXProDashboard() {
    const pairs = [
        { label: "USD/JPY", status: "STABLE", sync: 50, levels: [true, true, false, false], consistency: "MEDIUM" },
        { label: "EUR/USD", status: "STABLE", sync: 50, levels: [true, true, null, false], consistency: "MEDIUM" },
        { label: "GBP/USD", status: "同期", sync: 100, levels: [false, false, false, false], consistency: "MEDIUM" },
        { label: "AUD/USD", status: "STABLE", sync: 50, levels: [true, true, null, false], consistency: "LOW" },
        { label: "USD/CAD", status: "進行", sync: 75, levels: [false, true, true, false], consistency: "HIGH" },
        { label: "EUR/JPY", status: "STABLE", sync: 25, levels: [false, false, false, false], consistency: "LOW" },
        { label: "GBP/JPY", status: "STABLE", sync: 50, levels: [false, false, false, false], consistency: "MEDIUM" },
        { label: "GOLD", status: "STABLE", sync: 50, levels: [false, false, false, false], consistency: "MEDIUM" },
        { label: "WTI", status: "STABLE", sync: 50, levels: [false, false, false, false], consistency: "MEDIUM" },
        { label: "NASDAQ", status: "STABLE", sync: 50, levels: [false, false, false, false], consistency: "MEDIUM" },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            <ProTicker />

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md px-6 py-3 flex items-center justify-between border-b border-slate-100 sticky top-[28px] z-50">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                            <Activity className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <div className="text-sm font-black italic tracking-tighter text-slate-900 leading-none uppercase">SYNAPSE CAPITAL</div>
                            <div className="text-[8px] font-bold text-slate-400 tracking-wider mt-0.5">ダッシュボード</div>
                        </div>
                    </Link>
                    <Link href="/ja/" className="text-[10px] font-black px-3 py-1.5 bg-slate-100 text-slate-500 rounded-md hover:bg-slate-200 transition-colors">シンプル版</Link>
                    <nav className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/50 ml-4">
                        <Link href="/ja/pro/" className="px-4 py-1.5 rounded-full text-[10px] font-black bg-indigo-600 text-white shadow-sm flex items-center gap-2">
                            <BarChart3 className="w-3.5 h-3.5" /> FX
                        </Link>
                        <Link href="/ja/pro/stocks/" className="px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 hover:text-slate-600 flex items-center gap-2 transition-colors">
                            <Activity className="w-3.5 h-3.5" /> 株式
                        </Link>
                        <Link href="/ja/pro/crypto/" className="px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 hover:text-slate-600 flex items-center gap-2 transition-colors">
                            <Bitcoin className="w-3.5 h-3.5" /> クリプト
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-black text-slate-600">
                        <Globe className="w-3.5 h-3.5" /> JP <ChevronDown className="w-3 h-3" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black tracking-widest uppercase rounded-full border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-8 py-8 space-y-12">
                {/* Hero Card */}
                <div className="bg-white border border-slate-100 rounded-[40px] p-12 shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-transparent" />
                    <div className="space-y-6 max-w-2xl relative z-10">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black tracking-widest uppercase rounded-sm">プレミアム インサイト</span>
                            <span className="w-10 h-[1px] bg-slate-200" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">市場インテリジェンス</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight italic">
                            FX市場の動きを、AIが先読みする
                        </h1>
                        <p className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            NO DECEPTION — <span className="text-slate-500">嘘のないシグナルで、あなたの決断を後押し</span>
                        </p>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed">
                            AIが通貨ペアの値動き・経済指標・市場センチメントを複合解析。世界中のトレーダーが見落とすパターンを、あなたの画面に先出しします。
                        </p>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-8 rounded-[32px] max-w-sm flex items-start gap-4">
                        <AlertCircle className="w-10 h-10 text-rose-500 mt-1" />
                        <div className="space-y-1">
                            <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest">重要事項：リスク管理</div>
                            <div className="text-sm font-black text-slate-900 leading-tight">投機は自己責任でお願いします</div>
                        </div>
                    </div>
                </div>

                {/* Market Summary Label */}
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">市場テーマと主要セッションの状況を一目で把握できます。</p>

                {/* Grid */}
                <div className="space-y-10">
                    <div className="flex items-center justify-between px-2">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <Activity className="w-6 h-6 text-indigo-600" />
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic font-black">Market Synapse Board <span className="text-indigo-600/50">V1.2</span></h2>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-9 flex items-center gap-2 italic">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                AI マルチタイムフレーム・エンジン & 矛盾検知
                            </p>
                        </div>
                        <div className="px-4 py-2 bg-slate-100/50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            最終計算: 8:52:37
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {pairs.map((pair, i) => (
                            <FXCard key={i} {...pair} />
                        ))}
                    </div>
                </div>

                {/* Market Synapse Insights Section (NEW) */}
                <section className="space-y-8 pt-12">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black italic">!</div>
                        <h3 className="text-xl font-black text-slate-900 italic tracking-tight uppercase">1分でわかるマーケット・シナプス</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm space-y-6">
                            <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest border-b border-slate-50 pb-4">現在の市場テーマ</div>
                            <p className="text-sm font-bold text-slate-600 leading-relaxed italic">米利下げ期待の後退とドル買い戻し。強含みな経済指標を受け、ドルの独歩高の様相。</p>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm space-y-6">
                            <div className="text-[9px] font-black text-rose-500 uppercase tracking-widest border-b border-slate-50 pb-4">要人発言・警戒事項</div>
                            <p className="text-sm font-bold text-slate-600 leading-relaxed italic">日銀総裁：賃金と物価の好循環を注視。市場はマイナス金利解除のタイミングを模索中。</p>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm space-y-6">
                            <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest border-b border-slate-50 pb-4">注目経済指標</div>
                            <p className="text-sm font-bold text-slate-600 leading-relaxed italic">NY時間：米雇用統計。非農業部門雇用者数と平均時給の伸びに要注目。ボラティリティ警戒。</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <CorrelationCard
                            title="EUR/USD"
                            vs="金 (GOLD)"
                            score={0.84}
                            desc="極めて高い逆相関。ドル相場の方向性に強い連動。"
                        />
                        <CorrelationCard
                            title="NASDAQ"
                            vs="米10年債 (US10Y)"
                            score={-0.91}
                            desc="強烈な逆相関。金利上昇へのハイテク銘柄の脆弱性。"
                        />
                    </div>
                </section>

                <div className="flex flex-col items-center gap-8 py-12">
                    <button className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all group">
                        全 6 ノードを検査
                        <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                    </button>
                    <div className="w-[1px] h-32 bg-gradient-to-b from-slate-200 to-transparent" />
                </div>
            </main>

            <IntegrityFooter />
        </div>
    );
}

const FXCard = ({ label, status, sync, levels, consistency }: any) => {
    return (
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 space-y-5 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-crosshair group">
            <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900 tracking-tighter italic uppercase">{label}</span>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm tracking-widest uppercase border ${status === '逆行' || status === '進行' ? 'bg-rose-50 border-rose-100 text-rose-500' :
                        status === '同期' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' :
                            'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                    {status}
                </span>
            </div>

            <div className="grid grid-cols-4 gap-1">
                {['15M', '1H', '4H', '1D'].map((tf, i) => {
                    const dir = levels[i];
                    return (
                        <div key={tf} className="bg-slate-50/50 p-2 rounded-xl border border-slate-100/50 flex flex-col items-center gap-1.5 group-hover:bg-white transition-colors">
                            <div className="text-[7px] font-black text-slate-300 tracking-tighter uppercase">{tf}</div>
                            {dir === true && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
                            {dir === false && <TrendingUp className="w-3.5 h-3.5 text-rose-500 rotate-180" />}
                            {dir === null && <Activity className="w-3.5 h-3.5 text-slate-200" />}
                        </div>
                    );
                })}
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-tighter">
                    <span className="text-slate-400">シナプス同期率</span>
                    <span className="text-indigo-600">{sync}%</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-1000"
                        style={{ width: `${sync}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter italic">矛盾レベル: {consistency}</span>
                </div>
                <div className="flex gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${consistency === 'HIGH' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <div className={`w-1.5 h-1.5 rounded-full ${consistency === 'HIGH' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                </div>
            </div>
        </div>
    );
}

const CorrelationCard = ({ title, vs, score, desc }: any) => (
    <div className="bg-white border border-slate-100 rounded-[32px] p-8 flex items-center justify-between group hover:border-indigo-100 transition-all shadow-sm">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-900 italic uppercase">{title}</span>
                <span className="text-[8px] font-bold text-slate-300">VS</span>
                <span className="text-sm font-black text-slate-600 italic uppercase">{vs}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 tracking-tight italic">{desc}</p>
        </div>
        <div className="text-right">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">相関係数</div>
            <div className="text-2xl font-black text-indigo-600 italic tracking-tighter">{score > 0 ? '+' : ''}{score.toFixed(2)}</div>
        </div>
    </div>
);
