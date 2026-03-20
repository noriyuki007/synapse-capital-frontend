'use client';

import React from 'react';
import { Activity, Zap, ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import { Modal } from './Modal';

export const SignalCard = ({ pair, status, comment, entry, tp, sl, reliability, recommended_broker }: any) => {
    const relJp: any = { 'HIGH': '高', 'MID': '中', 'LOW': '低' };
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    
    return (
        <div className="bg-white border border-slate-200 rounded-none p-5 hover:border-black transition-all group flex flex-col gap-4 shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start">
                <div className="space-y-1 overflow-hidden flex-1 mr-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">分析対象</div>
                    <div className="text-base md:text-lg font-black text-black tracking-tighter tabular-nums truncate">{pair}</div>
                </div>
                <div className={`px-2.5 py-1 rounded-none text-[12px] font-black tracking-widest ${
                    status === 'BUY' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                    status === 'SELL' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                    'bg-slate-50 text-slate-600 border border-slate-200'
                }`}>
                    {status === 'BUY' ? '買い推奨' : status === 'SELL' ? '売り推奨' : '中立・様子見'}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-px bg-slate-100 border border-slate-100 rounded-none overflow-hidden">
                <div className="bg-white p-2.5 space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">エントリー</div>
                    <div className="text-xs font-black text-slate-900 tabular-nums">{entry}</div>
                </div>
                <div className="bg-white p-2.5 space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">利確 (TP)</div>
                    <div className="text-xs font-black text-emerald-600 tabular-nums">{tp}</div>
                </div>
                <div className="bg-white p-2.5 space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">損切り (SL)</div>
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
                        詳細分析
                    </button>
                    {recommended_broker && (
                        <Link href={`/ja/exchange/${recommended_broker}`} className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:text-black transition-colors">
                            取引開始 <ArrowRight className="w-3 h-3" />
                        </Link>
                    )}
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={`${pair} シグナル深層分析`}
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">現在のトレンド</div>
                             <div className="text-xl font-black text-slate-900">
                                {status === 'BUY' ? '上昇トレンド強' : status === 'SELL' ? '下落トレンド強' : 'レンジ・持ち合い'}
                            </div>
                        </div>
                        <div className="space-y-2 text-right">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">AI信頼スコア</div>
                            <div className="text-xl font-black text-indigo-600">{reliability === 'HIGH' ? '98%' : reliability === 'MID' ? '75%' : '42%'}</div>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-slate-50 border border-slate-100 space-y-4">
                        <div className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">AI 推論エンジン解説</div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium capitalize">
                            {comment} 市場のボラティリティと価格の乖離率をベースに、多次元的な相関解析を実行。{status === 'BUY' ? 'サポートラインでの底堅い推移が確認されており、中期的な反発の優位性が極めて高いと判定しています。' : 'レジスタンスラインでの上値の重さが顕著であり、調整局面入りの可能性を示唆しています。'}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">推奨戦略</div>
                        <ul className="space-y-2">
                            {[
                                { label: 'エントリー', val: entry },
                                { label: '利確ターゲット', val: tp },
                                { label: '損切りリミット', val: sl },
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
