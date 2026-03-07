'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Activity, DollarSign, Bitcoin, Globe, Shield, Zap, TrendingUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';

// Helper for the top ticker bar
const MarketTicker = () => {
    const items = [
        { label: "EUR/USD", val: "1.0820", chg: "+0.05%", up: true },
        { label: "BTC/USD", val: "51,200.00", chg: "+1.20%", up: true },
        { label: "金(GOLD)", val: "2,024.10", chg: "+0.15%", up: true },
        { label: "US 10Y", val: "4.28%", chg: "-0.02", up: false },
        { label: "S&P 500", val: "5,026.61", chg: "+0.57%", up: true },
        { label: "NASDAQ", val: "15,906.17", chg: "+0.90%", up: true },
        { label: "NIKKEI 225", val: "38,157.94", chg: "+1.15%", up: true },
    ];

    return (
        <div className="w-full bg-[#f8fafc] border-b border-slate-100 py-1.5 overflow-hidden">
            <div className="flex animate-ticker whitespace-nowrap">
                {[...items, ...items].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 text-[9px] font-bold tracking-tighter">
                        <span className="text-slate-400 uppercase">{item.label}</span>
                        <span className="text-slate-900">{item.val}</span>
                        <span className={item.up ? "text-emerald-500" : "text-rose-500"}>{item.chg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function PerfectLandingPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 0);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fxSignals = [
        { pair: "USD/JPY", status: "BUY", comment: "\"Dollar strength persists on high yields and US-Japan policy divergence.\"", bid: "154.335", ask: "154.355", entry: "153.80", tp: "156.50", sl: "152.20", reliability: "HIGH" },
        { pair: "EUR/USD", status: "SELL", comment: "\"Eurozone stagnation and dovish ECB shift weigh on Euro.\"", bid: "1.0717", ask: "1.0719", entry: "1.0750", tp: "1.0600", sl: "1.0820", reliability: "HIGH" },
        { pair: "GBP/USD", status: "BUY", comment: "\"Sticky UK inflation forcing BoE hawkish stance support.\"", bid: "1.2860", ask: "1.2862", entry: "1.2820", tp: "1.3000", sl: "1.2750", reliability: "MEDIUM" },
    ];

    const cryptoSignals = [
        { pair: "BTC/USD", status: "BUY", comment: "\"Stable ETF inflows supporting price discovery towards $100k.\"", bid: "96,558.0191", ask: "96,558.0193", entry: "95,200.0000", tp: "110,000.0000", sl: "91,000.0000", reliability: "VERY HIGH" },
        { pair: "ETH/USD", status: "BUY", comment: "\"DeFi recovery and L2 growth driving ETH catch-up.\"", bid: "2,848.6800", ask: "2,848.6802", entry: "2,820.0000", tp: "3,500.0000", sl: "2,600.0000", reliability: "HIGH" },
        { pair: "SOL/USD", status: "BUY", comment: "\"DEX volume and ecosystem popularity driving standalone bull trend.\"", bid: "195.2557", ask: "195.2559", entry: "190.0000", tp: "250.0000", sl: "175.0000", reliability: "HIGH" },
    ];

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 border-t-4 border-indigo-600">
            {/* Header */}
            <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md px-6 md:px-12 py-4 flex items-center justify-between transition-shadow ${scrolled ? 'shadow-sm' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xl font-black italic tracking-tighter text-slate-900 leading-none">SYNAPSE CAPITAL</div>
                        <div className="text-[8px] font-bold text-slate-400 tracking-[.3em] uppercase mt-0.5">誠実なAI投資の世界へようこそ</div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 hover:bg-slate-100 transition-colors">
                        <Globe className="w-3.5 h-3.5" />
                        日本語
                        <ChevronDown className="w-3 h-3" />
                    </button>
                    <Link href="/ja/pro" className="px-6 py-2 bg-indigo-600 text-white text-[10px] font-black tracking-widest rounded-lg hover:bg-indigo-700 transition-all hover:shadow-xl hover:shadow-indigo-200 uppercase">
                        ダッシュボード
                    </Link>
                </div>
            </header>

            <MarketTicker />

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center space-y-8 relative">
                {/* Background glow matching the screenshot */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-50/50 rounded-full blur-[120px] -z-10 pointer-events-none" />

                <div className="inline-flex items-center gap-2 px-4 py-1 bg-indigo-50 border border-indigo-100/50 rounded-full">
                    <Zap className="w-3 h-3 text-indigo-600" />
                    <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase">誠実なAI投資の世界へようこそ</span>
                </div>

                <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight md:leading-tight">
                    AIが教える、はじめてのFX・暗号資産
                </h1>

                <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto">
                    複雑な分析はAIに任せ、あなたは「最高のタイミング」を知るだけ。
                </p>

                {/* AI Signal Compass Card Group */}
                <div className="pt-16 max-w-6xl mx-auto">
                    <div className="bg-[#f8fafc]/50 backdrop-blur-sm border border-slate-100 rounded-[40px] p-8 md:p-16 shadow-2xl shadow-indigo-100/30 space-y-16">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-100 mb-6">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">AIシグナル・コンパス</h2>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">現在の市場状況から、AIが初心者向けに最も堅実な3銘柄を提示します。</p>
                        </div>

                        {/* FX Section */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                <h3 className="text-xs font-black text-indigo-600 tracking-widest uppercase italic">主要通貨 (FX)</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {fxSignals.map((sig, i) => (
                                    <SignalCard key={i} {...sig} />
                                ))}
                            </div>
                        </div>

                        {/* Crypto Section */}
                        <div className="space-y-8 pt-8">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <h3 className="text-xs font-black text-amber-500 tracking-widest uppercase italic">暗号資産銘柄</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {cryptoSignals.map((sig, i) => (
                                    <SignalCard key={i} {...sig} isCrypto />
                                ))}
                            </div>
                        </div>

                        <div className="pt-10 flex items-center gap-2 text-slate-400 text-[10px] font-medium justify-center border-t border-slate-200">
                            <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[8px]">!</span>
                            ※ 本ツールは情報提供のみを目的としており、投資勧誘等を行うものではありません。実際の取引はご自身の判断と責任で行ってください。損益について一切の責任を負いません。
                        </div>
                    </div>
                </div>
            </main>

            {/* Standard Advantages Section */}
            <section className="bg-white px-6 py-24 border-t border-slate-50">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-indigo-600 tracking-[0.3em] uppercase">EASY START</h4>
                        <p className="text-sm font-bold text-slate-900 leading-relaxed">
                            AIが難しいチャート分析を代行。あなたは最適なエントリー価格を知るだけ。
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-indigo-600 tracking-[0.3em] uppercase">GLOBAL LIQUIDITY</h4>
                        <p className="text-sm font-bold text-slate-900 leading-relaxed">
                            世界中のマーケット情報をリアルタイムで統合・解析。
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-indigo-600 tracking-[0.3em] uppercase">SAFE TECHNOLOGY</h4>
                        <p className="text-sm font-bold text-slate-900 leading-relaxed">
                            リスク管理を徹底した損切り（SL）設定をすべてのシグナルに付与。
                        </p>
                    </div>
                </div>
            </section>

            {/* Integrity Declaration (Dark Section) */}
            <section className="bg-[#020617] text-white px-6 py-32 rounded-t-[60px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -z-0" />
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 relative z-10">
                    <div className="space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-600/30">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">誠実な運営宣言</h2>
                        </div>
                        <p className="text-lg text-slate-400 font-medium leading-relaxed">
                            当サービスのAIは、過去の実績を一切誇張しません。不確実な相場において、100%の勝率は存在しません。「偽りのないデータ」と「誠実なテクノロジー」を提供することをお約束します。
                        </p>
                        <div className="flex gap-8 opacity-40">
                            <TrendingUp className="w-8 h-8" />
                            <Globe className="w-8 h-8" />
                            <Shield className="w-8 h-8" />
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-[40px] p-10 border border-white/10 space-y-8">
                        <h3 className="text-[11px] font-black tracking-[0.3em] text-slate-500 uppercase">運営の整合性</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <span className="text-[11px] font-bold text-slate-400">データの正確性</span>
                                <span className="text-sm font-black italic">100% リアルタイム</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <span className="text-[11px] font-bold text-slate-400">パフォーマンス報告</span>
                                <span className="text-sm font-black italic">ライブ更新</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <span className="text-[11px] font-bold text-slate-400">法令遵守ポリシー</span>
                                <span className="text-sm font-black italic">欺瞞ゼロ</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto mt-32 pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40">
                    <div className="flex items-center gap-4">
                        <Activity className="w-6 h-6" />
                        <span className="text-[10px] font-black tracking-widest uppercase italic">SYNAPSE CAPITAL</span>
                    </div>
                    <div className="text-[9px] font-bold tracking-widest uppercase">
                        © 2026 SYNAPSE CAPITAL GLOBAL . POWERED BY ANTIGRAVITY AI
                    </div>
                </div>
            </section>

            <style jsx global>{`
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-ticker {
                    animation: ticker 60s linear infinite;
                }
            `}</style>
        </div>
    );
}

const SignalCard = ({ pair, status, comment, bid, ask, entry, tp, sl, reliability, isCrypto = false }: any) => {
    return (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 text-left space-y-4 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group">
            <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-black tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors uppercase italic">{pair}</span>
                <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 border rounded-none ${status === 'BUY' ? 'border-emerald-100 text-emerald-600 bg-emerald-50' : 'border-rose-100 text-rose-600 bg-rose-50'}`}>
                    {status}
                </span>
            </div>

            <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic border-l-2 border-slate-100 pl-4 py-1">
                {comment}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-4">
                <div className="bg-slate-50 p-3 rounded-none">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">BID</div>
                    <div className="text-sm font-black text-slate-900 tabular-nums">{bid}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-none">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">ASK</div>
                    <div className="text-sm font-black text-rose-500 tabular-nums">{ask}</div>
                </div>
            </div>

            <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-xl space-y-2">
                <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">推奨エントリー</div>
                <div className="text-2xl font-black text-indigo-600 tracking-tight tabular-nums">{entry}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-slate-100 rounded-xl space-y-1">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">利益確定 (TP)</div>
                    <div className="text-xs font-black text-slate-900">{tp}</div>
                </div>
                <div className="p-3 border border-slate-100 rounded-xl space-y-1">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">損切り価格 (SL)</div>
                    <div className="text-xs font-black text-slate-900">{sl}</div>
                </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">AI信頼度:</span>
                    <span className="text-[9px] font-black text-indigo-600 uppercase italic">{reliability}</span>
                </div>
            </div>
        </div>
    );
};
