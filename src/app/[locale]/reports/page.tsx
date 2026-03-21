import React from 'react';
import { getSortedReportsData, getTrackRecordStats } from '@/lib/reports';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { ReportsList } from '@/components/ReportsList';
import { getDictionary } from '@/locales/dictionaries';
import { Activity, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function ReportsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);
    const allReportsData = await getSortedReportsData();
    const stats = await getTrackRecordStats();

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            <Header locale={locale} dict={dict} />

            <main className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-slate-100 bg-white min-h-screen">
                
                {/* Main Content Area (8 columns) */}
                <div className="lg:col-span-8 p-6 md:p-12 lg:p-16 space-y-24 border-r border-slate-100">
                    
                    {/* Hero Section */}
                    <div className="space-y-12">
                         <div className="space-y-6">
                             <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-indigo-50 border border-indigo-100/50 rounded-none text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none">
                                {dict.common.intelligence_hub}
                            </div>
                            <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight font-sans uppercase">
                                {dict.common.intelligence_reports}
                            </h1>
                        </div>
                        
                        <div className="space-y-8">
                            <p className="text-sm md:text-base font-bold text-slate-500 max-w-2xl leading-relaxed uppercase border-l-2 border-slate-100 pl-4 md:pl-8">
                                {dict.common.reports_desc_long}
                            </p>
                        </div>

                         {/* Visual Asset */}
                         <div className="relative h-[200px] md:h-[300px] rounded-none overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                            <img 
                                src="/images/ai_brain.png" 
                                alt="Intelligence Visual" 
                                className="w-full h-full object-cover opacity-80 grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/20 to-transparent" />
                        </div>
                    </div>

                    {/* Reports List (Client Component) */}
                    <ReportsList allReportsData={allReportsData} locale={locale} dict={dict} />
                </div>

                {/* Custom Sidebar for Reports List Page */}
                <div className="lg:col-span-4 p-6 md:p-10 border-none bg-white space-y-12">
                    {/* Featured Intelligence Section */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <Activity className="w-4 h-4 text-indigo-600" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
                                {dict.common.featured_intelligence}
                            </h2>
                        </div>
                        
                        <div className="space-y-6">
                            {allReportsData.slice(0, 3).map((report: any) => (
                                <Link key={report.id} href={`/${locale}/reports/${report.id}`} className="group block space-y-2">
                                    <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Editor&apos;s Pick</div>
                                    <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2 uppercase">
                                        {report.title}
                                    </h3>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5" />
                                        {report.date.replace(/-/g, '.')}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Stats Section */}
                    {stats && (
                        <section className="space-y-8">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                <Clock className="w-4 h-4 text-indigo-600" />
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
                                    {dict.common.performance_stats}
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border border-slate-100 bg-slate-50/50">
                                    <div className="text-[9px] font-black text-slate-400 uppercase mb-1">{dict.common.total_reports}</div>
                                    <div className="text-xl font-black text-slate-900">{stats.total}</div>
                                </div>
                                <div className="p-4 border border-slate-100 bg-indigo-50/30">
                                    <div className="text-[9px] font-black text-indigo-600 uppercase mb-1">{dict.common.win_rate_label}</div>
                                    <div className="text-xl font-black text-indigo-600">{stats.winRate}%</div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Simple Help Card */}
                    <div className="p-8 border border-slate-100 bg-slate-900 text-white space-y-4">
                        <div className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Institutional Access</div>
                        <h4 className="text-sm font-black leading-tight uppercase">{dict.common.institutional_access_title}</h4>
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase opacity-80">
                            {dict.common.institutional_access_desc}
                        </p>
                    </div>
                </div>
            </main>
            <Footer locale={locale} dict={dict} />
        </div>
    );
}
