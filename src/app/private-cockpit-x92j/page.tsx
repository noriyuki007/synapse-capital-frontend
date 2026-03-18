'use client';

import React from 'react';
import { ShieldAlert, TrendingUp, Target, ShieldCheck, Activity, ChevronRight, Globe, Layers, Zap } from 'lucide-react';

const SecretCockpit = () => {
    const [assetClass, setAssetClass] = React.useState<'FX' | 'STOCKS' | 'CRYPTO'>('FX');

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8">
            {/* Header - Security Warning */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-900/30 rounded-lg text-red-400">
                        <ShieldAlert size={20} />
                    </div>
                    <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-bold">
                        Restricted Access // Private Intelligence
                    </span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">
                    Deep <span className="text-emerald-400">Intel</span> Cockpit
                </h1>
                
                {/* Asset Tabs */}
                <div className="flex gap-2 p-1 bg-slate-900/50 rounded-xl border border-slate-800 w-fit mb-6">
                    {(['FX', 'STOCKS', 'CRYPTO'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setAssetClass(type)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${assetClass === type ? 'bg-emerald-500 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {type === 'FX' && <Globe size={14} />}
                            {type === 'STOCKS' && <Layers size={14} />}
                            {type === 'CRYPTO' && <Zap size={14} />}
                            {type}
                        </button>
                    ))}
                </div>

                <p className="text-slate-400 max-w-2xl text-xs leading-relaxed font-medium">
                    3名の専門家AIが{assetClass}市場を全スキャン。直近24〜48時間で最も優位性の高い「ベスト3」を断定します。
                </p>
            </div>

            <IntelContent key={assetClass} assetClass={assetClass} />
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
            <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-24">
                <div className="relative mb-8">
                    <div className="w-16 h-16 border-2 border-emerald-500/10 rounded-full animate-ping absolute"></div>
                    <div className="w-16 h-16 border-t-2 border-emerald-500 rounded-full animate-spin shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
                </div>
                <div className="space-y-2 text-center">
                   <p className="text-emerald-400 font-mono text-sm tracking-[0.2em] font-bold">ANALYZING {assetClass} SECTORS</p>
                   <p className="text-slate-600 text-[10px] font-mono uppercase">Batch processing 3-agent consensus models...</p>
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
    const scoreColor = pick.score > 80 ? 'text-emerald-400' : pick.score > 60 ? 'text-blue-400' : 'text-slate-400';
    
    return (
        <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-700 shadow-2xl">
            {/* Rank Indicator */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <span className="text-9xl font-black italic">#{rank}</span>
            </div>

            {/* Title Section */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-white mb-1 group-hover:text-emerald-50">{pick.symbol}</h3>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded ${pick.signal.decision === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {pick.signal.decision === 'BUY' ? 'LONG' : 'SHORT'}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-slate-500 text-[10px] font-mono tracking-tighter">
                            AI_CONFIDENCE: <span className={`${scoreColor} font-bold`}>{pick.score}%</span>
                        </span>
                    </div>
                </div>
                <div className={`p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/50 shadow-inner ${pick.signal.decision === 'BUY' ? 'text-emerald-500' : 'text-red-500'}`}>
                   {pick.signal.decision === 'BUY' ? <TrendingUp size={22} /> : <Activity size={22} />}
                </div>
            </div>

            {/* Grid Levels */}
            <div className="space-y-4 mb-8 relative z-10">
                <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-xl border border-white/5 group-hover:border-emerald-500/20 transition-all duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Entry</span>
                    </div>
                    <span className="text-lg font-bold font-mono text-white leading-none tracking-tight">{pick.signal.entry}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-emerald-500/[0.03] rounded-xl border border-emerald-500/10 group-hover:border-emerald-500/30 transition-all duration-500">
                        <div className="flex items-center gap-2 mb-1 text-emerald-500/50">
                            <Target size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Take Profit</span>
                        </div>
                        <span className="text-sm font-bold font-mono text-emerald-400">{pick.signal.tp}</span>
                    </div>
                    <div className="p-3 bg-red-500/[0.03] rounded-xl border border-red-500/10 group-hover:border-red-500/30 transition-all duration-500">
                        <div className="flex items-center gap-2 mb-1 text-red-500/50">
                            <ShieldCheck size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Stop Loss</span>
                        </div>
                        <span className="text-sm font-bold font-mono text-red-400">{pick.signal.sl}</span>
                    </div>
                </div>
            </div>

            {/* Analysis Snippet */}
            <div className="pt-4 border-t border-slate-800/80 relative z-10">
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    <span className="text-emerald-500/40 mr-1">ANALYSIS_LOG:</span>
                    {pick.signal.summary || 'マクロ相関、流動性分布、ボラティリティの複合評価により、極めて強気なセットアップと断定。'}
                </p>
            </div>
            
            {/* Background Glow */}
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-1000" />
        </div>
    );
};

export default SecretCockpit;
