'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSortedReportsData, getTrackRecordStats } from '@/lib/reports';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { Activity, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 6;

export default function ReportsPage() {
    const [allReportsData, setAllReportsData] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const reports = await getSortedReportsData();
            const trackStats = await getTrackRecordStats();
            setAllReportsData(reports);
            setStats(trackStats);
            setLoading(false);
        }
        loadData();
    }, []);

    // Pagination logic
    const totalPages = Math.ceil(allReportsData.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentReports = allReportsData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            <Header />

            <main className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-slate-100 bg-white min-h-screen">
                
                {/* Main Content Area (8 columns) */}
                <div className="lg:col-span-8 p-6 md:p-12 lg:p-16 space-y-24 border-r border-slate-100">
                    
                    {/* Hero Section */}
                    <div className="space-y-12">
                         <div className="space-y-6">
                             <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-indigo-50 border border-indigo-100/50 rounded-none text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none">
                                インテリジェンス・ハブ
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none font-sans uppercase whitespace-nowrap">
                                インテリジェンス・レポート
                            </h1>
                        </div>
                        
                        <div className="space-y-8">
                            <p className="text-sm md:text-base font-bold text-slate-500 max-w-2xl leading-relaxed uppercase border-l-2 border-slate-100 pl-8">
                                Synapse AIが導き出す、最新のマーケット・インサイト。テクニカル分析、ファンダメンタルズ、オンチェーンデータを統合した多角的な視点を提供します。
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

                    {/* Reports List */}
                    <section className="space-y-12">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-slate-900 leading-none">
                                <Activity className="w-4 h-4 text-indigo-600" />
                                予測履歴一覧 (Page {currentPage}/{totalPages})
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-12">
                            {currentReports.length > 0 ? (
                                currentReports.map((report: any) => (
                                    <Link key={report.id} href={`/ja/reports/${report.id}`} className="group block">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                                            <div className="md:col-span-2 space-y-2">
                                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{report.date}</div>
                                                <span className={`inline-block px-2 py-0.5 rounded-none text-[9px] font-black tracking-widest uppercase border ${
                                                    report.genre === 'FX' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                                    report.genre === 'CRYPTO' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                                    'bg-emerald-50 border-emerald-100 text-emerald-600'
                                                }`}>
                                                    {report.genre === 'FX' ? '為替' : report.genre === 'CRYPTO' ? '暗号資産' : '株式'}
                                                </span>
                                            </div>
                                            <div className="md:col-span-8 space-y-4">
                                                <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight font-sans uppercase">
                                                    {report.title}
                                                </h3>
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-none ${report.prediction_direction === 'UP' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        {report.prediction_direction === 'UP' ? '上昇予測' : '下落予測'}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">対象: {report.target_pair}</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-500 leading-relaxed line-clamp-2 uppercase">
                                                    {report.excerpt}
                                                </p>
                                            </div>
                                            <div className="md:col-span-2 flex justify-end">
                                                <div className="w-10 h-10 border border-slate-200 rounded-none flex items-center justify-center group-hover:bg-black group-hover:border-black group-hover:text-white transition-all">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 border-b border-slate-50 group-last:border-none" />
                                    </Link>
                                ))
                            ) : (
                                <div className="p-20 text-center border border-slate-100 rounded-none">
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">レポートがありません</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 pt-12 border-t border-slate-100">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-2 px-6 py-3 border border-slate-100 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-300 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Prev
                                </button>
                                
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                                        <button
                                            key={num}
                                            onClick={() => paginate(num)}
                                            className={`w-10 h-10 border text-[10px] font-black flex items-center justify-center transition-all ${
                                                num === currentPage 
                                                ? 'bg-indigo-600 border-indigo-600 text-white' 
                                                : 'border-slate-100 hover:border-black'
                                            }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-2 px-6 py-3 border border-slate-100 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-300 transition-all"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </section>
                </div>

                {/* Custom Sidebar for Reports List Page */}
                <div className="lg:col-span-4 p-6 md:p-10 border-none bg-white space-y-12">
                    {/* Featured Intelligence Section */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <Activity className="w-4 h-4 text-indigo-600" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
                                注目のインテリジェンス
                            </h2>
                        </div>
                        
                        <div className="space-y-6">
                            {allReportsData.slice(0, 3).map((report: any) => (
                                <Link key={report.id} href={`/ja/reports/${report.id}`} className="group block space-y-2">
                                    <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Editor&apos;s Pick</div>
                                    <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2 uppercase">
                                        {report.title}
                                    </h3>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{report.date}</div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Stats Section (Re-using logic from Sidebar but customized) */}
                    {stats && (
                        <section className="space-y-8">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                <Clock className="w-4 h-4 text-indigo-600" />
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
                                    パフォーマンス統計
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border border-slate-100 bg-slate-50/50">
                                    <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Reports</div>
                                    <div className="text-xl font-black text-slate-900">{stats.total}</div>
                                </div>
                                <div className="p-4 border border-slate-100 bg-indigo-50/30">
                                    <div className="text-[9px] font-black text-indigo-600 uppercase mb-1">Win Rate</div>
                                    <div className="text-xl font-black text-indigo-600">{stats.winRate}%</div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Simple Help Card */}
                    <div className="p-8 border border-slate-100 bg-slate-900 text-white space-y-4">
                        <div className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Institutional Access</div>
                        <h4 className="text-sm font-black leading-tight uppercase">機関投資家レベルの解析を、<br/>全てのトレーダーに。</h4>
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase opacity-80">
                            Synapse AIは24時間365日、グローバルマーケットを監視し、期待値の高いシグナルのみを抽出します。
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
