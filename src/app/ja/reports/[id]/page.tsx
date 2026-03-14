import React from 'react';
import { notFound } from 'next/navigation';
import { getReportData, getSortedReportsData, getTrackRecordStats } from '@/lib/reports';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { SignalCard } from '@/components/SignalCard';
import { SolanaPriceWidget } from '@/components/SolanaPriceWidget';
import { Activity, Clock, ShieldCheck, TrendingUp, TrendingDown, Target, ArrowLeft, ArrowRight, Bookmark, List, Zap, MessageSquare, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export async function generateStaticParams() {
    const reports = await getSortedReportsData();
    return reports.map((report) => ({
        id: report.id,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const report = await getReportData(id);
    const baseUrl = 'https://synapsecapital.net'; 
    
    return {
        title: `${report.title} | AI分析レポート | Synapse Capital`,
        description: report.excerpt,
        openGraph: {
            title: report.title,
            description: report.excerpt,
            type: 'article',
            publishedTime: report.date,
            authors: ['AntiGravity AI'],
            images: [
                {
                    url: `${baseUrl}/images/og-report-${report.genre.toLowerCase()}.png`,
                    width: 1200,
                    height: 630,
                    alt: report.title,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: report.title,
            description: report.excerpt,
        },
    };
}

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let reportData;

    try {
        reportData = await getReportData(id);
    } catch (e) {
        notFound();
    }

    const { title, date, genre, target_pair, prediction_direction, recommended_broker, contentHtml, signalData, tldr_points, excerpt } = reportData;
    const allReports = await getSortedReportsData();
    const stats = await getTrackRecordStats();

    // Extract H2 for TOC
    const h2Matches = Array.from(contentHtml.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g));
    const toc = h2Matches.map(match => ({ id: match[1], text: match[2].replace(/<[^>]*>/g, '') }));

    // JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "datePublished": date,
        "author": {
            "@type": "Person",
            "name": "検証隊AI - SYNAPSE",
            "jobTitle": "Lead Market Analyst"
        },
        "publisher": {
            "@id": "https://synapsecapital.net/#organization",
            "@type": "Organization",
            "name": "Synapse Capital",
            "logo": {
                "@type": "ImageObject",
                "url": "https://synapsecapital.net/logo.png"
            }
        },
        "description": excerpt
    };

    return (
        <div className="min-h-screen bg-white text-slate-800 selection:bg-blue-100 selection:text-blue-900 font-sans leading-relaxed">
            <Header />
            
            {/* JSON-LD for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Floating Disclaimer for Mobile */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md text-[10px] font-bold text-white p-3 text-center border-t border-white/10 flex items-center justify-center gap-2 md:hidden">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                取引にはリスクが伴います。判断は自己責任で。
            </div>

            <main className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-slate-100 bg-white min-h-screen">
                
                {/* Main Content Area (8 columns) */}
                <div className="lg:col-span-8 border-r border-slate-100">
                    
                    {/* 1. Eyecatch Image Section - Z-Pattern Start */}
                    <section className="relative w-full aspect-[21/10] bg-slate-900 overflow-hidden">
                        <img 
                            src={`/images/market-analysis-${genre.toLowerCase()}.jpg`} 
                            alt={title}
                            className="w-full h-full object-cover grayscale-[20%]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-8 md:p-14 lg:p-20 space-y-6">
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm">
                                    {genre === 'FX' ? '為替分析' : genre === 'CRYPTO' ? '暗号資産' : '株式市場'}
                                </span>
                                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" />
                                    {date}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.1] font-sans uppercase drop-shadow-2xl">
                                {title}
                            </h1>
                             <Link href="/ja/reports" className="inline-flex items-center gap-2 text-[11px] font-black text-white/60 uppercase tracking-widest hover:text-white transition-colors group pt-4">
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                レポート一覧へ
                            </Link>
                        </div>
                    </section>

                    <div className="p-6 md:p-14 lg:p-20 space-y-20">
                        
                        {/* 2. 要約（TL;DR）Box - F-Pattern High Priority */}
                        <section className="bg-blue-50 border-l-[6px] border-blue-600 p-8 md:p-12">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-2 bg-blue-600 rounded-sm">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-blue-900 underline decoration-blue-200 decoration-4 underline-offset-4">本日の3大ポイント</h3>
                            </div>
                            <ul className="space-y-6">
                                {(tldr_points || ['現在の主要なトレンド分析', '注意すべき経済指標と価格水準', '検証隊AIによる推奨シナリオ']).map((point, idx) => (
                                    <li key={idx} className="flex gap-4 items-start text-base md:text-lg font-black text-slate-800 leading-chill">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                                            {idx + 1}
                                        </span>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* 3. 目次（Table of Contents）- Professional Layout */}
                        {toc.length > 0 && (
                            <section className="bg-white border border-slate-200 p-8 md:p-10 space-y-8">
                                <div className="flex items-center gap-3">
                                    <List className="w-5 h-5 text-slate-800" />
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900 italic">この記事の構成</h3>
                                </div>
                                <nav className="border-t border-slate-100 pt-8">
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
                                        {toc.map((item, idx) => (
                                            <li key={item.id} className="group flex items-center gap-4">
                                                <span className="text-[10px] font-black text-slate-300 group-hover:text-blue-600 transition-colors">0{idx + 1}</span>
                                                <a href={`#${item.id}`} className="text-[15px] font-bold text-slate-600 hover:text-blue-600 transition-colors border-b border-transparent hover:border-blue-100">
                                                    {item.text}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </section>
                        )}

                        {/* Asset Summary Widget */}
                        <div className="flex flex-wrap gap-10 py-10 border-y border-slate-100">
                             <div className="space-y-2">
                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">分析対象</div>
                                <div className="text-[17px] font-black text-slate-900 flex items-center gap-2 uppercase font-sans">
                                    <Target className="w-5 h-5 text-blue-600" />
                                    {target_pair}
                                </div>
                            </div>
                            <SolanaPriceWidget />
                            <div className="space-y-2">
                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">市場センチメント</div>
                                <div className={`text-[17px] font-black flex items-center gap-2 uppercase font-sans ${
                                    prediction_direction === 'UP' ? 'text-emerald-500' : 'text-rose-500'
                                }`}>
                                    {prediction_direction === 'UP' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                    {prediction_direction === 'UP' ? '強気予測' : '弱気警戒'}
                                </div>
                            </div>
                        </div>

                        {/* 4. 本文 Section - No huge text blocks, strictly structured */}
                        <article className="prose prose-slate max-w-none 
                            prose-h2:text-3xl prose-h2:md:text-4xl prose-h2:font-black prose-h2:tracking-tight prose-h2:border-l-[12px] prose-h2:border-slate-900 prose-h2:pl-8 prose-h2:mt-24 prose-h2:mb-16 prose-h2:bg-slate-50 prose-h2:py-4
                            prose-h3:text-xl prose-h3:font-black prose-h3:mt-16 prose-h3:mb-8 prose-h3:flex prose-h3:items-center prose-h3:gap-4
                            prose-p:text-[17px] prose-p:font-medium prose-p:leading-[2.0] prose-p:text-slate-700 prose-p:mb-12
                            prose-strong:font-black prose-strong:text-slate-950 prose-strong:bg-yellow-50
                            prose-li:text-slate-700 prose-ul:list-square prose-li:mb-4">
                            
                            {/* Chartist Placeholder Example */}
                            <div className="my-16 group relative aspect-video bg-slate-50 border border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
                                <Activity className="w-12 h-12 text-blue-500/20 mb-6 group-hover:scale-110 transition-transform duration-500" />
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Market Flow Diagram Placeholder</h4>
                            </div>

                            <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
                        </article>

                        {/* 5. AIによる結論とアクションプラン - Highlighted Box */}
                        <section className="border-4 border-emerald-500 p-10 md:p-14 space-y-10 bg-emerald-50/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-500 flex items-center justify-center text-white">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tight">検証隊AIのアドバイス</h3>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Next Action Plan for Investors</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                                <div className="space-y-6">
                                    <div className="text-xs font-black text-emerald-800 uppercase tracking-widest border-b border-emerald-200 pb-2">推奨アクション</div>
                                    <ul className="space-y-4">
                                        {['現在の水準での分散エントリーを検討', '損切り水準の再徹底と指値の調整', 'マクロイベント通過後のポジション調整'].map((task, i) => (
                                            <li key={i} className="flex gap-4 items-start font-bold text-slate-800">
                                                <span className="text-emerald-500 font-black">STEP.0{i+1}</span>
                                                {task}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-6 bg-white p-8 border border-emerald-100 shadow-sm">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AIコンパス集計</div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-slate-600">予測的中率 (30d)</span>
                                            <span className="text-2xl font-black text-slate-900">{stats.winRate}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: `${stats.winRate}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 6. 関連ニュースリンク - Icon List */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-5 h-5 text-slate-400" />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">情報の深掘り：関連リソース</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['最新のCPIデータと市場の反応', '米連邦準備制度（FRB）の金利決定に関する分析', '主要ブローカーのセンチメントレポート'].map((news, i) => (
                                    <a key={i} href="#" className="flex items-center justify-between p-6 bg-white border border-slate-100 hover:border-blue-600 group transition-all">
                                        <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600">{news}</span>
                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform group-hover:text-blue-600" />
                                    </a>
                                ))}
                            </div>
                        </section>

                        {/* 7. 関連記事への回遊ボタン - Large Buttons */}
                        <section className="pt-20 border-t border-slate-100 grid grid-cols-2 gap-6">
                            <Link href="/ja/reports" className="flex flex-col items-center justify-center p-10 bg-slate-950 text-white hover:bg-blue-800 transition-all group">
                                <Bookmark className="w-6 h-6 mb-4 text-white/40 group-hover:text-white group-hover:-translate-y-1 transition-all" />
                                <span className="text-[11px] font-black uppercase tracking-widest mb-1 opacity-60">Archive</span>
                                <span className="text-sm font-black">過去のレポートを読む</span>
                            </Link>
                            <Link href="/ja/exchange" className="flex flex-col items-center justify-center p-10 border-2 border-slate-950 text-slate-950 hover:bg-blue-50 transition-all group">
                                <TrendingUp className="w-6 h-6 mb-4 text-slate-300 group-hover:text-blue-600 group-hover:-translate-y-1 transition-all" />
                                <span className="text-[11px] font-black uppercase tracking-widest mb-1 opacity-60">Partner</span>
                                <span className="text-sm font-black">今週の展望を見る</span>
                            </Link>
                        </section>
                    </div>

                    {/* Disclaimer */}
                    <footer className="p-8 md:p-20 bg-slate-50 border-t border-slate-100">
                        <p className="text-[11px] font-bold text-slate-400 max-w-4xl leading-[2.0] mx-auto text-center opacity-60 uppercase tracking-tight">
                            Synapse Capital Intelligence Report. AI analysis is provided for informational purposes only and does not constitute financial advice. Trading involves substantial risk of loss. Always perform your own due diligence.
                        </p>
                    </footer>
                </div>

                {/* Sidebar (4 columns) - Optimized for Desktop */}
                <aside className="lg:col-span-4 bg-white flex flex-col divide-y divide-slate-100 pt-14">
                    <div className="p-8 md:p-12 space-y-14">
                        {/* Signal Card */}
                        {signalData && (
                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                                    <span className="w-4 h-px bg-slate-200" />
                                    AIシグナル詳細
                                </h3>
                                <SignalCard {...signalData} recommended_broker={recommended_broker} />
                            </div>
                        )}
                        
                        {/* Standard Sidebar Items */}
                        <Sidebar 
                            latestReports={allReports.filter(r => r.id !== id).slice(0, 3)} 
                            stats={stats} 
                        />
                    </div>
                </aside>
            </main>
            <Footer />
        </div>
    );
}
