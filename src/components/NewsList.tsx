'use client';

import React, { useState } from 'react';
import { Clock, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

type NewsItem = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  coreMessage: string;
  actionableAdvice: string;
  publishedAt: string;
  updatedAt: string;
  importance: string;
  importanceLevel: number;
  markets: string[];
  assetClasses: string[];
  categories: string[];
  sentiment: string;
  freshness: string;
  keywords: string;
};

interface NewsListProps {
  items: NewsItem[];
  locale: string;
  dict: any;
}

const ITEMS_PER_PAGE = 20;

function formatDateTime(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}.${m}.${day} ${hh}:${mm}`;
  } catch {
    return '';
  }
}

export default function NewsList({ items, locale, dict }: NewsListProps) {
  const [filter, setFilter] = useState<'all' | '3' | '4' | '5'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = filter === 'all'
    ? items
    : items.filter(i => i.importanceLevel >= Number(filter));

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilter = (f: typeof filter) => {
    setFilter(f);
    setCurrentPage(1);
  };

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filterButtons: { label: string; value: typeof filter }[] = [
    { label: dict.news.filter_all, value: 'all' },
    { label: dict.news.filter_3, value: '3' },
    { label: dict.news.filter_4, value: '4' },
    { label: dict.news.filter_5, value: '5' },
  ];

  return (
    <section className="space-y-12">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex flex-wrap gap-2">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => handleFilter(btn.value)}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border ${
                filter === btn.value
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                  : 'border-slate-100 text-slate-500 hover:bg-black hover:border-black hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {dict.news.result_count}: {filtered.length}
        </div>
      </div>

      {/* News Items */}
      <div className="space-y-0">
        {paged.length > 0 ? (
          paged.map((item) => (
            <article key={item.id} className="py-10 border-b border-slate-100 last:border-none">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-2 space-y-2">
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3" />
                    {formatDateTime(item.publishedAt)}
                  </div>
                  <span className="inline-block px-2 py-0.5 text-[9px] font-black tracking-widest uppercase border bg-amber-50 border-amber-100 text-amber-600">
                    {item.importance}
                  </span>
                </div>
                <div className="md:col-span-10 space-y-3">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                    {item.title}
                  </h3>
                  <p className="text-sm font-bold text-slate-500 leading-relaxed line-clamp-3 uppercase">
                    {item.coreMessage}
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {dict.news.source_label}: {item.source || '—'}
                    </span>
                    {item.sourceUrl && (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-black flex items-center gap-1 transition-colors"
                      >
                        {dict.news.source_link} <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="py-20 text-center border border-slate-100">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              {dict.news.empty}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
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
          
          <div className="hidden md:flex items-center gap-2">
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
