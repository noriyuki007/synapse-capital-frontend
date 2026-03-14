import React from 'react';
import { notFound } from 'next/navigation';
import { getReportData, getSortedReportsData, getTrackRecordStats } from '@/lib/reports';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { SignalCard } from '@/components/SignalCard';
import { SolanaPriceWidget } from '@/components/SolanaPriceWidget';
import { Activity, Clock, ShieldCheck, TrendingUp, TrendingDown, Target, ArrowLeft, Bookmark, List, Zap, MessageSquare, AlertCircle } from 'lucide-react';
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

    const { title, date, genre, target_pair, prediction_direction, recommended_broker, contentHtml, signalData, tldr, excerpt } = reportData;
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
            "name": "AntiGravity AI",
            "jobTitle": "Lead Market Analyst"
        },
        "publisher": {
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
        <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 font-sans leading-relaxed">
            <Header />
            
            {/* JSON-LD for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Floating Disclaimer for SP (Simplified) */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md text-[10px] font-bold text-slate-400 p-2 text-center border-t border-white/10 flex items-center justify-center gap-2 md:hidden">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                投資にはリスクが伴います。判断は自己責任で。
            </div>

            <main className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-slate-100 bg-white min-h-screen">
                
                {/* Main Content Area (8 columns) */}
                <div className="lg:col-span-8 border-r border-slate-100">
                    
                    {/* 1. Eyecatch Image Section */}
                    <section className="relative w-full aspect-[21/9] bg-slate-900 overflow-hidden">
                        <img 
                            src={`/images/market-analysis-${genre.toLowerCase()}.jpg`} 
                            alt={title}
                            className="w-full h-full object-cover opacity-60 grayscale-[30%]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 lg:p-16 space-y-4">
                             <Link href="/ja/reports" className="inline-flex items-center gap-2 text-[10px] font-black text-white/60 uppercase tracking-widest hover:text-white transition-colors group">
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                レポート一覧に戻る
                            </Link>
                            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter leading-tight font-sans uppercase max-w-4xl">
                                {title}
                            </h1>
                            <div className="flex items-center gap-6 pt-2">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" />
                                    {date}
                                </span>
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                     <Activity className="w-3.5 h-3.5" />
                                     AI解析エンジン: SYNAPSE-V2
                                </span>
                            </div>
                        </div>
                    </section>

                    <div className="p-6 md:p-12 lg:p-16 space-y-16">
                        
                        {/* 2. 要約（TL;DR）Box */}
                        <section className="bg-slate-50 border-l-4 border-indigo-600 p-8 md:p-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">クイックサマリー（TL;DR）</h3>
                            </div>
                            <div className="text-base md:text-lg font-bold text-slate-700 leading-chill whitespace-pre-wrap">
                                {tldr || 'AIによる最新の市場分析と結論を3行でまとめています。主な価格トレンド、重要イベント、および推奨アクションを即座に把握できます。'}
                            </div>
                        </section>

                        {/* 3. 目次（Table of Contents） */}
                        {toc.length > 0 && (
                            <section className="bg-white border border-slate-100 p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <List className="w-5 h-5 text-slate-400" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">この記事の目次</h3>
                                </div>
                                <nav>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                                        {toc.map(item => (
                                            <li key={item.id}>
                                                <a href={`#${item.id}`} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-3 group">
                                                    <span className="w-1 h-1 bg-slate-200 group-hover:bg-indigo-600 transition-colors" />
                                                    {item.text}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </section>
                        )}

                        {/* Market Context Widget (SP最適化) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-slate-100">
                            <div className="space-y-1.5">
                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">分析ターゲット</div>
                                <div className="text-base font-black text-slate-900 flex items-center gap-2 uppercase font-sans">
                                    <Target className="w-4 h-4 text-indigo-600" />
                                    {target_pair}
                                </div>
                            </div>
                            <SolanaPriceWidget />
                            <div className="space-y-1.5">
                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">AI予測ベクトル</div>
                                <div className={`text-base font-black flex items-center gap-2 uppercase font-sans ${
                                    prediction_direction === 'UP' ? 'text-emerald-500' : 'text-rose-500'
                                }`}>
                                    {prediction_direction === 'UP' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    {prediction_direction === 'UP' ? '上昇期待' : '下落懸念'}
                                </div>
                            </div>
                        </div>

                        {/* 4. 本文 Section */}
                        <article className="prose prose-slate max-w-none 
                            prose-h2:text-3xl prose-h2:md:text-4xl prose-h2:font-black prose-h2:tracking-tight prose-h2:border-l-8 prose-h2:border-indigo-600 prose-h2:pl-8 prose-h2:mt-24 prose-h2:mb-14
                            prose-h3:text-xl prose-h3:font-black prose-h3:mt-16 prose-h3:mb-6
                            prose-h4:text-lg prose-h4:font-bold prose-h4:mt-12 prose-h4:mb-4
                            prose-p:text-[17px] prose-p:font-medium prose-p:leading-[2.0] prose-p:text-slate-700 prose-p:mb-10
                            prose-strong:font-black prose-strong:text-slate-900
                            prose-li:text-slate-700 prose-ul:list-square prose-li:mb-4
                            prose-img:rounded-none prose-img:border prose-img:border-slate-100">
                            
                            {/* 図解用プレースホルダー例 (本文に挿入) */}
                            <div className="my-16 p-12 bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center space-y-6 aspect-video">
                                <div className="w-12 h-12 rounded-full border border-indigo-500/30 flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-white text-sm font-black uppercase tracking-widest">テクニカル相関図解 (AI生成)</h4>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-12">
                                        現在のオーダーブックと移動平均線の相関を視覚化。本レポートのエビデンスを示すダイアグラムです。
                                    </p>
                                </div>
                            </div>

                            <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
                        </article>

                        {/* Related Navigation Section */}
                        <section className="pt-20 border-t border-slate-100 space-y-12">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 text-center">関連記事への回遊</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {allReports.filter(r => r.id !== id).slice(0, 2).map(r => (
                                    <Link key={r.id} href={`/ja/reports/${r.id}`} className="group border border-slate-100 p-8 hover:bg-slate-50 transition-all space-y-4">
                                        <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{r.genre} Analysis</div>
                                        <h4 className="text-lg font-black text-slate-900 leading-tight group-hover:underline underline-offset-4 decoration-indigo-600/30">{r.title}</h4>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.date}</div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Report Footer / Disclaimer */}
                    <footer className="p-8 md:p-16 bg-slate-50 border-t border-slate-100 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-4 h-4 text-slate-400" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">投資免責事項</h3>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 max-w-4xl leading-[1.8]">
                                本レポート「{title}」は、AntiGravity AIによる分析結果として提供されるものであり、特定の金融商品の売買を推奨するものではありません。金融市場には高いボラティリティが存在し、投資元本を割り込むリスクがあります。最終的な投資判断は、必ずご自身の責任において行ってください。本情報を利用したことによる損害について、当社は一切の責任を負いません。
                            </p>
                        </div>
                    </footer>
                </div>

                {/* Sidebar (4 columns) */}
                <aside className="lg:col-span-4 bg-white border-none flex flex-col divide-y divide-slate-100">
                    <div className="p-6 md:p-10 space-y-12">
                        {/* Signal Card */}
                        {signalData && (
                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                                    <span className="w-4 h-px bg-slate-200" />
                                    AIシグナル結論
                                </h3>
                                <SignalCard {...signalData} recommended_broker={recommended_broker} />
                            </div>
                        )}

                        {/* Integration stats */}
                        <div className="space-y-10">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                                <span className="w-4 h-px bg-slate-200" />
                                信頼性の証明
                            </h3>
                            <div className="bg-white border border-slate-100 p-8 space-y-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-16 h-16 text-slate-900" />
                                </div>
                                <div className="text-3xl font-black text-slate-900 font-sans">{stats.winRate}%</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">過去30日間のAI予測的中率</div>
                                <p className="text-xs font-bold text-slate-500 leading-relaxed relative z-10">
                                    すべての分析結果はトラックレコードに保存され、後日その正当性が検証されます。
                                </p>
                            </div>
                        </div>

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
