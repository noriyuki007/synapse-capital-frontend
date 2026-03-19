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




export default async function SynapseMarketLanding() {
    let signals;
    let stats = { total: 0, winRate: 0 };
    let latestReports: any[] = [];

    try {
        signals = await getLatestSignals();
        stats = await getTrackRecordStats();
        const allReports = await getSortedReportsData();
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
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 text-slate-900">
            <Header />
            <MarketTicker />

            <main className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-slate-100 bg-white shadow-sm">
                
                {/* Main Content Area (8 columns) */}
                <div className="lg:col-span-8 p-6 md:p-12 lg:p-16 space-y-24 border-r border-slate-100">
                    
                    {/* Hero Section */}
                    <div className="space-y-12">
                        <div className="space-y-6">
                             <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-indigo-50 border border-indigo-100/50 rounded-none text-[13px] font-black text-indigo-600 uppercase tracking-widest leading-none">
                                AI インテリジェンス v2.4 稼働中
                            </div>
                            <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight font-sans">
                                人工知能が深層から解析する、<br className="md:hidden" />金融マーケットの真実。
                            </h1>
                        </div>
                        
                        <div className="space-y-8">
                            <p className="text-sm md:text-base font-bold text-slate-500 max-w-2xl leading-relaxed uppercase border-l-2 border-slate-100 pl-4 md:pl-8">
                                高度な独自アルゴリズムによるリアルタイム多角市場分析。私たちは、価格変動の表面的な動きではなく、オンチェーンデータ、マクロ経済指標、そして機関投資家のセンチメントを統合し、透明性の極めて高いインテリジェンスを提供します。
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/ja/pro" className="px-10 py-4 bg-black text-white text-[13px] font-black uppercase tracking-widest rounded-none hover:bg-slate-800 transition-all hover:translate-y-[-2px] hover:shadow-xl">
                                    ターミナル・アクセス
                                </Link>
                                <Link href="/ja/reports" className="px-10 py-4 bg-white border border-slate-200 text-slate-900 text-[13px] font-black uppercase tracking-widest rounded-none hover:bg-slate-50 transition-all">
                                    最新レポート
                                </Link>
                            </div>
                        </div>

                        {/* Visual Asset In-line */}
                        <div className="relative h-[240px] md:h-[400px] rounded-none overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                            <img 
                                src="/images/hero_visual.png" 
                                alt="Market Analysis Visual" 
                                className="w-full h-full object-cover opacity-90 grayscale-[10%] hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white/20 to-transparent" />
                        </div>
                    </div>

                    {/* Signal Sector Grid */}
                    <section className="space-y-10 pt-16 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-slate-900 leading-none">
                                <Activity className="w-4 h-4 text-indigo-600" />
                                リアルタイム・シグナル解析
                            </h2>
                            <Link href="/ja/pro" className="text-[12px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors tracking-widest">全てのシグナルを見る</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SignalCard {...signals.FX} />
                            <SignalCard {...signals.STOCKS} />
                            <SignalCard {...signals.CRYPTO} />
                        </div>
                    </section>

                    {/* Feature Grid Section */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 border border-slate-100 rounded-none overflow-hidden shadow-sm">
                        <div className="p-8 md:p-14 bg-white space-y-8 group hover:bg-slate-50 transition-all cursor-default">
                            <div className="w-12 h-12 bg-indigo-50 rounded-none flex items-center justify-center">
                                <Zap className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 font-sans uppercase">マーケット・ターミナル</h3>
                            <p className="text-sm font-bold leading-relaxed text-slate-400 uppercase">
                                ミリ秒単位でのティックデータ更新とAI予測。プロフェッショナルが必要とする全てのインフラを、洗練された単一のインターフェースへ統合しました。
                            </p>
                            <Link href="/ja/pro/stocks" className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-indigo-600 group-hover:gap-3 transition-all">詳細を見る <ArrowRight className="w-3 h-3" /></Link>
                        </div>
                        <div className="p-8 md:p-14 bg-white space-y-8 group hover:bg-slate-50 transition-all cursor-default">
                            <div className="w-12 h-12 bg-emerald-50 rounded-none flex items-center justify-center">
                                <Shield className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 font-sans uppercase">リスク管理プロトコル</h3>
                            <p className="text-sm font-bold leading-relaxed text-slate-400 uppercase">
                                AIによる優位性の高いエントリーだけでなく、多重化された損切りアルゴリズムによりドローダウンを極小化。安定した成長を支える盤石の基盤。
                            </p>
                            <Link href="/ja/track-record" className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-emerald-600 group-hover:gap-3 transition-all">運用実績 <ArrowRight className="w-3 h-3" /></Link>
                        </div>
                    </section>
                </div>

                {/* Shared Sidebar */}
                <div className="lg:col-span-4 p-6 md:p-10 border-none bg-white">
                    <Sidebar 
                        latestReports={latestReports} 
                        stats={stats} 
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}
