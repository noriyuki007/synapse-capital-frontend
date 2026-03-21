'use client';

import React, { useState } from 'react';
import { Activity, Globe, AlertCircle, Zap, BarChart3, TrendingUp, Cpu, Building2, LayoutGrid } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Modal } from '@/components/Modal';

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

export default function StocksProClient({ locale, dict }: { locale: string, dict: any }) {
    const [activeTab, setActiveTab] = useState('Sector Heatmap');

    const stocks = [
        { ticker: "AAPL", name: "Apple Inc.", price: "185.928", chg: "-0.20%", rank: 1, per: "28.5", type: dict.stocks_pro.sector_tech, region: "US" },
        { ticker: "MSFT", name: "Microsoft Corp.", price: "415.144", chg: "+0.35%", rank: 2, per: "35.8", type: dict.stocks_pro.sector_tech, region: "US" },
        { ticker: "NVDA", name: "NVIDIA Corp.", price: "726.254", chg: "+0.39%", rank: 3, per: "65.4", type: dict.stocks_pro.sector_semi, region: "US" },
        { ticker: "GOOGL", name: "Alphabet Inc.", price: "142.30", chg: "+1.08%", rank: 4, per: "24.1", type: dict.stocks_pro.sector_tech, region: "US" },
        { ticker: "AMZN", name: "Amazon.com Inc.", price: "167.286", chg: "-0.67%", rank: 5, per: "60.2", type: "EC/小売", region: "US" },
        { ticker: "META", name: "Meta Platforms", price: "99.996", chg: "-1.29%", rank: 6, per: "31.2", type: dict.stocks_pro.sector_tech, region: "US" },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
            <Header locale={locale} dict={dict} />
            <ProTicker />

            <main className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-slate-100 bg-white min-h-screen shadow-sm">
                
                <div className="lg:col-span-8 p-6 md:p-12 lg:p-16 space-y-20 border-r border-slate-100">
                    
                    <div className="space-y-8 max-w-2xl">
                        <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-none text-[12px] font-black text-slate-500 uppercase tracking-widest">
                            {dict.stocks_pro.hero_badge}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none font-sans uppercase whitespace-nowrap">
                            {dict.stocks_pro.hero_title}
                        </h1>
                        <p className="text-base font-medium text-slate-500 max-w-xl leading-relaxed uppercase border-l-2 border-slate-100 pl-8">
                            {dict.stocks_pro.hero_desc}
                        </p>
                    </div>

                    <section className="space-y-10 pt-16 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[13px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-slate-900 leading-none">
                                <BarChart3 className="w-4 h-4 text-indigo-600" />
                                {dict.stocks_pro.terminal_title}
                            </h2>
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{dict.stocks_pro.market_data_synced}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {stocks.map((stock, i) => (
                                <StockCard key={i} {...stock} dict={dict} />
                            ))}
                        </div>
                    </section>

                    <section className="space-y-10 pt-16 border-t border-slate-100">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <span className="w-4 h-px bg-slate-900" />
                            {dict.stocks_pro.pro_indicators}
                        </h3>

                        <div className="bg-white border border-slate-100 rounded-none shadow-sm overflow-hidden">
                            <div className="flex items-center bg-slate-50 border-b border-slate-100 overflow-x-auto">
                                {[
                                    { id: 'Sector Heatmap', label: dict.stocks_pro.sector_heatmap },
                                    { id: 'Earnings Radar', label: dict.stocks_pro.earnings_radar },
                                    { id: 'AI Momentum', label: dict.stocks_pro.ai_momentum }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-8 py-5 text-[11px] font-black tracking-widest uppercase transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-indigo-600 bg-white' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {tab.label}
                                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-600" />}
                                    </button>
                                ))}
                            </div>
                            <div className="p-8">
                                {activeTab === 'Sector Heatmap' && (
                                    <div className="space-y-6">
                                        {[
                                            { name: dict.stocks_pro.sector_semi, perf: "+3.48%", color: "bg-emerald-500" },
                                            { name: dict.stocks_pro.sector_tech, perf: "+2.14%", color: "bg-emerald-500" },
                                            { name: dict.stocks_pro.sector_ev, perf: "-2.61%", color: "bg-rose-500" },
                                        ].map((sector, i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <div className="w-32 text-[11px] font-black text-slate-700 uppercase">{sector.name}</div>
                                                <div className="flex-1 h-1.5 bg-slate-50 rounded-none overflow-hidden flex justify-start">
                                                    <div className={`h-full ${sector.color} rounded-none transition-all`} style={{ width: sector.perf.replace('+', '').replace('-', '') }} />
                                                </div>
                                                <div className={`w-12 text-right text-[11px] font-black tabular-nums ${sector.perf.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{sector.perf}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {activeTab === 'Earnings Radar' && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-[11px] uppercase font-black tracking-tight">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-slate-400">
                                                    <th className="py-4 text-left font-black">{dict.stocks_pro.table_ticker}</th>
                                                    <th className="py-4 text-center font-black">{dict.stocks_pro.table_date}</th>
                                                    <th className="py-4 text-right font-black">{dict.stocks_pro.table_sentiment}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {[
                                                    { ticker: "NVDA", date: "2026-05-20", sentiment: 'sent_extreme_bull', color: "text-emerald-500" },
                                                    { ticker: "AAPL", date: "2026-05-02", sentiment: 'sent_neutral', color: "text-slate-400" },
                                                    { ticker: "TSLA", date: "2026-04-24", sentiment: 'sent_caution', color: "text-rose-500" },
                                                ].map((row, i) => (
                                                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                                        <td className="py-5 font-black text-slate-900">{row.ticker}</td>
                                                        <td className="py-5 text-center tabular-nums text-slate-500">{row.date}</td>
                                                        <td className={`py-5 text-right font-black ${row.color}`}>{dict.stocks_pro[row.sentiment]}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                {activeTab === 'AI Momentum' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            { ticker: "NVDA", rsi: 72, rsiLabel: 'overbought', ma: 'golden_cross', trend: 'bullish' },
                                            { ticker: "MSFT", rsi: 58, rsiLabel: 'bullish', ma: 'aligned', trend: 'status_stable' },
                                        ].map((item, i) => (
                                            <div key={i} className="p-6 bg-slate-50 border border-slate-100 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-black text-slate-900">{item.ticker}</span>
                                                    <span className="text-[11px] font-black text-indigo-600 uppercase">{dict.pro[item.trend] || dict.stocks_pro[item.trend]}</span>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-[11px] font-black uppercase">
                                                        <span className="text-slate-400">RSI (14)</span>
                                                        <span className={item.rsi > 70 ? 'text-rose-500' : 'text-slate-900'}>{item.rsi} ({dict.stocks_pro[item.rsiLabel]})</span>
                                                    </div>
                                                    <div className="flex justify-between text-[11px] font-black uppercase">
                                                        <span className="text-slate-400">MA シグナル</span>
                                                        <span className="text-slate-900">{dict.stocks_pro[item.ma]}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-12 pt-16 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                    <Cpu className="w-4 h-4 text-indigo-600" />
                                    {dict.stocks_pro.alpha_scouter}
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { ticker: "NVDA", score: 98, label: 'bull_divergence', status: "BULL" },
                                        { ticker: "TSLA", score: 42, label: 'bottom_fishing', status: "WAIT" },
                                        { ticker: "AAPL", score: 76, label: 'box_breakout', status: "BULL" },
                                    ].map((stock, i) => (
                                        <div key={i} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-none">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-black text-slate-900 font-sans">{stock.ticker}</span>
                                                <span className="text-[11px] font-bold text-slate-400 uppercase">{dict.stocks_pro[stock.label]}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-xs font-black text-indigo-600 tabular-nums">{stock.score}</div>
                                                    <div className="text-[11px] font-black text-slate-300 uppercase">{dict.stocks_pro.alpha_score}</div>
                                                </div>
                                                <div className={`w-2 h-2 rounded-none ${stock.status === 'BULL' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase">
                                    {dict.stocks_pro.alpha_desc}
                                </p>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                    <Building2 className="w-4 h-4 text-emerald-600" />
                                    {dict.stocks_pro.institutional_flow}
                                </h3>
                                <div className="p-8 bg-white border border-slate-100 rounded-none space-y-8">
                                    <div className="flex justify-around items-end h-32 gap-2">
                                        {[30, 85, 45, 90, 65, 40].map((h, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                                <div className={`w-full ${i === 3 || i === 1 ? 'bg-indigo-600' : 'bg-slate-100'} rounded-none transition-all duration-1000`} style={{ height: `${h}%` }} />
                                                <span className="text-[11px] font-black text-slate-300">D-{5-i}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[11px] font-black uppercase">
                                            <span className="text-slate-400">{dict.stocks_pro.net_inflow}</span>
                                            <span className="text-indigo-600">+$2.4B ({dict.stocks_pro.weekly})</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase">
                                            {dict.stocks_pro.flow_desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-10 pt-16 border-t border-slate-100">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-slate-900 leading-none">
                            <LayoutGrid className="w-4 h-4 text-slate-400" />
                            {dict.stocks_pro.sector_dispersion}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { sector: dict.stocks_pro.sector_tech, dispersion: 'disp_high', risk: 'risk_concentration' },
                                { sector: "ヘルスケア", dispersion: 'disp_low', risk: 'risk_stable' },
                                { sector: "エネルギー", dispersion: 'disp_mid', risk: 'risk_high_vola' },
                            ].map((item, i) => (
                                <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-none space-y-3">
                                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.sector}</div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-lg font-black text-slate-900 uppercase">{dict.stocks_pro[item.dispersion]}</div>
                                        <div className="text-[11px] font-black text-indigo-600 uppercase border border-indigo-100 px-1 py-0.5">{dict.stocks_pro[item.risk]}</div>
                                    </div>
                                    <div className="w-full h-1 bg-white">
                                        <div className="h-full bg-indigo-600" style={{ width: item.dispersion === 'disp_high' ? '80%' : item.dispersion === 'disp_mid' ? '50%' : '20%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[11px] font-bold text-slate-300 leading-relaxed uppercase">
                            {dict.stocks_pro.disp_desc}
                        </p>
                    </section>
                </div>

                <div className="lg:col-span-4 p-6 md:p-10 border-none bg-white">
                    <Sidebar 
                        locale={locale}
                        dict={dict}
                        latestReports={[]} 
                        stats={{ winRate: 100, total: 242 }} 
                    />
                </div>
            </main>

            <Footer locale={locale} dict={dict} />
        </div>
    );
}

const StockCard = ({ ticker, name, price, chg, rank, per, type, dict }: any) => {
    const isUp = chg.startsWith('+');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    return (
        <div className="bg-white border border-slate-100 rounded-none p-6 space-y-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-crosshair group">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-none border border-indigo-100 inline-block uppercase tracking-widest mb-1">{type}</div>
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
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{dict.stocks_pro.market_rank}</div>
                    <div className="text-xs font-black text-slate-900 uppercase">NO. {rank}</div>
                </div>
                <div className="text-right space-y-1">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{dict.stocks_pro.est_per}</div>
                    <div className="text-xs font-black text-slate-900 uppercase">{per}x</div>
                </div>
            </div>
            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest opacity-80">{dict.stocks_pro.ai_eval_breakout}</span>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:underline transition-all"
                >
                    {dict.pro.view_details}
                </button>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={dict.stocks_pro.modal_stock_deep.replace('{ticker}', ticker)}
            >
                <div className="space-y-8">
                    <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100">
                        <div className="space-y-1">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{dict.stocks_pro.table_ticker}</div>
                            <div className="text-xl font-black text-slate-900">{name}</div>
                        </div>
                        <div className="text-right space-y-1">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{dict.pro.current_status}</div>
                            <div className="text-xl font-black text-slate-900 tabular-nums">{price}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-5 bg-white border border-slate-100 space-y-3">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{dict.stocks_pro.valuation_metrics}</div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-slate-500">{dict.stocks_pro.est_per}</span>
                                    <span className="font-black text-slate-900">{per}x</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-slate-500">{dict.stocks_pro.market_rank}</span>
                                    <span className="font-black text-slate-900">第 {rank} 位</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 bg-white border border-slate-100 space-y-3">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{dict.stocks_pro.momentum_diagnosis}</div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-slate-500">{dict.stocks_pro.prev_day_ratio}</span>
                                    <span className={`font-black ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>{chg}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-slate-500">{dict.crypto_pro.volatility}</span>
                                    <span className="font-black text-slate-900">{dict.crypto_pro.vola_stable}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border border-slate-100 space-y-4">
                        <div className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{dict.stocks_pro.ai_investment_verdict}</div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {dict.stocks_pro.investment_verdict_text.replace('{ticker}', ticker).replace('{type}', type)}
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
