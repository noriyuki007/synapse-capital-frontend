import React from 'react';
import { ShieldAlert, TrendingUp, Target, ShieldCheck, Activity, ChevronRight } from 'lucide-react';
import { Metadata } from 'next';

// SECRET PAGE - NOT INDEXED
export const metadata: Metadata = {
    title: 'Synapse Internal Cockpit - FX Deep Intel',
    robots: {
        index: false,
        follow: false,
    },
};

const SecretCockpit = () => {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8">
            {/* Header - Security Warning */}
            <div className="max-w-6xl mx-auto mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-900/30 rounded-lg text-red-400">
                        <ShieldAlert size={20} />
                    </div>
                    <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-bold">
                        Restricted Access // Private Intelligence
                    </span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">
                    FX <span className="text-emerald-400">Deep Intel</span> Cockpit
                </h1>
                <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
                    3名の専門家AIが市場を全スキャンし、直近24〜48時間で最も優位性の高い「ベスト3」のトレード戦略を断定します。
                    このページは開発および内部利用専用です。
                </p>
            </div>

            <IntelContent />
        </div>
    );
};

const IntelContent = () => {
    const [loading, setLoading] = React.useState(false);
    const [picks, setPicks] = React.useState<any[]>([]);
    const [error, setError] = React.useState<string | null>(null);

    const refreshIntel = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/internal-top-picks');
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
    }, []);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-20">
                <div className="relative mb-8">
                    <div className="w-16 h-16 border-2 border-emerald-500/20 rounded-full animate-ping absolute"></div>
                    <div className="w-16 h-16 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-400 font-mono text-sm">SCANNING MARKETS & AGENT CONSENSUS...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {picks.length > 0 ? picks.map((pick, i) => (
                    <PickCard key={pick.ticker} pick={pick} rank={i + 1} />
                )) : (
                    <div className="col-span-3 py-20 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                        <p className="text-slate-500">現在、基準を満たす戦略がありません。ボラティリティの低下を待つか、後ほど更新してください。</p>
                        <button 
                            onClick={refreshIntel}
                            className="mt-4 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs rounded-lg transition-colors"
                        >
                            RE-SCAN
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200 text-xs font-mono">
                    ERROR_REPORT: {error}
                </div>
            )}
        </div>
    );
};

const PickCard = ({ pick, rank }: { pick: any, rank: number }) => {
    // Determine confidence color
    const scoreColor = pick.score > 80 ? 'text-emerald-400' : pick.score > 60 ? 'text-blue-400' : 'text-slate-400';
    
    return (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500 shadow-2xl">
            {/* Rank Indicator */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl font-black italic">#{rank}</span>
            </div>

            {/* Title Section */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-white mb-1">{pick.symbol}</h3>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${pick.signal.decision === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {pick.signal.decision === 'BUY' ? 'LONG' : 'SHORT'}
                        </span>
                        <span className="text-slate-500 text-[10px] font-mono uppercase tracking-tighter">
                            Probability: <span className={scoreColor}>{pick.score}%</span>
                        </span>
                    </div>
                </div>
                <div className={`p-3 bg-slate-900 rounded-xl border border-slate-800 ${pick.signal.decision === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>
                   {pick.signal.decision === 'BUY' ? <TrendingUp size={24} /> : <Activity size={24} />}
                </div>
            </div>

            {/* Levels Section */}
            <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-white/5 group-hover:border-emerald-500/20 transition-colors">
                    <div className="flex items-center gap-3">
                        <ChevronRight size={16} className="text-emerald-400" />
                        <span className="text-xs text-slate-400 font-medium">ENTRY</span>
                    </div>
                    <span className="text-lg font-bold font-mono text-white leading-none tracking-tight">{pick.signal.entry}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-center gap-2 mb-1 text-emerald-400/60">
                            <Target size={12} />
                            <span className="text-[10px] font-bold tracking-wider">TARGET</span>
                        </div>
                        <span className="text-sm font-bold font-mono text-emerald-400">{pick.signal.tp}</span>
                    </div>
                    <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 group-hover:border-red-500/30 transition-colors">
                        <div className="flex items-center gap-2 mb-1 text-red-400/60">
                            <ShieldCheck size={12} />
                            <span className="text-[10px] font-bold tracking-wider">PROTECT</span>
                        </div>
                        <span className="text-sm font-bold font-mono text-red-400">{pick.signal.sl}</span>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="pt-4 border-t border-slate-800">
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                    {pick.signal.summary || '盤石なマクロ優位性と執行タイミングの合致を認めた。'}
                </p>
            </div>
        </div>
    );
};

export default SecretCockpit;
