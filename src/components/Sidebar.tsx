'use client';

import React from 'react';
import { Activity, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { AdSense } from './AdSense';

export const Sidebar = ({ 
    latestReports = [], 
    stats = { total: 0, winRate: 0 }, 
    className = "",
    locale,
    dict
}: any) => {
    return (
        <aside className={`bg-transparent space-y-16 ${className}`}>
            <div className="space-y-10">
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3">
                    <span className="w-4 h-px bg-slate-800" />
                    {dict.sidebar.latest_intel}
                </h2>
                
                <div className="space-y-10">
                    {latestReports.length > 0 ? (
                        latestReports.map((report: any) => (
                            <Link key={report.id} href={`/${locale}/reports/${report.id.replace(/-(ja|en)$/, '')}`} className="block group">
                                <article className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[11px] font-black uppercase px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-none text-slate-450 tracking-widest">
                                            {report.genre === 'FX' ? dict.sidebar.fx : report.genre === 'CRYPTO' ? dict.sidebar.crypto : dict.sidebar.stocks}
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-indigo-400" />
                                            {report.date.replace(/-/g, '.')}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-black leading-tight text-slate-100 group-hover:text-indigo-400 transition-colors uppercase font-sans">
                                        {report.title}
                                    </h4>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-none border ${report.prediction_direction === 'UP' ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-400' : 'bg-rose-950/30 border-rose-800/60 text-rose-400'}`}>
                                            {report.prediction_direction === 'UP' ? dict.sidebar.bullish : dict.sidebar.bearish}
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-450 uppercase tracking-tighter">{dict.common.target}: {report.target_pair}</span>
                                    </div>
                                </article>
                            </Link>
                        ))
                    ) : (
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{dict.common.no_reports}</div>
                    )}
                </div>

                <Link href={`/${locale}/reports/`} className="w-full py-4 bg-slate-900/60 border border-slate-800 rounded-none text-[13px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all shadow-sm">
                    {dict.common.all_reports} <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <AdSense adSlot="2355795749" className="mb-10" />

            {/* Stats Widget */}
            <div className="p-10 bg-slate-950 border border-slate-800/80 rounded-none space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-24 h-24 text-white" />
                </div>
                <div className="text-[13px] font-black text-slate-500 uppercase tracking-widest relative z-10">{dict.sidebar.track_record_title}</div>
                <div className="space-y-6 relative z-10">
                    <div className="flex items-end gap-3 leading-none">
                        <span className="text-4xl sm:text-6xl font-black tracking-tighter text-white">{stats.winRate}%</span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{dict.sidebar.win_rate}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-none overflow-hidden">
                        <div className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] transition-all duration-1000" style={{ width: `${stats.winRate}%` }} />
                    </div>
                    <div className="text-[12px] font-bold text-slate-450 uppercase tracking-widest leading-relaxed">
                        {dict.sidebar.stats_desc.replace('{total}', stats.total)}
                    </div>
                </div>
            </div>
        </aside>
    );
};
