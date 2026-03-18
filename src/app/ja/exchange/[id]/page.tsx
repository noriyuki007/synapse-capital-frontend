import React from 'react';
import { notFound } from 'next/navigation';
import { getExchangeById } from '@/lib/microcms';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RadarChart } from '@/components/RadarChart';
import { CheckCircle2, XCircle, ArrowRight, Shield, Clock, ShieldCheck, Target, Zap } from 'lucide-react';
import Link from 'next/link';
import { getExchanges } from '@/lib/microcms';




export async function generateStaticParams() {
    const exchanges = await getExchanges();
    return exchanges.map((exchange) => ({
        id: exchange.id,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const exchange = await getExchangeById(id);
    if (!exchange) return { title: 'Not Found' };
    return {
        title: `${exchange.name} | AI Integrity Insight`,
    };
}

export default async function ExchangeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const exchange = await getExchangeById(id);

    if (!exchange) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            <Header />

            <main className="max-w-[1440px] mx-auto border-x border-slate-100 bg-white min-h-screen">
                
                {/* Hero / Header Section */}
                <header className="p-6 md:p-12 lg:p-20 border-b border-slate-100 space-y-16">
                    <Link href="/ja/exchange" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors group">
                        <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                        パートナー一覧に戻る
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-10 text-center lg:text-left">
                            <div className="space-y-6">
                                <div className="flex items-center justify-center lg:justify-start gap-4">
                                    <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-none text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
                                        推奨パートナー
                                    </span>
                                    {exchange.isBeginner && (
                                        <span className="px-3 py-1 bg-amber-50 border border-amber-100 rounded-none text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Zap className="w-3.5 h-3.5 fill-amber-500/20" />
                                            初心者推奨
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                        <Shield className="w-3.5 h-3.5" />
                                        公式検証済み
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none font-sans uppercase">
                                    {exchange.name}
                                </h1>
                            </div>
                            
                            <p className="text-sm md:text-base font-bold text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed uppercase border-l-2 border-slate-100 pl-8">
                                {exchange.description} 当プラットフォームとAI連携することで、ミリ秒レベルの約定データと高度なセンチメント分析を統合。プロフェッショナルな取引環境を実現します。
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <Link 
                                    href={exchange.affiliateLink} 
                                    target="_blank"
                                    className="w-full sm:w-auto px-12 py-5 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-none hover:bg-black transition-all shadow-2xl shadow-indigo-100 hover:translate-y-[-2px]"
                                >
                                    公式サイトで詳細を見る
                                </Link>

                            </div>
                        </div>

                        {/* Visual Rating Card */}
                        <div className="bg-white border border-slate-100 p-8 md:p-12 rounded-none shadow-sm space-y-8 flex flex-col items-center">
                            <div className="text-[10px] font-black tracking-[0.3em] text-slate-300 uppercase w-full">総合評価指標</div>
                            <RadarChart scores={exchange.scores} />
                            <div className="flex items-end gap-2 w-full justify-center">
                                <span className="text-4xl font-black tracking-tighter text-slate-900 font-sans">{exchange.rating.toFixed(1)}</span>
                                <span className="text-sm font-bold text-slate-300 mb-1">/ 5.0</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Targeted Profile & Strategy */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 border-b border-slate-100">
                    <div className="bg-slate-50/50 p-12 md:p-16 space-y-6">
                        <div className="flex items-center gap-3">
                            <Target className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">推奨される投資家プロファイル</h3>
                        </div>
                        <p className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-tight">
                            {exchange.targetAudience || '全ての個人投資家'}
                        </p>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase border-l-2 border-indigo-100 pl-6">
                            各ブローカーの約定アルゴリズムとインフラ構成をAIが解析。このサービスは、上記の特性を持つ投資スタイルにおいて最も高いパフォーマンスを発揮します。
                        </p>
                    </div>
                    <div className="bg-white p-12 md:p-16 space-y-6">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">AIアドバンテージ</h3>
                        </div>
                        <p className="text-xl font-black text-indigo-600 uppercase tracking-tighter leading-tight">
                            {exchange.recommendation || '最適な取引環境を提供します。'}
                        </p>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase border-l-2 border-slate-100 pl-6">
                            Synapse CapitalのAIシグナルと連携することで、期待値の高いエントリーポイントでの滑りを最小限に抑え、戦略の再現性を最大化します。
                        </p>
                    </div>
                </section>

                {/* Pros & Cons Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100">
                    <div className="bg-white p-12 md:p-20 space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black text-emerald-500 tracking-tight flex items-center gap-3 uppercase font-sans">
                                <CheckCircle2 className="w-8 h-8" />
                                主要なメリット
                            </h2>
                            <p className="text-xs font-black text-slate-300 uppercase tracking-widest">当AIチームが推奨する主要な強み</p>
                        </div>
                        <ul className="space-y-10">
                            {exchange.pros.map((pro: string, i: number) => (
                                <li key={i} className="flex items-start gap-6 group">
                                    <div className="w-1.5 h-1.5 mt-2 bg-emerald-500 rounded-none shrink-0" />
                                    <div className="space-y-2">
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight">{pro}</p>
                                        <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase">業界最狭水準のスプレッドと高度な約定アルゴリズムにより、AIシグナルの再現性を極限まで高めることが可能です。短期売買から。長期保有まで幅広く対応。</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white p-12 md:p-20 space-y-12 border-l border-slate-100">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black text-rose-500 tracking-tight flex items-center gap-3 uppercase font-sans">
                                <XCircle className="w-8 h-8" />
                                リスクと留意点
                            </h2>
                            <p className="text-xs font-black text-slate-300 uppercase tracking-widest">留意すべきリスク項目</p>
                        </div>
                        <ul className="space-y-10">
                            {exchange.cons.map((con: string, i: number) => (
                                <li key={i} className="flex items-start gap-6 group">
                                    <div className="w-1.5 h-1.5 mt-2 bg-rose-500 rounded-none shrink-0" />
                                    <div className="space-y-2">
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight">{con}</p>
                                        <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase">高い機能性の一方で、高負荷時のレスポンス低下や、一定の取引コストが発生する場合があります。個別の投資目的に応じて十分に検討してください。</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="p-12 md:p-24 bg-white text-center space-y-12">
                     <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-none text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mx-auto">
                        公式パートナー検証済み
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter font-sans uppercase">
                            最適な環境で取引を開始。
                        </h2>
                        <p className="text-[11px] font-black text-slate-400 max-w-2xl mx-auto uppercase tracking-[0.2em] leading-relaxed">
                            高度なAI解析エンジンと親和性の高い、プロフェッショナルな取引インフラを認定しています。
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <Link 
                            href={exchange.affiliateLink} 
                            target="_blank"
                            className="px-16 py-6 bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-none hover:bg-slate-800 transition-all hover:translate-y-[-2px] shadow-2xl"
                        >
                            キャンペーン詳細を確認する <ArrowRight className="w-4 h-4 inline-block ml-3" />
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
