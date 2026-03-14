import React from 'react';
import { notFound } from 'next/navigation';
import { getReportData, getSortedReportsData, getTrackRecordStats } from '@/lib/reports';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
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

    const { title, date, genre, target_pair, prediction_direction, contentHtml, signalData, tldr_points, excerpt } = reportData;
    const allReports = await getSortedReportsData();
    const stats = await getTrackRecordStats();

    // Extract H2 for TOC and content splitting
    const h2Matches = Array.from(contentHtml.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g));
    const toc = h2Matches.map(match => ({ id: match[1], text: match[2].replace(/<[^>]*>/g, '') }));

    // JSON-LD for SEO
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
            
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Main Content (8 columns) */}
                    <article className="lg:col-span-8 space-y-24">
                        
                        {/* 1. Eyecatch & Title Overlay */}
                        <section className="relative aspect-[21/9] bg-slate-900 overflow-hidden shadow-2xl">
                            <img 
                                src={`/images/market-analysis-${genre.toLowerCase()}.jpg`} 
                                alt={title}
                                className="w-full h-full object-cover opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest">
                                        {genre === 'FX' ? '為替分析' : genre === 'CRYPTO' ? '暗号資産' : '株式市場'}
                                    </span>
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> {date}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                                    {title}
                                </h1>
                            </div>
                        </section>

                        {/* 2. TL;DR Card */}
                        <section className="bg-slate-50 border border-slate-100 p-8 md:p-12 space-y-8">
                            <div className="flex items-center gap-4">
                                <Zap className="w-6 h-6 text-blue-600" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">本日の要約 (TL;DR)</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {(tldr_points || ['トレンド分析', '重要指標', '推奨戦略']).map((point, idx) => (
                                    <div key={idx} className="space-y-3">
                                        <div className="text-blue-600 font-black text-lg">0{idx + 1}</div>
                                        <p className="font-bold text-slate-700 leading-relaxed text-sm">{point}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 3. Table of Contents */}
                        {toc.length > 0 && (
                            <section className="p-8 border-y border-slate-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <List className="w-5 h-5 text-slate-400" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">目次</h3>
                                </div>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {toc.map((item, idx) => (
                                        <li key={item.id} className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-slate-300">0{idx + 1}</span>
                                            <a href={`#${item.id}`} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                                                {item.text}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* 4. Structured Content Sections */}
                        <div className="space-y-32">
                            {contentHtml.split(/<h2[^>]*>/).slice(1).map((sectionHtml, idx) => {
                                const titleHtml = h2Matches[idx]?.[2] || '';
                                const content = sectionHtml.split('</h2>')[1] || '';
                                const sectionId = h2Matches[idx]?.[1] || '';
                                
                                // Section 1: Market Environment (bg-gray-50, bold keywords)
                                if (idx === 0) {
                                  return (
                                    <section id={sectionId} key={idx} className="space-y-10 scroll-mt-24">
                                      <h2 className="text-3xl font-black tracking-tight border-l-8 border-slate-900 pl-6">{titleHtml.replace(/^\d+\.\s*/, '')}</h2>
                                      <div className="bg-gray-50 p-10 md:p-14 leading-relaxed text-lg text-slate-700" dangerouslySetInnerHTML={{ __html: content.replace(/米雇用統計|早期利下げ期待|日銀|上田総裁/g, '<strong>$&</strong>') }} />
                                    </section>
                                  );
                                }

                                // Section 2: AI Analysis (3-column grid)
                                if (idx === 1) {
                                  const listItems = content.match(/<li>([\s\S]*?)<\/li>/g) || [];
                                  return (
                                    <section id={sectionId} key={idx} className="space-y-10 scroll-mt-24">
                                      <h2 className="text-3xl font-black tracking-tight border-l-8 border-slate-900 pl-6">{titleHtml.replace(/^\d+\.\s*/, '')}</h2>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {listItems.map((item, i) => {
                                            const itemText = item.replace(/<[^>]*>/g, '').trim();
                                            const [label, desc] = itemText.split(':');
                                            const icons = [<TrendingUp key="1" />, <Target key="2" />, <Activity key="3" />];
                                            return (
                                                <div key={i} className="p-8 border border-slate-100 space-y-4">
                                                    <div className="text-blue-600">{icons[i] || <Activity />}</div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</h4>
                                                    <p className="font-bold text-slate-900 leading-relaxed">{desc || '分析中'}</p>
                                                </div>
                                            );
                                        })}
                                      </div>
                                    </section>
                                  );
                                }

                                // Section 3: Technical Analysis (2-column)
                                if (idx === 2) {
                                  return (
                                    <section id={sectionId} key={idx} className="space-y-10 scroll-mt-24">
                                      <h2 className="text-3xl font-black tracking-tight border-l-8 border-slate-900 pl-6">{titleHtml.replace(/^\d+\.\s*/, '')}</h2>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                        <div className="prose prose-slate max-w-none prose-p:font-bold prose-p:text-slate-700" dangerouslySetInnerHTML={{ __html: content }} />
                                        <div className="aspect-square bg-slate-900 relative overflow-hidden group shadow-xl">
                                          <img src={`/images/market-analysis-${genre.toLowerCase()}.jpg`} className="w-full h-full object-cover opacity-50 grayscale group-hover:scale-110 transition-transform duration-700" alt="Technical Analysis" />
                                          <div className="absolute inset-0 border-[1px] border-white/20 m-6 flex items-center justify-center">
                                            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] text-center px-4">AI Vision: Technical Convergence Area</div>
                                          </div>
                                        </div>
                                      </div>
                                    </section>
                                  );
                                }

                                // Section 4: Trading Strategy (Trading Action Card - Huge numbers)
                                if (idx === 3) {
                                  return (
                                    <section id={sectionId} key={idx} className="space-y-10 scroll-mt-24">
                                      <h2 className="text-3xl font-black tracking-tight border-l-8 border-indigo-600 pl-6">{titleHtml.replace(/^\d+\.\s*/, '')}</h2>
                                      <div className="bg-slate-900 text-white p-10 md:p-16 space-y-12 shadow-2xl">
                                        <div className="space-y-4">
                                          <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Trading Action Card</div>
                                          <div className="prose prose-invert max-w-none text-xl font-bold italic" dangerouslySetInnerHTML={{ __html: content.split('<p>')[1]?.split('</p>')[0] || '' }} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-white/10">
                                          <div className="space-y-2">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Target Price</div>
                                            <div className="text-5xl font-black tracking-tighter">{signalData?.tp || '---'}</div>
                                          </div>
                                          <div className="space-y-2">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-rose-400">Stop Loss</div>
                                            <div className="text-5xl font-black tracking-tighter">{signalData?.sl || '---'}</div>
                                          </div>
                                        </div>
                                      </div>
                                    </section>
                                  );
                                }

                                return (
                                  <section id={sectionId} key={idx} className="space-y-10 scroll-mt-24">
                                    <h2 className="text-3xl font-black tracking-tight border-l-8 border-slate-900 pl-6">{titleHtml.replace(/^\d+\.\s*/, '')}</h2>
                                    <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
                                  </section>
                                );
                            })}
                        </div>

                        {/* 5. AI Conclusion & Action Plan */}
                        <section className="bg-emerald-50 border border-emerald-100 p-10 md:p-14 space-y-8">
                            <div className="flex items-center gap-4">
                                <ShieldCheck className="w-8 h-8 text-emerald-600" />
                                <h2 className="text-2xl font-black tracking-tight">検証隊AI 結論 & アクションプラン</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4 text-slate-700 font-bold leading-relaxed">
                                    <p>現在の市場環境に基づき、検証隊AIは「押し目買い」を強く推奨します。150円台の定着を確認した上で、151.50円を目指すシナリオが有力です。リスク管理として、149.50円のブレイクを確定的な転換点として設定しています。</p>
                                </div>
                                <div className="space-y-4 border-l border-emerald-200 pl-8">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Next Step</div>
                                    <ul className="space-y-3 font-bold text-sm">
                                        <li>• 150.25円付近での引き付けエントリー</li>
                                        <li>• 151.00円突破でのトレイリングストップ発動</li>
                                        <li>• ロンドン・ニューヨーク時間の大口動向を監視</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 6. Navigation Buttons */}
                        <nav className="flex items-center justify-between pt-16 border-t border-slate-100">
                            <Link href="/ja/reports" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> レポート一覧に戻る
                            </Link>
                            <div className="flex gap-4">
                                <button className="p-3 bg-slate-50 border border-slate-100 text-slate-400 cursor-not-allowed">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <button className="p-3 bg-white border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-lg shadow-slate-200">
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </nav>
                    </article>

                    {/* Sidebar (4 columns) */}
                    <aside className="lg:col-span-4 space-y-12">
                        {/* 1.8 SOL Widget */}
                        <div className="sticky top-32 space-y-12">
                            <div className="bg-white border border-slate-100 p-8 space-y-6 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">現在の資産価値</h3>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Holdings: 1.8 SOL</div>
                                    <SolanaPriceWidget />
                                </div>
                                <div className="pt-4 border-t border-slate-50">
                                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                                        Real-time asset valuation based on live Coingecko API pricing.
                                    </p>
                                </div>
                            </div>

                            {/* Recent Insights */}
                            <div className="space-y-8">
                                <h3 className="text-lg font-black tracking-tight">最新のインサイト</h3>
                                <div className="space-y-6">
                                    {allReports.filter(r => r.id !== id).slice(0, 3).map((r, i) => (
                                        <Link key={i} href={`/ja/reports/${r.id}`} className="block group space-y-2">
                                            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{r.genre}</div>
                                            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{r.title}</h4>
                                            <div className="text-[10px] text-slate-400">{r.date}</div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
            <Footer />
        </div>
    );
}
