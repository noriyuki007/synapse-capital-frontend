'use client';

import React from 'react';
import { Activity, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const Sidebar = ({ latestReports = [], stats = { total: 0, winRate: 0 }, className = "" }: any) => {
    return (
        <aside className={`bg-white space-y-16 ${className}`}>
            <div className="space-y-10">
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                    <span className="w-4 h-px bg-slate-200" />
                    最新インテリジェンス
                </h2>
                
                <div className="space-y-10">
                    {latestReports.length > 0 ? (
                        latestReports.map((report: any) => (
                            <Link key={report.id} href={`/ja/reports/${report.id}`} className="block group">
                                <article className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[11px] font-black uppercase px-2 py-0.5 bg-white border border-slate-200 rounded-none text-slate-400 tracking-widest">
                                            {report.genre === 'FX' ? '為替' : report.genre === 'CRYPTO' ? '暗号資産' : '株式'}
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{report.date}</span>
                                    </div>
                                    <h4 className="text-lg font-black leading-tight text-slate-900 group-hover:text-indigo-600 transition-colors uppercase font-sans">
                                        {report.title}
                                    </h4>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-none ${report.prediction_direction === 'UP' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {report.prediction_direction === 'UP' ? '上昇予測' : '下落予測'}
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">対象: {report.target_pair}</span>
                                    </div>
                                </article>
                            </Link>
                        ))
                    ) : (
                        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">レポートがありません</div>
                    )}
                </div>

                <Link href="/ja/reports" className="w-full py-4 bg-white border border-slate-200 rounded-none text-[13px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 text-slate-500 hover:bg-black hover:text-white hover:border-black transition-all">
                    レポート一覧 <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Stats Widget */}
            <div className="p-10 bg-slate-50 border border-slate-100 rounded-none space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-24 h-24 text-slate-900" />
                </div>
                <div className="text-[13px] font-black text-slate-400 uppercase tracking-widest relative z-10">グローバル分析実績</div>
                <div className="space-y-6 relative z-10">
                    <div className="flex items-end gap-3 leading-none">
                        <span className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900">{stats.winRate}%</span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">的中率</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-none overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${stats.winRate}%` }} />
                    </div>
                    <div className="text-[12px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        {stats.total}件の公開レポートによる<br />公平な第三者検証結果
                    </div>
                </div>
            </div>
        </aside>
    );
};
