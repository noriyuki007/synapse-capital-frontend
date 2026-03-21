import React from 'react';
export const runtime = 'edge';
import { notFound } from 'next/navigation';
import { getReportData, getSortedReportsData, getTrackRecordStats } from '@/lib/reports';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MarketPriceWidget } from '@/components/MarketPriceWidget';
import { ShareButtons } from '@/components/ShareButtons';
import { getDictionary } from '@/locales/dictionaries';
import { Activity, Clock, ShieldCheck, TrendingUp, TrendingDown, Target, ArrowLeft, ArrowRight, Bookmark, List, Zap, MessageSquare, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';


// export async function generateStaticParams() {
//     const locales = ['en', 'ja'];
//     const reports = await getSortedReportsData();
//     
//     const params: { id: string, locale: string }[] = [];
//     locales.forEach(locale => {
//         reports.forEach(report => {
//             params.push({ id: report.id, locale });
//         });
//     });
//     return params;
// }

export async function generateMetadata(props: { params: Promise<{ id: string, locale: string }> }): Promise<Metadata> {
    const params = await props.params;
    const id = params?.id;
    const locale = params?.locale || 'ja';
    
    if (!id) return { title: 'Not Found' };
    const report = await getReportData(id);
    const baseUrl = 'https://synapsecapital.net'; 
    
    return {
        title: locale === 'ja' 
            ? `${report.title} | AI分析レポート | Synapse Capital`
            : `${report.title} | AI Analysis Report | Synapse Capital`,
        description: report.excerpt,
        openGraph: {
            title: report.title,
            description: report.excerpt,
            type: 'article',
            publishedTime: report.date,
            authors: ['AntiGravity AI'],
            images: [
                {
                    url: `${baseUrl}/images/hero_visual.png`,
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

export default async function ReportDetailPage(props: { params: Promise<{ id: string, locale: string }> }) {
    const params = await props.params;
    const id = params?.id;
    const locale = params?.locale || 'ja';
    
    if (!id) notFound();

    const dict = await getDictionary(locale);
    let reportData;

    try {
        reportData = await getReportData(id);
    } catch (e) {
        notFound();
    }

    const { title, date, genre, target_pair, prediction_direction, contentHtml, signalData, tldr_points, chart_image, excerpt, conclusionText, nextSteps } = reportData;
    const allReports = await getSortedReportsData(locale);
    const stats = await getTrackRecordStats(locale);

    // Remove the markdown section specifically so it doesn't double render if it's in the main body
    const cleanContentHtml = contentHtml.replace(/<h2 id="[^"]*ai結論[^"]*">[\s\S]*?<\/h2>[\s\S]*?(?=<h2|$)/i, '');

    // Extract H2 for TOC and content splitting
    const h2Matches = Array.from(cleanContentHtml.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g));
    const toc = h2Matches.map(match => ({ id: match[1], text: match[2].replace(/<[^>]*>/g, '') }));

    // JSON-LD for SEO
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "datePublished": date,
        "author": {
            "@type": "Person",
            "name": "AI - SYNAPSE",
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
            <Header locale={locale} dict={dict} />
            
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Main Content (8 columns) */}
                    <article className="lg:col-span-8 space-y-24">
                        
                        {/* 1. Eyecatch & Title Overlay */}
                        <section className="relative w-full aspect-[21/10] bg-slate-950 overflow-hidden shadow-2xl flex flex-col justify-end">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,58,138,0.2),transparent)]" />
                            <div className="relative p-8 md:p-14 lg:p-20 space-y-6">
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm">
                                        {genre === 'FX' ? dict.common.fx : genre === 'CRYPTO' ? dict.common.crypto : dict.common.stocks}
                                    </span>
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> {date.replace(/-/g, '.')}
                                    </span>
                                </div>
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter leading-[1.2] font-sans uppercase">
                                    {title}
                                </h1>
                                <Link href={`/${locale}/reports`} className="inline-flex items-center gap-2 text-[11px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors group pt-4">
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    {dict.common.back_to_reports}
                                </Link>
                            </div>
                        </section>

                        {/* 2. TL;DR Card */}
                        <section className="bg-slate-50 border border-slate-100 p-8 md:p-12 space-y-8">
                            <div className="flex items-center gap-4">
                                <Zap className="w-6 h-6 text-blue-600" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">{dict.reports.tldr}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {(tldr_points || ['Trend Analysis', 'Key Metrics', 'Strategy']).map((point, idx) => (
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
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{dict.reports.toc}</h3>
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
                            {cleanContentHtml.split(/<h2[^>]*>/).slice(1).map((sectionHtml, idx) => {
                                const titleHtml = h2Matches[idx]?.[2] || '';
                                const content = sectionHtml.split('</h2>')[1] || '';
                                const sectionId = h2Matches[idx]?.[1] || '';
                                
                                if (idx === 0) {
                                  return (
                                    <section id={sectionId} key={idx} className="space-y-10 scroll-mt-24">
                                      <h2 className="text-3xl font-black tracking-tight border-l-8 border-slate-900 pl-6">{titleHtml.replace(/^\d+\.\s*/, '')}</h2>
                                      <div className="bg-gray-50 p-10 md:p-14 leading-relaxed text-lg text-slate-700" dangerouslySetInnerHTML={{ __html: content }} />
                                    </section>
                                  );
                                }
 
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
                                                    <p className="font-bold text-slate-900 leading-relaxed">{desc || 'Analyzing...'}</p>
                                                </div>
                                            );
                                        })}
                                      </div>
                                    </section>
                                  );
                                }
 
                                if (idx === 2) {
                                  return (
                                    <section id={sectionId} key={idx} className="space-y-10 scroll-mt-24">
                                      <h2 className="text-3xl font-black tracking-tight border-l-8 border-slate-900 pl-6">{titleHtml.replace(/^\d+\.\s*/, '')}</h2>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                        <div className="prose prose-slate max-w-none prose-p:font-bold prose-p:text-slate-700" dangerouslySetInnerHTML={{ __html: content }} />
                                        <div className="aspect-square bg-slate-900 relative overflow-hidden group shadow-xl">
                                          <img 
                                            src={chart_image || '/images/hero_visual.png'} 
                                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                                            alt="Technical Analysis Chart" 
                                          />
                                        </div>
                                      </div>
                                    </section>
                                  );
                                }

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
                                <h2 className="text-2xl font-black tracking-tight">{dict.reports.ai_conclusion}</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4 text-slate-700 font-bold leading-relaxed">
                                    <p>{conclusionText}</p>
                                </div>
                                <div className="space-y-4 border-l border-emerald-200 pl-8">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{dict.reports.next_step}</div>
                                    <ul className="space-y-3 font-bold text-sm">
                                        {nextSteps.map((step, idx) => (
                                            <li key={idx}>• {step}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <ShareButtons title={title} url={`/${locale}/reports/${id}`} dict={dict} />

                        <nav className="flex items-center justify-between pt-16 border-t border-slate-100">
                            <Link href={`/${locale}/reports`} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> {dict.common.back_to_reports}
                            </Link>
                        </nav>
                    </article>

                    <aside className="lg:col-span-4 space-y-12">
                        <div className="sticky top-32 space-y-12">
                            <div className="bg-white border border-slate-100 p-8 space-y-6 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{dict.reports.market_valuation}</h3>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Current Valuation
                                    </div>
                                    <MarketPriceWidget genre={genre} targetPair={target_pair} />
                                </div>
                                <div className="pt-4 border-t border-slate-50">
                                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                                        {dict.reports.realtime_price_desc}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <h3 className="text-lg font-black tracking-tight">{dict.reports.latest_insights}</h3>
                                <div className="space-y-6">
                                    {allReports.filter(r => r.id !== id).slice(0, 3).map((r, i) => (
                                        <Link key={i} href={`/${locale}/reports/${r.id}`} className="block group space-y-2">
                                            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{r.genre}</div>
                                            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{r.title}</h4>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                                <Clock className="w-2.5 h-2.5" />
                                                {r.date.replace(/-/g, '.')}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
            <Footer locale={locale} dict={dict} />
        </div>
    );
}
