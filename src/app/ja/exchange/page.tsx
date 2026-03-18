import React from 'react';
import { getExchanges } from '@/lib/microcms';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Shield, ArrowRight, Zap, Trophy, Star, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const runtime = 'edge';


export async function generateMetadata() {
    return {
        title: '推奨ブローカー連携 | Synapse Capital',
        description: 'AI分析シグナルを最大限に活かすために、最適な機能を持つ取引所を厳選して紹介します。',
    };
}

export default async function ExchangeListPage() {
    const exchanges = await getExchanges();

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <Header />

            <main className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-slate-100 bg-white min-h-screen">
                
                {/* Main Content Area (8 columns) */}
                <div className="lg:col-span-8 p-6 md:p-12 lg:p-16 space-y-20 border-r border-slate-100">
                    
                    {/* Hero Section */}
                    <div className="space-y-8 max-w-4xl">
                        <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-indigo-50 border border-indigo-100/50 rounded-none text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none">
                            AI インテグリティ・プロトコル
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none font-sans uppercase whitespace-nowrap">
                             厳選された取引基盤。
                        </h1>
                        <p className="text-sm md:text-base font-bold text-slate-500 max-w-2xl leading-relaxed uppercase border-l-2 border-slate-100 pl-8">
                            Synapse AIの解析アルゴリズムは、各パートナーの約定速度、スプレッドの安定性、および透明性を常時監視しています。私たちは、公平な第三者視点から、プロフェッショナルな投資に相応しい環境のみを認定します。評価スコアは広告報酬の影響を一切受けない独自指標です。
                        </p>
                    </div>

                    {/* Exchange List */}
                    <div className="grid grid-cols-1 gap-12">
                        {exchanges.map((ex) => (
                            <div key={ex.id} className="group border-b border-slate-50 pb-16 last:border-none last:pb-0">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                    {/* Left: Info */}
                                    <div className="md:col-span-8 space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-sans uppercase">
                                                    {ex.name}
                                                </h2>
                                                {ex.isBeginner && (
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-100/50 rounded-none text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none">
                                                        <Zap className="w-3 h-3 fill-amber-500/20" />
                                                        初心者推奨
                                                    </span>
                                                )}
                                                {ex.rating >= 4.5 && (
                                                    <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                                        <ShieldCheck className="w-4 h-4" />
                                                        推奨パートナー
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase line-clamp-3 pl-6 border-l-2 border-slate-100">
                                                {ex.description}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-4">
                                            {ex.features.slice(0, 3).map((f: string, i: number) => (
                                                <span key={i} className="text-[10px] font-black px-3 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-none uppercase tracking-widest">
                                                    {f}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-l-2 border-slate-50 pl-6">
                                            <div className="space-y-2">
                                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">推奨対象</div>
                                                <p className="text-[11px] font-bold text-slate-600 uppercase leading-snug">
                                                    {ex.targetAudience || '全ての個人投資家'}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">AIアドバイス</div>
                                                <p className="text-[11px] font-bold text-indigo-500/80 uppercase leading-snug">
                                                    {ex.recommendation || 'プラットフォームとの連携により、最適な取引環境を提供します。'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 pt-4">
                                            <Link 
                                              href={`/ja/exchange/${ex.id}`}
                                              className="px-8 py-3 bg-white border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-black hover:text-white transition-all flex items-center gap-2 group/btn"
                                            >
                                                詳細分析を見る <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </Link>
                                            <Link 
                                              href={ex.affiliateLink}
                                              target="_blank"
                                              className="px-8 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-indigo-700 transition-all flex items-center gap-2"
                                            >
                                                公式サイトへ
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Right: Scores */}
                                    <div className="md:col-span-4 bg-slate-50 border border-slate-100 p-8 rounded-none space-y-8 flex flex-col items-center justify-center relative group">
                                        <div className="absolute top-4 right-4 group-hover:scale-110 transition-transform">
                                            <Shield className="w-4 h-4 text-emerald-500/30" />
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">総合評価スコア</div>
                                            <div className="text-5xl font-black text-slate-900 font-sans tracking-tighter">
                                                {ex.rating.toFixed(1)}
                                            </div>
                                            <div className="mt-2 text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center justify-center gap-1">
                                                <ShieldCheck className="w-3 h-3" />
                                                Certified Unbiased
                                            </div>
                                        </div>
                                        <div className="w-full space-y-3">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                    <span>取引環境</span>
                                                    <span>{ex.scores.platform}/5.0</span>
                                                </div>
                                                <div className="h-1 bg-slate-200 rounded-none overflow-hidden">
                                                    <div className="h-full bg-slate-900" style={{ width: `${(ex.scores.platform / 5) * 100}%` }} />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                    <span>コスト効率</span>
                                                    <span>{ex.scores.cost}/5.0</span>
                                                </div>
                                                <div className="h-1 bg-slate-200 rounded-none overflow-hidden">
                                                    <div className="h-full bg-slate-900" style={{ width: `${(ex.scores.cost / 5) * 100}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-20 border-t border-slate-100 text-center space-y-4">
                        <Shield className="w-10 h-10 text-slate-200 mx-auto" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-lg mx-auto leading-relaxed">
                            ※ 私たちは第三者機関として公平な評価を行っています。当ページ経由の開設は、将来的なAIシグナルの優先配信枠に関連します。
                        </p>
                    </div>
                </div>

                {/* Sidebar area */}
                <aside className="lg:col-span-4 bg-slate-50 p-6 md:p-10 border-none space-y-16">
                    <div className="p-10 bg-white border border-slate-100 rounded-none space-y-8 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                            <Zap className="w-24 h-24 text-slate-900" />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                            <span className="w-4 h-px bg-slate-200" />
                            AI 誠実性宣言
                        </h3>
                        <p className="text-[11px] font-black text-slate-500 leading-relaxed uppercase">
                            私たちは、いかなるブローカーからも過度な広告報酬を受け取り、評価を歪めることはありません。
                        </p>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase">
                            パートナー選定は、AIエンジンがシミュレートした「約定速度」と「スプレッド耐性」に基づいています。歪みのない透明な評価を。
                        </p>
                    </div>

                    {/* Additional Promo Banners */}
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-100 p-4 rounded-none space-y-3">
                            <a href="https://h.accesstrade.net/sp/cc?rk=0100p78p00oow9" rel="nofollow" referrerPolicy="no-referrer-when-downgrade" target="_blank" className="block overflow-hidden">
                                <img src="https://h.accesstrade.net/sp/rr?rk=0100p78p00oow9" alt="ザイFX！投資戦略メルマガ" className="w-full transition-all" />
                            </a>
                            <p className="text-[8px] font-bold text-slate-400 uppercase leading-relaxed">
                                志摩力男、西原宏一ら一線級プロの戦略を、あなたのマーケット・ターミナルへ統合。
                            </p>
                        </div>

                        <div className="bg-white border border-slate-100 p-4 rounded-none space-y-3">
                            <a href="https://h.accesstrade.net/sp/cc?rk=0100orcv00oow9" rel="nofollow" referrerPolicy="no-referrer-when-downgrade" target="_blank" className="block overflow-hidden">
                                <img src="https://h.accesstrade.net/sp/rr?rk=0100orcv00oow9" alt="お金の教養講座" className="w-full transition-all" />
                            </a>
                            <p className="text-[8px] font-bold text-slate-400 uppercase leading-relaxed">
                                資産運用の基礎から応用までを、体系的に学ぶプロトコルを開始。
                            </p>
                        </div>
                    </div>
                </aside>
            </main>

            <Footer />
        </div>
    );
}
