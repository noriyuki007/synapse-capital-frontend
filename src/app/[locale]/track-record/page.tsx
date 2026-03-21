import React from 'react';
export const runtime = 'edge';
import { getSortedReportsData, getTrackRecordStats } from '@/lib/reports';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { Activity, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { getDictionary } from '@/locales/dictionaries';
import { Metadata } from 'next';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const params = await props.params;
    const locale = params?.locale || 'ja';
    const isJa = locale === 'ja';
    
    return {
        title: isJa ? "AI予測トラックレコード | Synapse Capital" : "AI Prediction Track Record | Synapse Capital",
        description: isJa 
            ? "嘘のないAI投資の世界を目指して。不都合な結果もすべて含めた、ありのままの予測実績をリアルタイムで公開します。" 
            : "Aiming for a world of AI investment without lies. Disclosing raw prediction performance in real time.",
    };
}

export default async function TrackRecordPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = params?.locale || 'ja';
    const dict = await getDictionary(locale);
    const reports = await getSortedReportsData();
    const stats = await getTrackRecordStats();

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            <Header locale={locale} dict={dict} />

            <main className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-slate-100 bg-white min-h-screen">
                
                {/* Main Content Area (8 columns) */}
                <div className="lg:col-span-8 p-6 md:p-12 lg:p-16 space-y-20 border-r border-slate-100">
                    
                    {/* Hero Section */}
                    <div className="space-y-8 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100/50 rounded-none">
                            <ShieldCheck className="w-4 h-4 text-indigo-600" />
                            <span className="text-[10px] font-black text-indigo-600 tracking-widest uppercase">{dict.track_record.hero_badge}</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none font-sans uppercase whitespace-nowrap">
                            {dict.track_record.hero_title}
                        </h1>
                        <p className="text-base font-medium text-slate-500 max-w-xl leading-relaxed uppercase border-l-2 border-slate-100 pl-8">
                            {dict.track_record.hero_desc}
                        </p>
                    </div>

                    {/* Main Stats Cards (Compact Grid) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-50 border border-slate-100 p-6 rounded-none space-y-2">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{dict.track_record.total_predictions}</div>
                            <div className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">{stats.total}</div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-none space-y-2">
                            <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">{dict.track_record.hits}</div>
                            <div className="text-3xl font-black text-emerald-600 tracking-tighter tabular-nums leading-none">{stats.hits}</div>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-none space-y-2">
                            <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none">{dict.track_record.win_rate}</div>
                            <div className="text-3xl font-black text-indigo-600 tracking-tighter tabular-nums leading-none">{stats.winRate}%</div>
                        </div>
                        <div className="bg-slate-100 border border-slate-200 p-6 rounded-none space-y-2">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{dict.track_record.pending}</div>
                            <div className="text-3xl font-black text-slate-400 tracking-tighter tabular-nums leading-none">{stats.pending}</div>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="space-y-10 pt-16 border-t border-slate-100">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-slate-900 leading-none">
                                <Activity className="w-4 h-4 text-indigo-600" />
                                {dict.common.prediction_history}
                            </h2>

                        <div className="bg-white border border-slate-100 rounded-none overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{dict.track_record.table_date}</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{dict.track_record.table_pair}</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{dict.track_record.table_prediction}</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{dict.track_record.table_result}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reports.map((report: any) => (
                                            <tr key={report.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 text-[10px] font-bold text-slate-400 whitespace-nowrap uppercase tracking-tighter tabular-nums">{report.date}</td>
                                                <td className="px-6 py-4"><span className="text-xs font-black text-slate-900 uppercase font-sans">{report.target_pair}</span></td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-none tracking-widest uppercase ${report.prediction_direction === 'UP' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                                        {report.prediction_direction === 'UP' ? dict.track_record.up : dict.track_record.down}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase ${report.result === 'HIT' ? 'text-emerald-500' : report.result === 'MISS' ? 'text-rose-500' : 'text-slate-300'}`}>
                                                        {report.result === 'HIT' && <CheckCircle2 className="w-3 h-3" />}
                                                        {report.result === 'MISS' && <XCircle className="w-3 h-3" />}
                                                        {report.result === 'HIT' ? dict.track_record.hit : report.result === 'MISS' ? dict.track_record.miss : dict.track_record.pending}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shared Sidebar */}
                <div className="lg:col-span-4 p-6 md:p-10 border-none bg-white">
                    <Sidebar 
                        locale={locale}
                        dict={dict}
                        latestReports={reports.slice(0, 3)} 
                        stats={stats} 
                    />
                </div>
            </main>
            <Footer locale={locale} dict={dict} />
        </div>
    );
}
