import React from 'react';
import { Activity, Zap, Shield, TrendingUp, ArrowRight, Globe } from 'lucide-react';
import Link from 'next/link';
import { SignalCard } from '@/components/SignalCard';
import { Sidebar } from '@/components/Sidebar';
import { getTrackRecordStats, getSortedReportsData, getLatestSignals } from '@/lib/reports';

// Helper components
import { MarketTicker } from '@/components/MarketTicker';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';



import { getDictionary } from '@/locales/dictionaries';
import { pageSeo } from '@/lib/seo';
import { Metadata } from 'next';


export async function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'ja' }];
}

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const params = await props.params;
    const locale = params?.locale || 'ja';
    const isJa = locale === 'ja';
    
    return pageSeo({
        locale,
        path: '',
        title: isJa ? "Synapse Capital | AI 投資インテリジェンス" : "Synapse Capital | AI Investment Intelligence",
        description: isJa 
            ? "AIが市場を24時間監視し、高精度な投資戦略を提供。FX・株式・暗号資産の次世代解析プラットフォーム。" 
            : "AI monitors markets 24/7 to provide high-precision investment strategies. Next-gen analysis for FX, Stocks, and Crypto.",
    });
}

export default async function SynapseMarketLanding(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = params?.locale || 'ja';
    const dict = await getDictionary(locale);

    let signals;
    let stats = { total: 0, winRate: 0 };
    let latestReports: any[] = [];

    try {
        signals = await getLatestSignals(locale);
        stats = await getTrackRecordStats(locale);
        const allReports = await getSortedReportsData(locale);
        latestReports = allReports.slice(0, 4);
    } catch (e) {
        console.error("Failed to read data:", e);
        signals = {
            FX: { pair: "USD/JPY", status: "BUY", comment: "...", entry: "---", tp: "---", sl: "---", reliability: "LOW" },
            STOCKS: { pair: "S&P 500", status: "BUY", comment: "...", entry: "---", tp: "---", sl: "---", reliability: "LOW" },
            CRYPTO: { pair: "BTC/USD", status: "BUY", comment: "...", entry: "---", tp: "---", sl: "---", reliability: "LOW" }
        };
    }

    return (
        <div className="min-h-screen bg-[#060913] font-sans selection:bg-indigo-950 selection:text-indigo-200 text-slate-200">
            <Header locale={locale} dict={dict} />
            <MarketTicker dict={dict} />

            <main className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-slate-800/85 bg-[#060913] shadow-2xl shadow-indigo-950/20">
                
                {/* Main Content Area (8 columns) */}
                <div className="lg:col-span-8 p-6 md:p-12 lg:p-16 space-y-24 border-r border-slate-800/80">
                    
                    {/* Hero Section */}
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-indigo-950/60 border border-indigo-500/30 rounded-none text-[12px] font-black text-indigo-400 uppercase tracking-widest leading-none">
                                {dict.landing.hero_badge}
                            </div>
                            <h1 className="text-2xl md:text-5xl font-black text-white tracking-tighter leading-tight font-sans">
                                {dict.landing.hero_title.split('\n').map((line: string, i: number) => (
                                    <React.Fragment key={i}>
                                        {line}
                                        {i === 0 && <br className="md:hidden" />}
                                    </React.Fragment>
                                ))}
                            </h1>
                            {/* Subtitle Positioning as AI Research Assistant */}
                            <div className="text-indigo-400 font-bold text-sm md:text-base tracking-widest uppercase flex items-center gap-2">
                                <span className="w-2 h-2 bg-indigo-500 animate-pulse rounded-none" />
                                {locale === 'ja' ? '個人トレーダーのためのAIリサーチ・アシスタント' : "Personal Trader's AI Research Assistant"}
                            </div>
                        </div>
                        
                        <div className="space-y-8">
                            <p className="text-sm md:text-base font-bold text-slate-400 max-w-2xl leading-relaxed uppercase border-l-2 border-indigo-500/80 pl-4 md:pl-8">
                                {dict.landing.hero_desc}
                            </p>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-slate-800/60 max-w-2xl text-[11px] font-black uppercase tracking-wider text-slate-405">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-400" />
                                    <span>{locale === 'ja' ? '完全無料開放中 (クレカ不要)' : '100% Free (No Card)'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-indigo-400" />
                                    <span>{locale === 'ja' ? '毎日3アセット検証 (FX/株/暗号)' : '3 Daily Asset Segments'}</span>
                                </div>
                                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                                    <span>{locale === 'ja' ? '透明な的中率検証' : 'Verified Win Rate'}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Link href={`/${locale}/pro/`} className="px-10 py-4 bg-indigo-600 text-white text-[13px] font-black uppercase tracking-widest rounded-none hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-300">
                                    {dict.landing.terminal_access}
                                </Link>
                                <Link href={`/${locale}/reports/`} className="px-10 py-4 bg-slate-900 border border-slate-800 text-slate-300 text-[13px] font-black uppercase tracking-widest rounded-none hover:bg-slate-850 hover:text-white transition-all">
                                    {dict.landing.latest_reports}
                                </Link>
                            </div>
                        </div>

                        {/* Interactive High-Tech Neon Dashboard Mockup */}
                        <div className="relative h-[300px] md:h-[420px] rounded-none overflow-hidden border border-slate-800 bg-slate-950/40 p-6 flex flex-col justify-between shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] group">
                            {/* Grid background effect */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                            
                            {/* Top HUD bar */}
                            <div className="flex items-center justify-between border-b border-slate-900 pb-3 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-none bg-rose-500/80" />
                                        <div className="w-2.5 h-2.5 rounded-none bg-amber-500/80" />
                                        <div className="w-2.5 h-2.5 rounded-none bg-emerald-500/80" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">SYNAPSE AI ENGINE v2.4 // PRO TERMINAL</span>
                                </div>
                                <div className="flex items-center gap-6 text-[10px] font-black text-slate-500 tracking-wider">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
                                        <span className="text-emerald-400">SCANNING ACTIVE</span>
                                    </div>
                                    <span>LATENCY: 14MS</span>
                                    <span className="hidden sm:inline">ACCURACY: 98.4%</span>
                                </div>
                            </div>

                            {/* Chart HUD visualization */}
                            <div className="flex-1 relative flex items-center justify-center my-4 overflow-hidden">
                                {/* Simulated chart path */}
                                <svg className="w-full h-full min-h-[140px] overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                                    <defs>
                                        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path 
                                        d="M 0,80 Q 15,40 30,65 T 60,25 T 85,45 T 100,10 L 100,100 L 0,100 Z" 
                                        fill="url(#chartGlow)"
                                    />
                                    <path 
                                        d="M 0,80 Q 15,40 30,65 T 60,25 T 85,45 T 100,10" 
                                        fill="none" 
                                        stroke="#6366f1" 
                                        strokeWidth="2" 
                                        className="stroke-[2px] shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                                    />
                                    {/* Scanline indicator line */}
                                    <line x1="85" y1="0" x2="85" y2="100" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="3 3" />
                                    <circle cx="85" cy="45" r="4" fill="#22d3ee" className="animate-ping" />
                                    <circle cx="85" cy="45" r="2.5" fill="#22d3ee" />
                                </svg>
                                
                                {/* Overlay tech numbers */}
                                <div className="absolute top-4 left-4 p-3 bg-slate-950/80 border border-slate-900 rounded-none space-y-1">
                                    <div className="text-[9px] font-black text-slate-500 tracking-wider">AI RECOMMENDATION</div>
                                    <div className="text-lg font-black text-emerald-400 tracking-tighter">BTC LONG @ $68,450</div>
                                </div>
                                
                                <div className="absolute bottom-4 right-4 p-3 bg-slate-950/80 border border-slate-900 rounded-none space-y-1">
                                    <div className="text-[9px] font-black text-slate-500 tracking-wider">EXPECTED WIN RATE</div>
                                    <div className="text-lg font-black text-indigo-400 tracking-tighter">84.2% (HIGH EDGE)</div>
                                </div>
                            </div>

                            {/* Bottom stats drawer */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-900 pt-3 text-[10px] font-black text-slate-500 tracking-wider relative z-10">
                                <div>
                                    <div>AI SCANNERS</div>
                                    <div className="text-xs text-white font-bold tracking-tight">42 ACTIVE NODES</div>
                                </div>
                                <div>
                                    <div>PROCESSED / 24H</div>
                                    <div className="text-xs text-white font-bold tracking-tight">2.4M DATAPOINTS</div>
                                </div>
                                <div>
                                    <div>FX SYNCHRONICITY</div>
                                    <div className="text-xs text-emerald-400 font-bold tracking-tight">OPTIMIZED</div>
                                </div>
                                <div>
                                    <div>CPU LOAD</div>
                                    <div className="text-xs text-indigo-400 font-bold tracking-tight">12.8% (NORMAL)</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Signal Sector Grid */}
                    <section className="space-y-10 pt-16 border-t border-slate-800/80">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-white leading-none">
                                <Activity className="w-4 h-4 text-indigo-400" />
                                {dict.landing.signal_analysis_title}
                            </h2>
                            <Link href={`/${locale}/pro/`} className="text-[12px] font-black uppercase text-indigo-400 hover:text-indigo-300 transition-colors tracking-widest">{dict.landing.view_all_signals}</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SignalCard {...signals.FX} locale={locale} dict={dict} />
                            <SignalCard {...signals.STOCKS} locale={locale} dict={dict} />
                            <SignalCard {...signals.CRYPTO} locale={locale} dict={dict} />
                        </div>
                    </section>

                    {/* Feature Grid Section */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-800 border border-slate-800 rounded-none overflow-hidden shadow-2xl shadow-black/40">
                        <div className="p-8 md:p-14 bg-slate-950/80 space-y-8 group hover:bg-slate-900/40 transition-all cursor-default">
                            <div className="w-12 h-12 bg-indigo-950/60 border border-indigo-800/40 rounded-none flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                                <Zap className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white font-sans uppercase">{dict.landing.feature_terminal_title}</h3>
                            <p className="text-sm font-bold leading-relaxed text-slate-400 uppercase">
                                {dict.landing.feature_terminal_desc}
                            </p>
                            <Link href={`/${locale}/pro/stocks/`} className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-indigo-400 group-hover:gap-3 transition-all">{dict.landing.view_details} <ArrowRight className="w-3 h-3" /></Link>
                        </div>
                        <div className="p-8 md:p-14 bg-slate-950/80 space-y-8 group hover:bg-slate-900/40 transition-all cursor-default">
                            <div className="w-12 h-12 bg-emerald-950/60 border border-emerald-800/40 rounded-none flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <Shield className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white font-sans uppercase">{dict.landing.feature_risk_title}</h3>
                            <p className="text-sm font-bold leading-relaxed text-slate-400 uppercase">
                                {dict.landing.feature_risk_desc}
                            </p>
                            <Link href={`/${locale}/track-record/`} className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-emerald-400 group-hover:gap-3 transition-all">{dict.landing.performance} <ArrowRight className="w-3 h-3" /></Link>
                        </div>
                    </section>
                </div>

                {/* Shared Sidebar */}
                <div className="lg:col-span-4 p-6 md:p-10 border-none bg-[#090d1a]/50 border-l border-slate-800/60">
                    <Sidebar 
                        latestReports={latestReports} 
                        stats={stats} 
                        locale={locale}
                        dict={dict}
                    />
                </div>
            </main>

            <Footer locale={locale} dict={dict} />
        </div>
    );
}
