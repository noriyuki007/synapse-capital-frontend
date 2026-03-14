'use client';

import React, { useState } from 'react';
import { Activity, Globe, ChevronDown, CheckCircle2, AlertCircle, Search, Moon, Zap, BarChart3, TrendingUp, Filter, Bitcoin, ShieldCheck, Cpu, Building2, LayoutGrid, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

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
        <div className="w-full bg-slate-50 border-b border-slate-100 py-1.5 overflow-hidden sticky top-[57px] z-[40] backdrop-blur-sm">
            <div className="flex animate-ticker whitespace-nowrap">
                {[...stockItems, ...stockItems].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 text-[9px] font-bold tracking-tighter">
                        <span className="text-slate-400 uppercase">{item.label}</span>
                        <span className="text-slate-900 tabular-nums">{item.val}</span>
                        <span className={item.up ? "text-emerald-500" : "text-rose-500"}>{item.chg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};



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
        <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
            <Header />
            <ProTicker />

            <main className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-slate-100 bg-white min-h-screen shadow-sm">
                
                {/* Main Content Area (8 columns) */}
                <div className="lg:col-span-8 p-6 md:p-12 lg:p-16 space-y-20 border-r border-slate-100">
                    
                    {/* Hero Section */}
                    <div className="space-y-8 max-w-2xl">
                        <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-none text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            グローバル株式ターミナル V2.4 ライブ
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none font-sans uppercase whitespace-nowrap">
                            株式市場のアルファを、AIが発掘。
                        </h1>
                        <p className="text-base font-medium text-slate-500 max-w-xl leading-relaxed uppercase border-l-2 border-slate-100 pl-8">
                            S&P500・日経225・欧州主要株のPER・PBR・短期売買シグナルをリアルタイムで統合。機関投資家と同じ視点を、個人投資家の手元に。
                        </p>
                    </div>

                    {/* Stock Grid Area */}
                    <section className="space-y-10 pt-16 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-slate-900 leading-none">
                                <BarChart3 className="w-4 h-4 text-indigo-600" />
                                株式シナプス・ターミナル
                            </h2>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">市場データ同期済み</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {stocks.map((stock, i) => (
                                <StockCard key={i} {...stock} />
                            ))}
                        </div>
                    </section>

                    {/* Indicators Tab Section */}
                    <section className="space-y-10 pt-16 border-t border-slate-100">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <span className="w-4 h-px bg-slate-900" />
                            プロ・インジケーター
                        </h3>

                        <div className="bg-white border border-slate-100 rounded-none shadow-sm overflow-hidden">
                            <div className="flex items-center bg-slate-50 border-b border-slate-100 overflow-x-auto">
                                {[
                                    { id: 'Sector Heatmap', label: 'セクター熱量図' },
                                    { id: 'Earnings Radar', label: '決算レーダー' },
                                    { id: 'AI Momentum', label: 'AIモメンタム' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-8 py-5 text-[9px] font-black tracking-widest uppercase transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-indigo-600 bg-white' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {tab.label}
                                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-600" />}
                                    </button>
                                ))}
                            </div>
                            <div className="p-8">
                                {activeTab === 'Sector Heatmap' ? (
                                    <div className="space-y-6">
                                        {[
                                            { name: "半導体", perf: "+3.48%", color: "bg-emerald-500" },
                                            { name: "テクノロジー", perf: "+2.14%", color: "bg-emerald-500" },
                                            { name: "EV / 自動車", perf: "-2.61%", color: "bg-rose-500" },
                                        ].map((sector, i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <div className="w-32 text-[10px] font-black text-slate-700 uppercase">{sector.name}</div>
                                                <div className="flex-1 h-1.5 bg-slate-50 rounded-none overflow-hidden flex justify-start">
                                                    <div className={`h-full ${sector.color} rounded-none transition-all`} style={{ width: sector.perf.replace('+', '').replace('-', '') }} />
                                                </div>
                                                <div className={`w-12 text-right text-[10px] font-black tabular-nums ${sector.perf.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{sector.perf}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 gap-4 text-slate-200">
                                        <Activity className="w-8 h-8" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">ノードデータを統合中...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* New Pro Content: Alpha Scouter & Institutional Flows */}
                    <section className="space-y-12 pt-16 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                    <Cpu className="w-4 h-4 text-indigo-600" />
                                    AI アルファ・スカウター
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { ticker: "NVDA", score: 98, label: "強気乖離継続", status: "BULL" },
                                        { ticker: "TSLA", score: 42, label: "底打ち模索", status: "WAIT" },
                                        { ticker: "AAPL", score: 76, label: "ボックス上放れ", status: "BULL" },
                                    ].map((stock, i) => (
                                        <div key={i} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-none">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-black text-slate-900 font-sans">{stock.ticker}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{stock.label}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-xs font-black text-indigo-600 tabular-nums">{stock.score}</div>
                                                    <div className="text-[7px] font-black text-slate-300 uppercase">Alpha Score</div>
                                                </div>
                                                <div className={`w-2 h-2 rounded-none ${stock.status === 'BULL' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase">
                                    独自の多変量解析モデル（マルチファクターモデル）により、収益性、成長性、需給の観点から将来の超過収益（アルファ）を数値化。有望な投資対象をAIがスカウティングします。
                                </p>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                    <Building2 className="w-4 h-4 text-emerald-600" />
                                    機関投資家・大口フロー分析
                                </h3>
                                <div className="p-8 bg-white border border-slate-100 rounded-none space-y-8">
                                    <div className="flex justify-around items-end h-32 gap-2">
                                        {[30, 85, 45, 90, 65, 40].map((h, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                                <div className={`w-full ${i === 3 || i === 1 ? 'bg-indigo-600' : 'bg-slate-100'} rounded-none transition-all duration-1000`} style={{ height: `${h}%` }} />
                                                <span className="text-[7px] font-black text-slate-300">D-{5-i}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[10px] font-black uppercase">
                                            <span className="text-slate-400">ネット・資金流入</span>
                                            <span className="text-indigo-600">+$2.4B (Week)</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase">
                                            通常の気配値には現れないダークプールおよびブロックトレードのフローをAIが監視。スマートマネーの蓄積（買い集め）や配布（売り抜け）を鮮明に描き出します。
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Additional Pro Content: Sector Dispersion */}
                    <section className="space-y-10 pt-16 border-t border-slate-100">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-slate-900 leading-none">
                            <LayoutGrid className="w-4 h-4 text-slate-400" />
                            セクター分散分析 (Dispersion)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { sector: "Technology", dispersion: "High", risk: "Concentrated" },
                                { sector: "Healthcare", dispersion: "Low", risk: "Stable" },
                                { sector: "Energy", dispersion: "Mid", risk: "Volatile" },
                            ].map((item, i) => (
                                <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-none space-y-3">
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.sector}</div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-lg font-black text-slate-900 uppercase">{item.dispersion}</div>
                                        <div className="text-[8px] font-black text-indigo-600 uppercase border border-indigo-100 px-1 py-0.5">{item.risk}</div>
                                    </div>
                                    <div className="w-full h-1 bg-white">
                                        <div className="h-full bg-indigo-600" style={{ width: item.dispersion === 'High' ? '80%' : item.dispersion === 'Mid' ? '50%' : '20%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[9px] font-bold text-slate-300 leading-relaxed uppercase">
                            各セクター内での個別株の値動きの乖離を動的に測定。市場全体が同じ方向に動く「β（ベータ）相場」なのか、銘柄選別が重要となる「α（アルファ）相場」なのかを判定します。
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

const StockCard = ({ ticker, name, price, chg, rank, per, type }: any) => {
    const isUp = chg.startsWith('+');
    const typeLabel: any = { 'TECHNOLOGY': 'ハイテク', 'SEMICONDUCTORS': '半導体', 'E-COMMERCE': 'EC/小売' };
    
    return (
        <div className="bg-white border border-slate-100 rounded-none p-6 space-y-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-crosshair group">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-none border border-indigo-100 inline-block uppercase tracking-widest mb-1">{typeLabel[type] || type}</div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase font-sans">{ticker}</h4>
                    <p className="text-[9px] font-bold text-slate-400 opacity-80">{name}</p>
                </div>
                <div className="text-right space-y-1">
                    <div className="text-xl font-black text-slate-900 tracking-tight tabular-nums font-sans">{price}</div>
                    <div className={`text-[9px] font-black flex items-center justify-end gap-1 ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {chg}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="space-y-1">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">市場ランク</div>
                    <div className="text-xs font-black text-slate-900 uppercase">NO. {rank}</div>
                </div>
                <div className="text-right space-y-1">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">推定 PER</div>
                    <div className="text-xs font-black text-slate-900 uppercase">{per}x</div>
                </div>
            </div>
            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-80">AI評価: ブレイク期待</span>
                </div>
                <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline transition-all">詳細分析 →</button>
            </div>
        </div>
    );
};
