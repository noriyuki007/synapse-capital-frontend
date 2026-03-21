'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReportsListProps {
    allReportsData: any[];
    locale: string;
    dict: any;
}

const ITEMS_PER_PAGE = 6;

export function ReportsList({ allReportsData, locale, dict }: ReportsListProps) {
    const [currentPage, setCurrentPage] = useState(1);

    // Pagination logic
    const totalPages = Math.ceil(allReportsData.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentReports = allReportsData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <section className="space-y-12">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-slate-900 leading-none">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    {dict.common.prediction_history} ({dict.common.page_indicator.replace('{current}', currentPage.toString()).replace('{total}', totalPages.toString())})
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-12">
                {currentReports.length > 0 ? (
                    currentReports.map((report: any) => (
                        <Link key={report.id} href={`/${locale}/reports/${report.id}`} className="group block">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                                <div className="md:col-span-2 space-y-2">
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {report.date.replace(/-/g, '.')}
                                    </div>
                                    <span className={`inline-block px-2 py-0.5 rounded-none text-[9px] font-black tracking-widest uppercase border ${
                                        report.genre === 'FX' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                        report.genre === 'CRYPTO' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                        'bg-emerald-50 border-emerald-100 text-emerald-600'
                                    }`}>
                                        {report.genre === 'FX' ? dict.common.fx : report.genre === 'CRYPTO' ? dict.common.crypto : dict.common.stocks}
                                    </span>
                                </div>
                                <div className="md:col-span-8 space-y-4">
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight font-sans uppercase">
                                        {report.title}
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-none ${report.prediction_direction === 'UP' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {report.prediction_direction === 'UP' ? dict.common.prediction_up : dict.common.prediction_down}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                            {dict.common.target_pair_label.replace('{pair}', report.target_pair)}
                                        </span>
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
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{dict.common.no_reports}</p>
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
                        {dict.common.prev}
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
                        {dict.common.next}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </section>
    );
}
