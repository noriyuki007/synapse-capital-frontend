'use client';

import React, { useState } from 'react';
import { Activity, Globe, ChevronDown, CheckCircle2, AlertCircle, Search, Moon, Zap, BarChart3, TrendingUp, Filter, Bitcoin, ShieldCheck, Cpu, Building2, LayoutGrid, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * Shared Pro Ticker
 */
const ProTicker = () => {
    const stockItems = [
        { label: "MSFT", val: "412.30", chg: "-0.12%", up: false },
        { label: "TSLA", val: "245.80", chg: "+4.20%", up: true },
        { label: "GOOGL", val: "172.50", chg: "+1.10%", up: true },
        { label: "7203 (TOYOTA)", val: "3,420", chg: "+0.45%", up: true },
        { label: "9984 (SOFTBANK)", val: "8,450", chg: "+1.20%", up: true },
        { label: "S&P 500", val: "5,026.61", chg: "+0.57%", up: true },
        { label: "NVDA", val: "726.02", chg: "+0.39%", up: true },
        { label: "AAPL", val: "185.92", chg: "-0.03%", up: false },
    ];
    return (
        <div className="w-full bg-slate-100/50 border-b border-slate-200/60 py-1 overflow-hidden sticky top-0 z-[60] backdrop-blur-sm">
            <div className="flex animate-ticker whitespace-nowrap">
                {[...stockItems, ...stockItems].map((item, i) => (
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
 * Shared Footer
 */
const IntegrityFooter = () => (
    <footer className="bg-[#020617] text-white pt-24 pb-12 px-8 overflow-hidden relative mt-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter italic">誠実な運営宣言</h2>
                </div>
                <p className="text-xl text-slate-400 font-bold leading-relaxed max-w-xl italic">
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
                    {[{ label: "データの正確性", val: "100% リアルタイム" }, { label: "パフォーマンス報告", val: "ライブ更新" }, { label: "法令遵守ポリシー", val: "欺瞞ゼロ" }].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-4 border-b border-slate-700/30">
                            <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">{item.label}</span>
                            <span className="text-sm font-black italic">{item.val}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <div className="max-w-[1400px] mx-auto mt-32 pt-8 border-t border-slate-800 flex justify-between items-center opacity-40">
            <div className="text-[10px] font-black uppercase tracking-widest flex items-center gap-4 italic"><Activity className="w-4 h-4" /> Synapse Capital</div>
            <div className="text-[9px] font-bold tracking-widest uppercase flex gap-8"><span>© 2026 SYNAPSE CAPITAL GLOBAL</span><span>POWERED BY ANTIGRAVITY AI</span></div>
        </div>
    </footer>
);

export default function DeepSearchStocks() {
    const [timeframe, setTimeframe] = useState('1h');
    const [activeTab, setActiveTab] = useState('Sector Heatmap');

    const stocks = [
        { ticker: "AAPL", name: "Apple Inc.", price: "185.928", chg: "-0.20%", marketCap: "$2.87T", rank: 1, per: "28.5", pbr: "45.2", type: "TECHNOLOGY", region: "US" },
        { ticker: "MSFT", name: "Microsoft Corp.", price: "415.144", chg: "+0.35%", marketCap: "$3.08T", rank: 2, per: "35.8", pbr: "12.1", type: "TECHNOLOGY", region: "US" },
        { ticker: "NVDA", name: "NVIDIA Corp.", price: "726.254", chg: "+0.39%", marketCap: "$1.79T", rank: 3, per: "65.4", pbr: "38.5", type: "SEMICONDUCTORS", region: "US" },
        { ticker: "GOOGL", name: "Alphabet Inc.", price: "142.30", chg: "+1.08%", marketCap: "$1.82T", rank: 4, per: "24.1", pbr: "6.2", type: "TECHNOLOGY", region: "US" },
        { ticker: "AMZN", name: "Amazon.com Inc.", price: "167.286", chg: "-0.67%", marketCap: "$1.73T", rank: 5, per: "60.2", pbr: "8.4", type: "E-COMMERCE", region: "US" },
        { ticker: "META", name: "Meta Platforms", price: "99.996", chg: "-1.29%", marketCap: "$1.24T", rank: 6, per: "31.2", pbr: "8.9", type: "TECHNOLOGY", region: "US" },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
            <ProTicker />

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
                    <Link href="/ja/" className="text-[10px] font-black px-3 py-1.5 bg-slate-100 text-slate-500 rounded-md">シンプル版</Link>
                    <nav className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/50 ml-4">
                        <Link href="/ja/pro/" className="px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 hover:text-slate-600 flex items-center gap-2 transition-colors italic">
                            <BarChart3 className="w-3.5 h-3.5" /> FX
                        </Link>
                        <Link href="/ja/pro/stocks/" className="px-4 py-1.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-sm flex items-center gap-2 transition-colors italic">
                            <Activity className="w-3.5 h-3.5" /> 株式
                        </Link>
                        <Link href="/ja/pro/crypto/" className="px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 hover:text-slate-600 flex items-center gap-2 transition-colors italic">
                            <Bitcoin className="w-3.5 h-3.5" /> クリプト
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4 font-black">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-600 uppercase italic">JP <ChevronDown className="w-3 h-3" /></div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] tracking-widest uppercase rounded-full border border-emerald-100 italic">LIVE</div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-8 pt-8 space-y-10">
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 py-3 border-r border-slate-200 pr-8">
                            <div className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[9px] font-black tracking-widest uppercase italic rounded-sm">プロフェッショナル</div>
                            <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2 italic uppercase">
                                <BarChart3 className="w-5 h-5 text-indigo-500" />
                                グローバル株式ターミナル
                            </h2>
                        </div>
                        <div className="flex items-center gap-4 pl-4">
                            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200 shadow-inner">
                                <div className="px-3 py-1.5 rounded-lg flex flex-col justify-center gap-0.5 border border-slate-200/50 bg-white shadow-sm">
                                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest italic">US MARKET</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter italic">18:38 EST <span className="opacity-50">CLOSED</span></span>
                                    </div>
                                </div>
                                <div className="px-3 py-1.5 rounded-lg flex flex-col justify-center gap-0.5 border border-transparent">
                                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest italic">JP MARKET</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter italic">08:38 JST <span className="opacity-50">CLOSED</span></span>
                                    </div>
                                </div>
                            </div>
                            <span className="px-3 py-2 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-lg border border-emerald-100 italic">米国式 (上昇＝緑)</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-1 rounded-full flex gap-1 shadow-inner">
                            <button className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all italic ${timeframe === '5m' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`} onClick={() => setTimeframe('5m')}>5M (SCALP)</button>
                            <button className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all italic ${timeframe === '1h' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`} onClick={() => setTimeframe('1h')}>1H (SWING)</button>
                        </div>
                        <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors shadow-sm">
                            <Moon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-[40px] p-12 shadow-2xl shadow-slate-200/50 flex items-center justify-between gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent" />
                    <div className="space-y-6 max-w-2xl relative z-10">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-emerald-600 text-white text-[9px] font-black tracking-widest uppercase rounded-sm italic">プレミアム インサイト</span>
                            <span className="w-10 h-[1px] bg-slate-200" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">市場インテリジェンス</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight italic">
                            グローバル株式市場のアルファを、AIが掘り起こす
                        </h1>
                        <p className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 italic">
                            No Deception — <span className="text-slate-500">ファンダメンタルズとテクニカルの両軸で、誠実に評価</span>
                        </p>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed italic">
                            S&P500・日経225・欧州主要株のPER・PBR・短期売買シグナルをリアルタイムで統合。機関投資家と同じ視点を、個人投資家の手元に。
                        </p>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-8 rounded-[32px] max-w-sm flex items-start gap-4">
                        <AlertCircle className="w-10 h-10 text-rose-500 mt-1" />
                        <div className="space-y-1 italic">
                            <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest">重要事項：リスク管理</div>
                            <div className="text-sm font-black text-slate-900 leading-tight">投資は自己責任でお願いします</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-full flex items-center justify-center"><Activity className="w-4 h-4 text-emerald-600" /></div>
                            <h3 className="text-2xl font-black text-slate-900 italic tracking-tight uppercase">ウォッチリスト ランキング</h3>
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-100 rounded-lg italic">30 / 30</span>
                        </div>
                        <div className="flex-1 max-w-lg relative bg-slate-100 rounded-2xl border border-slate-200">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 font-bold" />
                            <input type="text" placeholder="ティッカーを検索..." className="w-full bg-transparent pl-11 pr-4 py-3.5 text-xs font-black text-slate-600 placeholder:text-slate-400 focus:outline-none italic" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-black">
                        {stocks.map((stock, i) => (
                            <StockCard key={i} {...stock} />
                        ))}
                    </div>

                    <div className="flex justify-center pt-4">
                        <button className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-emerald-600 hover:text-emerald-600 transition-all italic shadow-sm group">
                            <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                            Show All 30 Stocks
                        </button>
                    </div>
                </div>

                {/* Pro Indicators Section (NEW) */}
                <section className="pt-20 space-y-10">
                    <div className="flex items-center gap-3">
                        <Activity className="w-8 h-8 text-emerald-600" />
                        <h3 className="text-3xl font-black text-slate-900 italic tracking-tight uppercase">Pro Indicators</h3>
                        <span className="px-3 py-1 bg-emerald-600 text-white text-[9px] font-black tracking-widest uppercase rounded-sm italic ml-4">Synapse Exclusive</span>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden font-black">
                        <div className="flex items-center bg-slate-100/50 border-b border-slate-100 px-8">
                            {['Sector Heatmap', 'Earnings Radar', 'Short Interest', 'AI Momentum'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-6 text-[10px] font-black tracking-widest uppercase italic transition-all relative ${activeTab === tab ? 'text-emerald-600 bg-white' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        {tab === 'Sector Heatmap' && <LayoutGrid className="w-4 h-4" />}
                                        {tab === 'Earnings Radar' && <Calendar className="w-4 h-4" />}
                                        {tab === 'Short Interest' && <AlertCircle className="w-4 h-4" />}
                                        {tab === 'AI Momentum' && <Zap className="w-4 h-4" />}
                                        {tab}
                                    </div>
                                    {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-600" />}
                                </button>
                            ))}
                        </div>
                        <div className="p-12 min-h-[400px]">
                            {activeTab === 'Sector Heatmap' && (
                                <div className="space-y-8 italic">
                                    <p className="text-[10px] font-bold text-slate-400 opacity-80 uppercase tracking-widest">Today's sector performance (mock AI-estimated).</p>
                                    <div className="space-y-4">
                                        {[
                                            { name: "Semiconductors", perf: "+3.48%", color: "bg-emerald-500" },
                                            { name: "Technology", perf: "+2.14%", color: "bg-emerald-500" },
                                            { name: "Healthcare", perf: "+0.82%", color: "bg-emerald-400" },
                                            { name: "Energy", perf: "+0.81%", color: "bg-emerald-400" },
                                            { name: "Financials", perf: "+0.55%", color: "bg-emerald-300" },
                                            { name: "Consumer", perf: "-0.09%", color: "bg-rose-300" },
                                            { name: "Luxury", perf: "-0.71%", color: "bg-rose-400" },
                                            { name: "EV / Auto", perf: "-2.61%", color: "bg-rose-500" },
                                        ].map((sector, i) => (
                                            <div key={i} className="flex items-center gap-6 group">
                                                <div className="w-32 text-[11px] font-black text-slate-700 uppercase tracking-tight">{sector.name}</div>
                                                <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden flex justify-start">
                                                    <div className={`h-full ${sector.color} rounded-full transition-all duration-1000`} style={{ width: sector.perf.replace('+', '').replace('-', '') }} />
                                                </div>
                                                <div className={`w-16 text-right text-[11px] font-black italic tabular-nums ${sector.perf.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{sector.perf}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {activeTab !== 'Sector Heatmap' && (
                                <div className="flex flex-col items-center justify-center gap-6 h-64 italic">
                                    <BarChart3 className="w-12 h-12 text-slate-100" />
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Preparing Full Node Data...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <div className="flex flex-col items-center gap-8 py-20">
                    <div className="w-[1px] h-32 bg-gradient-to-b from-slate-200 to-transparent" />
                </div>
            </main>

            <IntegrityFooter />
        </div>
    );
}

const StockCard = ({ ticker, name, price, chg, marketCap, rank, per, pbr, type, region }: any) => {
    const isUp = chg.startsWith('+');
    return (
        <div className="bg-white border border-slate-100 rounded-[32px] p-8 space-y-6 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all group cursor-crosshair">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black border border-amber-100 rounded sm uppercase tracking-widest italic">{type}</span>
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[8px] font-black rounded sm italic">{region}</span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter italic">{ticker}</h4>
                    <p className="text-[10px] font-bold text-slate-400 opacity-80">{name}</p>
                </div>
                <div className="text-right space-y-1">
                    <div className="text-2xl font-black text-rose-500 tracking-tight tabular-nums italic">{price}</div>
                    <div className={`text-[10px] font-black italic flex items-center justify-end gap-1 ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isUp ? '↗' : '↘'} {chg}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 italic">
                <div className="space-y-1">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><BarChart3 className="w-3 h-3" /> 時価総額</div>
                    <div className="text-sm font-black text-slate-900 uppercase">#{rank} {marketCap}</div>
                </div>
                <div className="text-right space-y-1">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-end gap-2"><LayoutGrid className="w-3 h-3" /> PER / PBR</div>
                    <div className="text-sm font-black text-slate-900 uppercase">{per} / {pbr}</div>
                </div>
            </div>
            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-80 italic">AIシグナル: スイング</span>
                </div>
                <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 flex items-center gap-1 group-hover:underline italic transition-all">詳細 →</button>
            </div>
        </div>
    );
};
