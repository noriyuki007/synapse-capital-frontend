"use client";

import { useEffect, useState } from "react";
import { fetchPosts } from "@/lib/wp";
import { ArticleCard } from "./ArticleCard";
import Link from "next/link";
import Image from "next/image";

export function DynamicPostFeed() {
    const [insightPosts, setInsightPosts] = useState<any[]>([]);
    const [newsPosts, setNewsPosts] = useState<any[]>([]);
    const [startupPosts, setStartupPosts] = useState<any[]>([]);
    const [reviewPosts, setReviewPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [ins, newsRaw, start, rev1, rev2] = await Promise.all([
                    fetchPosts(15, 27).catch(() => []),
                    fetchPosts(20, 1).catch(() => []), // Fetch more to allow for dedup
                    fetchPosts(3, 17).catch(() => []),
                    fetchPosts(2, 25).catch(() => []),
                    fetchPosts(2, 19).catch(() => []), // Fallback review category
                ]);

                // Deduplicate news by title
                const seenTitles = new Set();
                const uniqueNews = newsRaw.filter((p: any) => {
                    const title = p.title.rendered.trim();
                    if (seenTitles.has(title)) return false;
                    seenTitles.add(title);
                    return true;
                }).slice(0, 6);

                setInsightPosts(ins);
                setNewsPosts(uniqueNews);
                setStartupPosts(start);
                setReviewPosts([...rev1, ...rev2].slice(0, 2));
            } catch (e) {
                console.error("Fetch failed", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return <div className="animate-pulse bg-zinc-50 h-96 w-full flex items-center justify-center text-zinc-300 font-bold uppercase tracking-widest">LOADING INTELLIGENCE FEED...</div>;
    }

    const featuredPosts = insightPosts.slice(0, 3);
    const remainingInsights = insightPosts.slice(3);

    return (
        <>
            {/* Featured Bento Section */}
            <section className="px-4 py-8 space-y-6 max-w-7xl mx-auto">
                <h2 className="text-[11px] font-black tracking-[0.2em] text-foreground/40 uppercase pl-1 items-center flex gap-3">
                    <span className="w-12 h-1 bg-brand-accent rounded-none" />
                    注目の記事
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Primary Featured Card */}
                    <div className="md:row-span-2 relative group aspect-video overflow-hidden rounded-none bg-zinc-100 shadow-xl border border-zinc-100/50">
                        {featuredPosts[0] && (
                            <>
                                <Image
                                    src={featuredPosts[0]?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/placeholder.jpg"}
                                    alt="Featured"
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-8 space-y-4">
                                    <span className="inline-block px-4 py-1 bg-brand-accent text-white text-[9px] font-black rounded-none uppercase tracking-[0.2em] shadow-lg mb-4">
                                        FEATURED
                                    </span>
                                    <Link href={`/insights/${featuredPosts[0]?.id}`}>
                                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-black text-white leading-tight group-hover:text-zinc-200 transition-colors duration-300"
                                            dangerouslySetInnerHTML={{ __html: featuredPosts[0]?.title.rendered }}
                                        />
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Secondary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {featuredPosts.slice(1, 3).map((post: any) => (
                            <div key={post.id} className="relative aspect-video rounded-none overflow-hidden group bg-zinc-100 shadow-md">
                                <Link href={`/insights/${post.id}`}>
                                    <Image
                                        src={post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/placeholder.jpg"}
                                        alt="Side"
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-5">
                                        <h4 className="text-sm md:text-base font-bold text-white leading-tight line-clamp-2 transition-all duration-300 group-hover:text-zinc-200"
                                            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                                        />
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI WORLD NEWS SECTION */}
            <section className="px-4 py-16 bg-zinc-50 border-y border-zinc-100">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-[11px] font-black tracking-[0.2em] text-foreground/40 uppercase items-center flex gap-3">
                            <span className="w-12 h-1 bg-brand-accent/40 rounded-none" />
                            世界のAIニュース
                        </h2>
                        <Link href="/news" className="text-[10px] font-black tracking-widest text-brand-accent hover:underline flex items-center gap-1">
                            すべて見る
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {newsPosts.map((news: any) => (
                            <Link key={news.id} href={`/news/${news.id}`} className="group relative flex gap-5 bg-white p-6 rounded-none border border-zinc-100 shadow-sm transition-all hover:shadow-xl hover:translate-y-[-2px] hover:border-brand-accent/20">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-brand-accent bg-brand-accent/5 px-2 py-0.5 rounded-none tracking-tighter uppercase">WORLD NEWS</span>
                                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.1em]">{new Date(news.date).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, '.')}</span>
                                    </div>
                                    <p className="text-base sm:text-lg font-bold leading-relaxed line-clamp-2 text-zinc-800 group-hover:text-zinc-950 transition-colors"
                                        dangerouslySetInnerHTML={{ __html: news.title.rendered }}
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* LATEST INSIGHTS FEED */}
            <section className="px-4 py-16 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-[11px] font-black tracking-[0.2em] text-foreground/40 uppercase pl-1 items-center flex gap-3">
                        <span className="w-12 h-1 bg-zinc-200 rounded-none" />
                        最新のインサイト
                    </h2>
                    <Link href="/insights" className="text-[10px] font-black tracking-widest text-brand-accent hover:underline">一覧を見る</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-16 md:gap-y-6">
                    {remainingInsights.map((post: any) => (
                        <ArticleCard key={post.id} post={post} />
                    ))}
                </div>
            </section>

            {/* STARTUP INFO SECTION */}
            <section className="px-4 py-16 bg-white border-t border-zinc-100">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-[11px] font-black tracking-[0.2em] text-foreground/40 uppercase mb-10 flex gap-3 items-center">
                        <span className="w-12 h-1 bg-blue-500 rounded-none" />
                        AIスタートアップ最前線
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {startupPosts.map((startup: any) => (
                            <Link key={startup.id} href={`/startups/${startup.id}`} className="group space-y-3 p-6 rounded-none bg-zinc-50 border border-zinc-100 hover:border-brand-accent/30 transition-all">
                                <div className="flex justify-between items-start">
                                    <span className="text-[9px] font-black text-white bg-zinc-800 px-2 py-0.5 rounded-none tracking-widest">STARTUP</span>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                                        {new Date(startup.date).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, '.')}
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-zinc-800 group-hover:text-zinc-950 transition-colors tracking-tight leading-snug"
                                    dangerouslySetInnerHTML={{ __html: startup.title.rendered }}
                                />
                                <div className="text-xs text-zinc-500 font-medium leading-relaxed line-clamp-2"
                                    dangerouslySetInnerHTML={{ __html: startup.excerpt.rendered.replace(/<[^>]+>/g, '') }}
                                />
                                <div className="pt-2 flex items-center gap-1.5 text-[10px] font-black text-brand-accent opacity-0 group-hover:opacity-100 transition-opacity">
                                    VIEW PROFILE <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} /></svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CRITICAL REVIEW SECTION */}
            <section className="px-4 py-16 max-w-7xl mx-auto space-y-12">
                <h2 className="text-[11px] font-black tracking-[0.2em] text-foreground/40 uppercase items-center flex gap-3 justify-center">
                    <span className="w-2 h-2 rounded-none bg-brand-accent" />
                    編集部レビュー
                    <span className="w-2 h-2 rounded-none bg-brand-accent" />
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {reviewPosts.map((review: any) => (
                        <Link key={review.id} href={`/reviews/${review.id}`} className="block group p-8 rounded-none bg-zinc-50 border border-zinc-100 space-y-5 hover:border-brand-accent/20 transition-all shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black tracking-[0.2em] text-red-600 bg-red-50 px-2.5 py-1 rounded-none border border-red-100">REVIEW</span>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-800 group-hover:text-zinc-950 transition-colors leading-snug tracking-tight line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: review.title.rendered }}
                            />
                            <div className="text-zinc-500 text-sm font-medium leading-relaxed line-clamp-3"
                                dangerouslySetInnerHTML={{ __html: review.excerpt.rendered.replace(/<[^>]+>/g, '') }}
                            />
                            <div className="pt-4 flex items-center gap-3 border-t border-zinc-100">
                                <div className="w-6 h-6 rounded-none bg-brand-accent/20 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 rounded-none bg-brand-accent" />
                                </div>
                                <span className="text-[10px] font-black tracking-widest text-foreground uppercase">PRTCL / プロトコル</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </>
    );
}
