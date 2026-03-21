'use client';

import React from 'react';
import { Activity, Globe, AlertCircle, Zap, TrendingUp } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Modal } from '@/components/Modal';

/**
 * Shared Pro Ticker (Light Version)
 */
const ProTicker = ({ dict }: { dict: any }) => {
    const fxItems = [
        { label: "USD/JPY", val: "150.45", chg: "-0.12%", up: false },
        { label: "EUR/USD", val: "1.0820", chg: "+0.05%", up: true },
        { label: "BTC/USD", val: "51,200.00", chg: "+1.20%", up: true },
        { label: { key: 'ticker.gold', fallback: "GOLD" }, val: "2,024.10", chg: "+0.15%", up: true },
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
                        <span className="text-slate-400 uppercase">
                            {typeof item.label === 'string' ? item.label : dict.ticker.gold}
                        </span>
                        <span className="text-slate-900 tabular-nums">{item.val}</span>
                        <span className={item.up ? "text-emerald-500" : "text-rose-500"}>{item.chg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function FXProClient({ locale, dict }: { locale: string, dict: any }) {
    const pairs = [
        { label: "USD/JPY", status: 'status_stable', sync: 50, levels: [true, true, false, false], consistency: 'cons_mid' },
        { label: "EUR/USD", status: 'status_stable', sync: 50, levels: [true, true, null, false], consistency: 'cons_mid' },
        { label: "GBP/USD", status: 'status_syncing', sync: 100, levels: [false, false, false, false], consistency: 'cons_mid' },
        { label: "AUD/USD", status: 'status_stable', sync: 50, levels: [true, true, null, false], consistency: 'cons_low' },
        { label: "USD/CAD", status: 'status_in_progress', sync: 75, levels: [false, true, true, false], consistency: 'cons_high' },
        { label: "EUR/JPY", status: 'status_stable', sync: 25, levels: [false, false, false, false], consistency: 'cons_low' },
        { label: "GBP/JPY", status: 'status_stable', sync: 50, levels: [false, false, false, false], consistency: 'cons_mid' },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            <ProTicker dict={dict} />

            <Header locale={locale} dict={dict} />

            <main className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-slate-100 bg-white shadow-sm">
                
                <div className="lg:col-span-8 p-6 md:p-12 lg:p-16 space-y-20 border-r border-slate-100">
                    
                    <div className="space-y-8 max-w-2xl">
                        <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-none text-[12px] font-black text-slate-500 uppercase tracking-widest">
                            {dict.pro.hero_badge}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none font-sans uppercase whitespace-nowrap">
                            {dict.pro.hero_title}
                        </h1>
                        <p className="text-base font-medium text-slate-500 max-w-xl leading-relaxed uppercase border-l-2 border-slate-100 pl-8">
                            {dict.pro.hero_desc}
                        </p>
                    </div>

                    <section className="space-y-10 pt-16 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[13px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-slate-900 leading-none">
                                <Activity className="w-4 h-4 text-indigo-600" />
                                {dict.pro.terminal_title}
                            </h2>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{dict.pro.last_sync.replace('{time}', '8:52:37')}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pairs.map((pair, i) => (
                                <FXCard key={i} {...pair} dict={dict} />
                            ))}
                        </div>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-16 border-t border-slate-100">
                        <div className="space-y-4">
                            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{dict.pro.usd_theme_title}</div>
                            <h4 className="text-xl font-black tracking-tight text-slate-900 font-sans uppercase">{dict.pro.usd_theme_desc_title || "米利下げ期待の後退"}</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed uppercase">
                                {dict.pro.usd_theme_desc}
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{dict.pro.jpy_theme_title}</div>
                            <h4 className="text-xl font-black tracking-tight text-slate-900 font-sans uppercase">{dict.pro.jpy_theme_desc_title || "マイナス金利解除の模索"}</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed uppercase">
                                {dict.pro.jpy_theme_desc}
                            </p>
                        </div>
                    </section>

                    <section className="space-y-12 pt-16 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                    <Globe className="w-4 h-4 text-indigo-600" />
                                    {dict.pro.sentiment_radar}
                                </h3>
                                <div className="p-8 bg-slate-50 border border-slate-100 rounded-none space-y-6">
                                    {[
                                        { label: dict.pro.sentiment_bullish, val: 68, color: "bg-emerald-500" },
                                        { label: dict.pro.sentiment_neutral, val: 22, color: "bg-slate-300" },
                                        { label: dict.pro.sentiment_bearish, val: 10, color: "bg-rose-500" },
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
                                        {dict.pro.sentiment_desc}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    {dict.pro.vola_scanner}
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { pair: "USD/JPY", vola: 'vola_high', val: "1.24%" },
                                        { pair: "EUR/USD", vola: 'vola_low', val: "0.45%" },
                                        { pair: "GBP/JPY", vola: 'vola_mid', val: "0.88%" },
                                        { pair: "AUD/USD", vola: 'vola_mid', val: "0.72%" },
                                    ].map((item, i) => (
                                        <div key={i} className="p-4 bg-white border border-slate-100 rounded-none space-y-1">
                                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.pair}</div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-black text-slate-900 tabular-nums">{item.val}</span>
                                                <span className={`text-[11px] font-black px-1 py-0.5 rounded-none ${
                                                    item.vola === 'vola_high' ? 'bg-rose-50 text-rose-500 border border-rose-100' :
                                                    item.vola === 'vola_mid' ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                                                    'bg-emerald-50 text-emerald-500 border border-emerald-100'
                                                }`}>
                                                    {dict.pro[item.vola]}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase">
                                    {dict.pro.vola_desc}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-10 pt-16 border-t border-slate-100">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-slate-900 leading-none">
                            <Globe className="w-4 h-4 text-slate-400" />
                            {dict.pro.correlation_matrix}
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[12px] uppercase font-black tracking-tight">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400">
                                        <th className="py-4 text-left font-black">{dict.pro.corr_pair}</th>
                                        <th className="py-4 text-center font-black">{dict.pro.corr_coeff}</th>
                                        <th className="py-4 text-right font-black">{dict.pro.corr_status}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {[
                                        { pair: "USD/JPY vs US10Y", corr: "+0.88", status: 'corr_strong_pos' },
                                        { pair: "EUR/USD vs GOLD", corr: "+0.64", status: 'corr_mid_pos' },
                                        { pair: "USD/CAD vs OIL", corr: "-0.82", status: 'corr_strong_neg' },
                                        { pair: "GBP/USD vs FTSE", corr: "+0.45", status: 'corr_weak_pos' },
                                    ].map((row, i) => (
                                        <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                            <td className="py-5 font-black text-slate-900">{row.pair}</td>
                                            <td className="py-5 text-center tabular-nums text-indigo-600">{row.corr}</td>
                                            <td className="py-5 text-right text-slate-400">{dict.pro[row.status]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[11px] font-bold text-slate-300 leading-relaxed uppercase">
                            {dict.pro.corr_desc}
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

const FXCard = ({ label, status, sync, levels, consistency, dict }: any) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    return (
        <div className="bg-white border border-slate-100 rounded-none p-6 space-y-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-crosshair group">
            <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900 tracking-tighter uppercase font-sans">{label}</span>
                <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-none tracking-widest uppercase border ${
                    status === 'status_divergent' || status === 'status_in_progress' ? 'bg-rose-50 border-rose-100 text-rose-500' :
                    status === 'status_syncing' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' :
                    'bg-slate-50 border-slate-100 text-slate-400'
                }`}>
                    {dict.pro[status]}
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
                    <span className="text-slate-400">{dict.pro.sync_rate}</span>
                    <span className="text-indigo-600">{sync}%</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-none overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${sync}%` }} />
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">{dict.pro.consistency_alert.replace('{level}', dict.pro[consistency])}</span>
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
                title={dict.pro.modal_terminal_details.replace('{pair}', label)}
            >
                <div className="space-y-8">
                    <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100">
                        <div className="space-y-1">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{dict.pro.current_status}</div>
                            <div className="text-xl font-black text-slate-900">{dict.pro[status]}</div>
                        </div>
                        <div className="text-right space-y-1">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{dict.pro.sync_consistency}</div>
                            <div className="text-xl font-black text-indigo-600">{dict.pro[consistency]}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-200 pb-2">{dict.pro.mtf_analysis}</div>
                        <div className="grid grid-cols-4 gap-4">
                            {['15M', '1H', '4H', '1D'].map((tf, i) => {
                                const dir = levels[i];
                                return (
                                    <div key={tf} className="p-4 bg-white border border-slate-100 flex flex-col items-center gap-3">
                                        <div className="text-[13px] font-black text-slate-400 uppercase">{tf}</div>
                                        {dir === true && <TrendingUp className="w-6 h-6 text-emerald-500" />}
                                        {dir === false && <TrendingUp className="w-6 h-6 text-rose-500 rotate-180" />}
                                        {dir === null && <Activity className="w-6 h-6 text-slate-200" />}
                                        <div className="text-[10px] font-bold text-slate-900">{dir === true ? dict.pro.bullish_edge : dir === false ? dict.pro.bearish_edge : dict.pro.neutral_edge}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 border border-slate-100 space-y-4">
                        <div className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{dict.pro.ai_diagnosis}</div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {dict.pro.diagnosis_text.replace('{pair}', label).replace('{sync}', sync.toString()).replace('{detail}', dict.pro[consistency === 'cons_high' ? 'diagnosis_high' : 'diagnosis_low'])}
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
