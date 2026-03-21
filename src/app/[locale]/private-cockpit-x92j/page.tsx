'use client';

import React from 'react';
import { ShieldAlert, TrendingUp, Target, ShieldCheck, Activity, ChevronRight, Globe, Layers, Zap } from 'lucide-react';

export async function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'ja' }];
}


const SecretCockpit = () => {
    const [assetClass, setAssetClass] = React.useState<'FX' | 'STOCKS' | 'CRYPTO'>('FX');
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            {/* Top Navigation Bar (Terminal Style) */}
            <div className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                            <ShieldAlert size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-mono font-bold text-emerald-500 tracking-widest uppercase">Deep Intel Cockpit</span>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-slate-600 text-[10px] font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                            CONNECTED_NODES: 3
                        </div>
                    </div>
                    
                    <div className="flex gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
                        {(['FX', 'STOCKS', 'CRYPTO'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setAssetClass(type)}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-2 ${assetClass === type ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 md:p-8">
                {/* Section Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                            <Activity className="text-emerald-500" size={28} />
                            {assetClass === 'FX' ? '為替・マクロ分析' : assetClass === 'STOCKS' ? '米国株・指数分析' : 'クリプト・流動性分析'}
                        </h1>
                        <p className="text-slate-500 text-xs mt-2 font-medium max-w-xl">
                            独自開発のマルチエージェントAIが全市場から優位性を抽出。
                            24h以内の期待値が最も高いシグナルを特定します。
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono p-2 bg-slate-900/50 rounded-lg border border-slate-800">
                        <span className="text-slate-500">LAST_SYSTEM_SYNC:</span>
                        <span className="text-emerald-400 font-bold">{mounted ? new Date().toLocaleTimeString() : '--:--:--'}</span>
                    </div>
                </div>

                <IntelContent key={assetClass} assetClass={assetClass} />
            </div>
        </div>
    );
};

const IntelContent = ({ assetClass }: { assetClass: string }) => {
    const [loading, setLoading] = React.useState(false);
    const [picks, setPicks] = React.useState<any[]>([]);
    const [error, setError] = React.useState<string | null>(null);

    const refreshIntel = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/internal-top-picks?assetClass=${assetClass}`);
            if (!res.ok) throw new Error('インテルの取得に失敗しました');
            const data = await res.json();
            setPicks(data.topPicks || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        refreshIntel();
    }, [assetClass]);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-32">
                <div className="relative w-24 h-24 mb-10">
                    <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full animate-[ping_3s_infinite]" />
                    <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin" />
                    <div className="absolute inset-4 border-b-2 border-emerald-400/40 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
                </div>
                <div className="space-y-4 text-center">
                   <div className="flex items-center gap-2 justify-center">
                       <Activity className="text-emerald-500 animate-pulse" size={16} />
                       <p className="text-emerald-400 font-mono text-xs tracking-[0.3em] font-black uppercase">Scanning {assetClass} Market</p>
                   </div>
                   <div className="flex flex-col gap-1">
                       <p className="text-slate-600 text-[9px] font-mono uppercase animate-pulse">Processing Multi-Agent Consensus...</p>
                       <p className="text-slate-700 text-[8px] font-mono uppercase tracking-tighter">Requesting nodes @ Tokyo/London/NewYork</p>
                   </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {picks.length > 0 ? picks.map((pick, i) => (
                    <PickCard key={pick.ticker} pick={pick} rank={i + 1} />
                )) : (
                    <div className="col-span-3 py-24 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                        <p className="text-slate-500 font-medium italic">現在、このアセットで基準を満たす明確なシグナルがありません。</p>
                        <button 
                            onClick={refreshIntel}
                            className="mt-6 px-6 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full transition-all border border-emerald-500/20"
                        >
                            RUN FULL SCAN
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-900/10 border border-red-500/30 rounded-xl text-red-200 text-xs font-mono shadow-lg">
                    <span className="text-red-500 font-bold mr-2">[SYSTEM_HALT]</span> {error}
                </div>
            )}
        </div>
    );
};

const PickCard = ({ pick, rank }: { pick: any, rank: number }) => {
    const isUp = pick.change24h >= 0;
    const isLong = pick.signal.decision === 'BUY';
    const [copied, setCopied] = React.useState(false);

    const copySignal = () => {
        const text = `${pick.symbol} ${isLong ? 'LONG' : 'SHORT'}\nEntry: ${pick.signal.entry}\nTP: ${pick.signal.tp}\nSL: ${pick.signal.sl}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xl transition-all hover:border-emerald-500/30 flex flex-col h-full">
            {/* Header: Rank and Symbol */}
            <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/20">
                        {rank}
                    </span>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none">{pick.symbol}</h3>
                        <p className="text-[9px] text-slate-500 font-mono mt-1 uppercase tracking-tighter">
                           Confidence: <span className="text-emerald-400 font-bold">{pick.score}%</span>
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-mono font-bold text-white">{pick.lastPrice?.toLocaleString()}</div>
                    <div className={`text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isUp ? '+' : ''}{pick.change24h?.toFixed(2)}%
                    </div>
                </div>
            </div>

            {/* Decision Banner */}
            <div className={`px-5 py-2 flex items-center justify-between ${isLong ? 'bg-emerald-500/5 text-emerald-400' : 'bg-red-500/5 text-red-400'}`}>
                <div className="flex items-center gap-2">
                    {isLong ? <TrendingUp size={14} /> : <Activity size={14} />}
                    <span className="text-[10px] font-black tracking-widest uppercase">{isLong ? '優位シナリオ: LONG' : '優位シナリオ: SHORT'}</span>
                </div>
                <span className="text-[9px] font-medium opacity-60">
                    {new Date(pick.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            {/* Trading Levels */}
            <div className="p-5 flex-grow space-y-3">
                <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between items-center p-2.5 bg-slate-800/20 rounded-lg border border-slate-800/50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">エントリー点</span>
                        <span className="font-mono font-bold text-white">{pick.signal.entry}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col p-2.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                            <span className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest mb-1">利確判定 (TP)</span>
                            <span className="font-mono font-bold text-emerald-400">{pick.signal.tp}</span>
                        </div>
                        <div className="flex flex-col p-2.5 bg-red-500/5 rounded-lg border border-red-500/10">
                            <span className="text-[9px] font-bold text-red-500/60 uppercase tracking-widest mb-1">損切判定 (SL)</span>
                            <span className="font-mono font-bold text-red-400">{pick.signal.sl}</span>
                        </div>
                    </div>
                </div>

                {/* Analysis */}
                <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                        &quot;{pick.signal.summary}&quot;
                    </p>
                </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/20 flex gap-2">
                <button 
                    onClick={copySignal}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-2 border border-slate-700"
                >
                    <Zap size={12} className={copied ? 'text-emerald-400' : ''} />
                    {copied ? 'コピー完了' : 'シグナルをコピー'}
                </button>
                <button 
                  className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition-all"
                  title="詳細分析"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default SecretCockpit;
