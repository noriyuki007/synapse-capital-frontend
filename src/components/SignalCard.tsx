'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Zap, ArrowRight, Info, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { Modal } from './Modal';

const GENRE_MAP: Record<string, string> = {
    'USD/JPY': 'FX', 'EUR/USD': 'FX', 'GBP/USD': 'FX',
    'S&P 500': 'STOCKS', '^GSPC': 'STOCKS',
    'BTC/USD': 'CRYPTO', 'ETH/USD': 'CRYPTO',
};

export const SignalCard = ({ pair, status, comment, entry, tp, sl, reliability, recommended_broker, locale, dict }: any) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [livePrice, setLivePrice] = useState<number | null>(null);

    useEffect(() => {
        const genre = GENRE_MAP[pair] || 'FX';
        const symbol = pair.replace('/', '');
        const fetchPrice = async () => {
            try {
                const res = await fetch(`/api/market/price?symbol=${encodeURIComponent(symbol)}&genre=${genre}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.price) setLivePrice(data.price);
                }
            } catch {}
        };
        fetchPrice();
        const interval = setInterval(fetchPrice, 30000);
        return () => clearInterval(interval);
    }, [pair]);

    const entryNum = parseFloat(entry);
    const pnl = livePrice && !isNaN(entryNum) && entryNum > 0
        ? ((status === 'SELL' ? entryNum - livePrice : livePrice - entryNum) / entryNum) * 100
        : null;

    return (
        <div className="bg-white border border-slate-200 rounded-none p-5 hover:border-black transition-all group flex flex-col gap-4 shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start">
                <div className="space-y-1 overflow-hidden flex-1 mr-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{dict.signals.target}</div>
                    <div className="text-base md:text-lg font-black text-black tracking-tighter tabular-nums truncate">{pair}</div>
                    {livePrice != null && (
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-500 tabular-nums">{livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: pair.includes('BTC') ? 2 : pair.includes('JPY') ? 3 : 4 })}</span>
                            {pnl != null && (
                                <span className={`text-[10px] font-black tabular-nums flex items-center gap-0.5 ${pnl >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    {pnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}%
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className={`px-2.5 py-1 rounded-none text-[12px] font-black tracking-widest ${
                    status === 'BUY' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    status === 'SELL' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                    'bg-slate-50 text-slate-600 border border-slate-200'
                }`}>
                    {status === 'BUY' ? dict.signals.buy : status === 'SELL' ? dict.signals.sell : dict.signals.neutral}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-px bg-slate-100 border border-slate-100 rounded-none overflow-hidden">
                <div className="bg-white p-2.5 space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{dict.signals.entry}</div>
                    <div className="text-xs font-black text-slate-900 tabular-nums">{entry}</div>
                </div>
                <div className="bg-white p-2.5 space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{dict.signals.tp}</div>
                    <div className="text-xs font-black text-emerald-600 tabular-nums">{tp}</div>
                </div>
                <div className="bg-white p-2.5 space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{dict.signals.sl}</div>
                    <div className="text-xs font-black text-rose-500 tabular-nums">{sl}</div>
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-[13px] font-medium text-slate-500 leading-relaxed line-clamp-2 border-l-2 border-slate-100 pl-3">
                    {comment}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50 gap-4">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                    >
                        <Info className="w-3.5 h-3.5" />
                        {dict.signals.details}
                    </button>
                    {recommended_broker && (
                        <Link href={`/${locale}/exchange/${recommended_broker}`} className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:text-black transition-colors">
                            {dict.signals.start_trading} <ArrowRight className="w-3 h-3" />
                        </Link>
                    )}
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={dict.signals.modal_title.replace('{pair}', pair)}
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{dict.signals.current_trend}</div>
                             <div className="text-xl font-black text-slate-900">
                                {status === 'BUY' ? dict.signals.uptrend : status === 'SELL' ? dict.signals.downtrend : dict.signals.range}
                            </div>
                        </div>
                        <div className="space-y-2 text-right">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{dict.signals.confidence}</div>
                            <div className="text-xl font-black text-indigo-600">{reliability === 'HIGH' ? '98%' : reliability === 'MID' ? '75%' : '42%'}</div>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-slate-50 border border-slate-100 space-y-4">
                        <div className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">{dict.signals.engine_commentary}</div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium capitalize">
                            {comment} {status === 'BUY' ? dict.signals.analysis_desc_buy : dict.signals.analysis_desc_sell}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{dict.signals.strategy}</div>
                        <ul className="space-y-2">
                            {[
                                { label: dict.signals.entry, val: entry },
                                { label: dict.signals.tp_target, val: tp },
                                { label: dict.signals.sl_limit, val: sl },
                            ].map((s, i) => (
                                <li key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                    <span className="text-[12px] font-bold text-slate-500 uppercase">{s.label}</span>
                                    <span className="text-sm font-black text-slate-900 tabular-nums">{s.val}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
