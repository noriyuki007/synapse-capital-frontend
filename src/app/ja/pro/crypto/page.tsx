'use client';

import React from 'react';
import { Activity, Globe, ChevronDown, CheckCircle2, AlertCircle, Search, Moon, Zap, BarChart3, Bitcoin, TrendingUp, ShieldCheck, Cpu, Building2, LayoutGrid, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * Shared Pro Ticker
 */
const ProTicker = () => {
    const items = [
        { label: "BTC/USDT", val: "51,200.00", chg: "+1.20%", up: true },
        { label: "ETH/USDT", val: "2,848.68", chg: "+0.85%", up: true },
        { label: "SOL/USDT", val: "105.45", chg: "-0.45%", up: false },
        { label: "XRP/USDT", val: "0.5432", chg: "-0.12%", up: false },
        { label: "ADA/USDT", val: "0.4851", chg: "+2.11%", up: true },
        { label: "BNB/USDT", val: "352.12", chg: "+0.15%", up: true },
        { label: "AVAX/USDT", val: "38.92", chg: "-0.90%", up: false },
        { label: "MATIC/USDT", val: "1.0432", chg: "+0.12%", up: true },
    ];
    return (
        <div className="w-full bg-slate-100/50 border-b border-slate-200/60 py-1 overflow-hidden sticky top-0 z-[60] backdrop-blur-sm">
            <div className="flex animate-ticker whitespace-nowrap">
                {[...items, ...items].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-6 text-[10px] font-bold tracking-tight">
                        <span className="text-slate-400 uppercase italic">{item.label}</span>
                        <span className="text-slate-900 tabular-nums italic">{item.val}</span>
                        <span className={item.up ? "text-emerald-500 italic" : "text-rose-500 italic"}>{item.chg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Shared Footer
 */
const IntegrityFooter = () => (
    <footer className="bg-[#020617] text-white pt-24 pb-12 px-8 overflow-hidden relative mt-20">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter italic">誠実な運営宣言</h2>
                </div>
                <p className="text-xl text-slate-400 font-bold leading-relaxed max-w-xl italic">
                    当サービスのAIは、過去の実績を一切誇張しません。不確実な相場において、100%の勝率は存在しません。「偽りのないデータ」と「誠実なテクノロジー」を提供することをお約束します。
                </p>
                <div className="flex gap-8 items-center pt-4 opacity-50">
                    <Cpu className="w-8 h-8" />
                    <Activity className="w-8 h-8" />
                    <Building2 className="w-8 h-8" />
                </div>
            </div>
            <div className="bg-slate-800/20 border border-slate-700/50 p-10 rounded-[40px] backdrop-blur-xl relative group">
                <div className="text-xs font-black text-indigo-400 tracking-[0.3em] uppercase mb-8 flex items-center gap-3 italic">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    運営の整合性
                </div>
                <div className="space-y-6 italic">
                    {[{ label: "データの正確性", val: "100% リアルタイム" }, { label: "パフォーマンス報告", val: "ライブ更新" }, { label: "法令遵守ポリシー", val: "欺瞞ゼロ" }].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-4 border-b border-slate-700/30">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                            <span className="text-sm font-black italic">{item.val}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <div className="max-w-[1400px] mx-auto mt-32 pt-8 border-t border-slate-800 flex justify-between items-center opacity-40">
            <div className="text-[10px] font-black uppercase tracking-widest flex items-center gap-4 italic"><Activity className="w-4 h-4" /> Synapse Capital</div>
            <div className="text-[9px] font-bold tracking-widest uppercase flex gap-8"><span>© 2026 SYNAPSE CAPITAL GLOBAL</span><span>POWERED BY ANTIGRAVITY AI</span></div>
        </div>
    </footer>
);

export default function CryptoProDashboard() {
    const assets = [
        { label: "BTC/USD", status: "進行", sync: 100, levels: [true, true, true, true], consistency: "LOW" },
        { label: "ETH/USD", status: "STABLE", sync: 80, levels: [true, true, false, true], consistency: "LOW" },
        { label: "SOL/USD", status: "進行", sync: 45, levels: [false, true, null, true], consistency: "MEDIUM" },
        { label: "XRP/USD", status: "逆行", sync: 15, levels: [false, false, false, false], consistency: "HIGH" },
        { label: "ADA/USD", status: "STABLE", sync: 55, levels: [true, false, true, false], consistency: "MEDIUM" },
        { label: "DOT/USD", status: "STABLE", sync: 30, levels: [false, null, null, true], consistency: "HIGH" },
        { label: "MATIC/USD", status: "進行", sync: 70, levels: [true, true, true, false], consistency: "MEDIUM" },
        { label: "AVAX/USD", status: "STABLE", sync: 60, levels: [true, false, true, true], consistency: "LOW" },
        { label: "LINK/USD", status: "進行", sync: 85, levels: [true, true, true, true], consistency: "LOW" },
        { label: "LTC/USD", status: "STABLE", sync: 40, levels: [null, true, false, true], consistency: "MEDIUM" },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-amber-100 selection:text-amber-900">
            <ProTicker />

            <header className="bg-white/80 backdrop-blur-md px-6 py-3 flex items-center justify-between border-b border-slate-100 sticky top-[28px] z-50">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                            <Activity className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <div className="text-sm font-black italic tracking-tighter text-slate-900 leading-none uppercase italic">SYNAPSE CAPITAL</div>
                            <div className="text-[8px] font-bold text-slate-400 tracking-wider mt-0.5 italic">ダッシュボード</div>
                        </div>
                    </Link>
                    <Link href="/ja/" className="text-[10px] font-black px-3 py-1.5 bg-slate-100 text-slate-500 rounded-md italic">シンプル版</Link>
                    <nav className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/50 ml-4 font-black italic">
                        <Link href="/ja/pro/" className="px-4 py-1.5 rounded-full text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-2 transition-all">
                            <BarChart3 className="w-3.5 h-3.5" /> FX
                        </Link>
                        <Link href="/ja/pro/stocks/" className="px-4 py-1.5 rounded-full text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-2 transition-all">
                            <Activity className="w-3.5 h-3.5" /> 株式
                        </Link>
                        <Link href="/ja/pro/crypto/" className="px-4 py-1.5 rounded-full text-[10px] bg-amber-500 text-white shadow-sm flex items-center gap-2 transition-all">
                            <Bitcoin className="w-3.5 h-3.5" /> クリプト
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4 font-black italic">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-600 italic uppercase">JP <ChevronDown className="w-3 h-3" /></div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 text-[9px] tracking-widest uppercase rounded-full border border-amber-100 shadow-sm">LIVE</div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-8 py-8 space-y-12">
                {/* Hero Card */}
                <div className="bg-white border border-slate-100 rounded-[40px] p-12 shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />
                    <div className="space-y-6 max-w-2xl relative z-10 italic">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-amber-500 text-white text-[9px] font-black tracking-widest uppercase rounded-sm shadow-sm">プレミアム インサイト</span>
                            <span className="w-10 h-[1px] bg-slate-200" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-80">市場インテリジェンス</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight italic uppercase">
                            暗号資産市場を、AIが解析し抜く
                        </h1>
                        <p className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 italic uppercase">
                            DEEP LIQUIDITY ANALYSIS — <span className="text-slate-500 opacity-60">24時間365日、AIが監視</span>
                        </p>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed italic opacity-80">
                            BTCからSOLまで、主要銘柄から新興L1までを網羅。大口の動きやDEXの出来高をAIが監視し、ボラティリティの波を捉えます。
                        </p>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-8 rounded-[32px] max-w-sm flex items-start gap-4">
                        <AlertCircle className="w-10 h-10 text-rose-500 mt-1" />
                        <div className="space-y-1 italic">
                            <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest">重要事項：リスク管理</div>
                            <div className="text-sm font-black text-slate-900 leading-tight">投機は自己責任でお願いします</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="flex items-center justify-between px-2 italic font-black">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <Bitcoin className="w-6 h-6 text-amber-500" />
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">CRYPTO ANALYTICS BOARD <span className="text-amber-500/50">V1.2</span></h2>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-9 flex items-center gap-2 italic opacity-80">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                AI オンチェーン・インサイト & 矛盾検知
                            </p>
                        </div>
                        <div className="px-4 py-2 bg-slate-100/50 border border-slate-200 rounded-xl text-[10px] text-slate-400 uppercase tracking-widest italic">
                            最終計算: 8:52:37
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {assets.map((asset, i) => (
                            <CryptoCard key={i} {...asset} />
                        ))}
                    </div>
                </div>

                {/* Advanced Analysis Section (NEW) */}
                <div className="pt-20 space-y-10">
                    <div className="flex items-center gap-4 italic font-black">
                        <LayoutGrid className="w-8 h-8 text-amber-500" />
                        <h3 className="text-3xl text-slate-900 italic tracking-tight uppercase font-black">Advanced Analysis Layer</h3>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-black italic">
                        <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm space-y-8 group transition-all">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest italic">市場間同期解析</div>
                                    <h4 className="text-lg font-black italic tracking-tight uppercase">BTC vs US10Y</h4>
                                </div>
                                <BarChart3 className="w-6 h-6 text-slate-100 group-hover:text-amber-200 transition-colors" />
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] uppercase font-black opacity-60"><span>同期性</span><span>-0.78 (高)</span></div>
                                <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden flex justify-end">
                                    <div className="h-full bg-rose-500 w-[78%]" />
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 italic">金利上昇局面におけるBTCのヘッジ機能は低下中。リスク資産としての連動が鮮明。</p>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm space-y-8 group">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">AI インデックス</div>
                                    <h4 className="text-lg font-black italic tracking-tight uppercase">クリプト・パルス指数</h4>
                                </div>
                                <Activity className="w-6 h-6 text-slate-100 group-hover:text-emerald-200 transition-colors" />
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="relative w-24 h-24">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-50" strokeWidth="3" />
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-500" strokeWidth="3" strokeDasharray="100" strokeDashoffset="16" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-black italic text-emerald-600">84</span>
                                        <span className="text-[6px] uppercase text-slate-400">Strong Bullish</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="text-[9px] font-black uppercase text-slate-400">強気モメンタム</div>
                                    <p className="text-[10px] font-bold text-slate-500 italic">オンチェーンでのクジラの蓄積が加速。マクロ懸念を上回る買い需要。</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm space-y-8 group">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest italic">流動性状況</div>
                                    <h4 className="text-lg font-black italic tracking-tight uppercase">ボラティリティ充足率</h4>
                                </div>
                                <Clock className="w-6 h-6 text-slate-100 group-hover:text-indigo-200 transition-colors" />
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: "TOKYO SESSION", val: "40%", current: true },
                                    { label: "LONDON SESSION", val: "15%", current: false },
                                    { label: "NY SESSION", val: "5%", current: false },
                                ].map((session, i) => (
                                    <div key={i} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${session.current ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${session.current ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
                                            <span className="text-[9px] font-black tracking-widest uppercase">{session.label}</span>
                                        </div>
                                        <span className={`text-[10px] font-black italic ${session.current ? 'text-indigo-600' : 'text-slate-400'}`}>{session.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-8 py-20 italic font-black">
                    <button className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-full text-[10px] text-slate-400 uppercase tracking-widest hover:border-amber-500 hover:text-amber-500 transition-all group shadow-sm">
                        全 6 ノードを検査
                        <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                    </button>
                    <div className="w-[1px] h-32 bg-gradient-to-b from-slate-200 to-transparent" />
                </div>
            </main>

            <IntegrityFooter />
        </div>
    );
}

const CryptoCard = ({ label, status, sync, levels, consistency }: any) => {
    return (
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 space-y-5 shadow-sm hover:shadow-xl hover:border-amber-100 transition-all cursor-crosshair group font-black italic transition-all">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bitcoin className="w-4 h-4 text-slate-100 group-hover:text-amber-500 transition-colors" />
                    <span className="text-sm font-black text-slate-900 tracking-tighter italic uppercase">{label}</span>
                </div>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm tracking-widest uppercase border ${status === '逆行' || status === '進行' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                        status === '同期' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' :
                            'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                    {status}
                </span>
            </div>

            <div className="grid grid-cols-4 gap-1">
                {['15M', '1H', '4H', '1D'].map((tf, i) => {
                    const dir = levels[i];
                    return (
                        <div key={tf} className="bg-slate-50/50 p-2 rounded-xl border border-slate-100/50 flex flex-col items-center gap-1.5 group-hover:bg-white transition-colors">
                            <div className="text-[7px] font-black text-slate-300 tracking-tighter uppercase">{tf}</div>
                            {dir === true && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
                            {dir === false && <TrendingUp className="w-3.5 h-3.5 text-rose-500 rotate-180" />}
                            {dir === null && <Activity className="w-3.5 h-3.5 text-slate-200" />}
                        </div>
                    );
                })}
            </div>

            <div className="space-y-1.5 italic font-black">
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-tighter">
                    <span className="text-slate-400">同期率</span>
                    <span className="text-amber-500">{sync}%</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-amber-500 transition-all duration-1000"
                        style={{ width: `${sync}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-4 italic font-black uppercase">
                <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter opacity-80">不一致: {consistency}</span>
                </div>
            </div>
        </div>
    );
}
