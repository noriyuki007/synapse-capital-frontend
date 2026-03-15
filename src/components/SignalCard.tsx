'use client';

import React from 'react';
import { Activity, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const SignalCard = ({ pair, status, comment, entry, tp, sl, reliability, recommended_broker }: any) => {
    const relJp: any = { 'HIGH': '高', 'MID': '中', 'LOW': '低' };
    
    return (
        <div className="bg-white border border-slate-200 rounded-none p-5 hover:border-black transition-all group flex flex-col gap-4 shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start">
                <div className="space-y-1 overflow-hidden flex-1 mr-2">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">分析対象</div>
                    <div className="text-base md:text-lg font-black text-black tracking-tighter tabular-nums truncate">{pair}</div>
                </div>
                <div className={`px-2.5 py-1 rounded-none text-[10px] font-black tracking-widest ${status === 'BUY' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                    {status === 'BUY' ? '買い推奨' : '売り推奨'}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-px bg-slate-100 border border-slate-100 rounded-none overflow-hidden">
                <div className="bg-white p-2.5 space-y-1">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">エントリー</div>
                    <div className="text-xs font-black text-slate-900 tabular-nums">{entry}</div>
                </div>
                <div className="bg-white p-2.5 space-y-1">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">利確 (TP)</div>
                    <div className="text-xs font-black text-emerald-600 tabular-nums">{tp}</div>
                </div>
                <div className="bg-white p-2.5 space-y-1">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">損切り (SL)</div>
                    <div className="text-xs font-black text-rose-500 tabular-nums">{sl}</div>
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed line-clamp-2 border-l-2 border-slate-100 pl-3">
                    {comment}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`w-1 h-3 rounded-none ${i <= (reliability === 'HIGH' ? 3 : reliability === 'MID' ? 2 : 1) ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                            ))}
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">AI信頼度: {relJp[reliability] || reliability}</span>
                    </div>
                    {recommended_broker && (
                        <Link href={`/ja/exchange/${recommended_broker}`} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:text-black transition-colors">
                            取引開始 <ArrowRight className="w-3 h-3" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};
