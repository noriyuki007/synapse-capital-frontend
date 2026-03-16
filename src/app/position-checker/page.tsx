'use client';

import React, { useState } from 'react';
import { ShieldCheck, Activity, Users, Zap, Info, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Globe, Shield, Swords, Crown } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

/**
 * Position Checker (MVP)
 * FX初心者向けのポジション診断ツール。
 * 3人のエージェント（アナリスト、ファンドマネージャー、プロップトレーダー）と
 * 総括を行うリーダーAIによるマルチエージェント診断。
 */
export default function PositionCheckerPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // 診断の実行（モックアップ用）
    const handleCheck = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // 実際のAPI連携は後ほど。現在はモックアップ表示。
        setTimeout(() => {
            setIsLoading(false);
            setShowResults(true);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-16 space-y-12">
                {/* ヒーローセクション */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                        <Zap className="w-3 h-3" /> Position Checker v1.0 MVP
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
                        AI投資委員会による<br />
                        トレードポジション診断
                    </h1>
                    <p className="text-sm font-bold text-slate-400 max-w-lg mx-auto leading-relaxed">
                        あなたのトレードプランを3人の専門家エージェントが多角的に分析し、
                        最適なリスク管理と戦略を提案します。
                    </p>
                </div>

                {/* 入力フォーム */}
                <section className="bg-white border border-slate-200 p-8 md:p-12 shadow-2xl shadow-slate-200/50">
                    <form onSubmit={handleCheck} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* 通貨ペア */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> 通貨ペア
                                </label>
                                <select 
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:ring-0 outline-none text-sm font-bold transition-all appearance-none cursor-pointer"
                                    required
                                    defaultValue=""
                                >
                                    <option value="" disabled>通貨ペアを選択してください</option>
                                    <option value="USD/JPY">USD/JPY (米ドル/円)</option>
                                    <option value="EUR/USD">EUR/USD (ユーロ/米ドル)</option>
                                    <option value="GBP/USD">GBP/USD (英ポンド/米ドル)</option>
                                    <option value="AUD/USD">AUD/USD (豪ドル/米ドル)</option>
                                    <option value="USD/CHF">USD/CHF (米ドル/スイスフラン)</option>
                                    <option value="EUR/JPY">EUR/JPY (ユーロ/円)</option>
                                    <option value="GBP/JPY">GBP/JPY (英ポンド/円)</option>
                                    <option value="BTC/USD">BTC/USD (ビットコイン/米ドル)</option>
                                </select>
                            </div>

                            {/* 売買方向 */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> 売買方向
                                </label>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 border border-slate-100 h-[54px]">
                                    <button type="button" className="bg-white border border-slate-200 text-[11px] font-black uppercase text-indigo-600 shadow-sm">ロング/買い</button>
                                    <button type="button" className="text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">ショート/売り</button>
                                </div>
                            </div>

                            {/* エントリー価格 */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" /> エントリー価格
                                </label>
                                <input 
                                    type="number" 
                                    step="any"
                                    placeholder="150.25"
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:ring-0 outline-none text-sm font-bold transition-all"
                                    required
                                />
                            </div>

                            {/* SL価格 */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingDown className="w-4 h-4" /> 損切り価格 (SL)
                                </label>
                                <input 
                                    type="number" 
                                    step="any"
                                    placeholder="149.50"
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:ring-0 outline-none text-sm font-bold transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-black text-white text-[12px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Activity className="w-5 h-5 animate-spin" />
                                    AI投資委員会に接続中...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5 fill-current" />
                                    AI投資委員会に診断を依頼する
                                </>
                            )}
                        </button>
                    </form>
                </section>

                {/* ローディング・スケルトン (MVP用デモ表示) */}
                {isLoading && (
                    <div className="space-y-8 animate-pulse">
                        <div className="h-4 w-1/3 bg-slate-200 mx-auto" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(id => (
                                <div key={id} className="h-48 bg-slate-100 border border-slate-200" />
                            ))}
                        </div>
                    </div>
                )}

                {/* 診断結果表示 (ダミーデータ) */}
                {showResults && !isLoading && (
                    <div className="space-y-16 py-8">
                        <div className="text-center">
                            <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Position Diagnostic Result</h2>
                            <div className="text-2xl font-black mt-2">専門家エージェントによる合議結果</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* アナリストの見解 */}
                            <div className="bg-white border border-slate-200 p-8 space-y-6 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/50 rounded-bl-full -mr-8 -mt-8 flex items-center justify-center pt-4 pr-4">
                                    <Globe className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Agent 01</div>
                                    <h3 className="text-base font-black uppercase">🌐 アナリスト</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Macro Environment</div>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                        米国のCPIデータが予想を上回り、ドルの強含みが継続。
                                        現在のエントリーポイントはファンダメンタルズと一致していますが、
                                        来週のFOMCを控えてボラティリティの上昇が懸念されます。
                                    </p>
                                </div>
                            </div>

                            {/* ファンドマネージャーの見解 */}
                            <div className="bg-white border border-slate-200 p-8 space-y-6 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50/50 rounded-bl-full -mr-8 -mt-8 flex items-center justify-center pt-4 pr-4">
                                    <Shield className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Agent 02</div>
                                    <h3 className="text-base font-black uppercase">🛡️ マネージャー</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Volatility & Risk</div>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                        設定されたSL価格はATR(14)の範囲内であり、
                                        日中のノイズで刈られるリスクが30%程度あります。
                                        あと15pipsほどSLを下げることで、リスクリワード比が1:2に最適化されます。
                                    </p>
                                </div>
                            </div>

                            {/* プロップトレーダーの見解 */}
                            <div className="bg-white border border-slate-200 p-8 space-y-6 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50/50 rounded-bl-full -mr-8 -mt-8 flex items-center justify-center pt-4 pr-4">
                                    <Swords className="w-5 h-5 text-rose-400" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Agent 03</div>
                                    <h3 className="text-base font-black uppercase">⚔️ プロップトレーダー</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Sentiment & Traps</div>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                        150.00の心理的節目付近で既存のロングポジションが解消される傾向にあります。
                                        大手バンクのオーダー状況を見る限り、ここを抜ければ急騰しますが、
                                        失敗した場合は「ダマシ」として急落するリスクが高い場面です。
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* AI総括 (リーダー) */}
                        <div className="bg-slate-900 text-white p-10 md:p-14 space-y-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Crown className="w-32 h-32" />
                            </div>
                            <div className="space-y-4 relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                                    Final Synthesis
                                </div>
                                <h2 className="text-3xl font-black tracking-tight uppercase leading-none">👑 AI 総括推奨プラン</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                                <div className="space-y-6 p-8 border border-white/10 bg-white/5">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Option A (Aggressive)</div>
                                    <h4 className="text-lg font-black uppercase tracking-tighter">現行プランを維持・追撃</h4>
                                    <p className="text-xs font-bold text-white/60 leading-relaxed">
                                        SL価格を149.20に微修正した上でエントリー。
                                        151.00までの上昇を見込んだトレンドフォロー。的中期待度は「高」です。
                                    </p>
                                    <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                        <CheckCircle2 className="w-4 h-4" /> 期待リターン: +180 pips
                                    </div>
                                </div>
                                <div className="space-y-6 p-8 border border-white/10 bg-white/5">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Option B (Conservative)</div>
                                    <h4 className="text-lg font-black uppercase tracking-tighter">150.50突破を確認後にエントリー</h4>
                                    <p className="text-xs font-bold text-white/60 leading-relaxed">
                                        現在は静観し、心理的節目を完全に抜けた後の押し目を狙う。
                                        リスクを極限まで抑えた「堅実」な選択肢です。
                                    </p>
                                    <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Info className="w-4 h-4" /> 期待リターン: +120 pips
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/10 relative z-10">
                                <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Leader's Comment</div>
                                <p className="mt-4 text-sm font-bold italic text-white/80 leading-relaxed">
                                    「市況は強気ですが、目先のノイズに注意が必要です。初心者であればOption Bを選択し、
                                    マーケットの方向性がより確実になってから参入することをお勧めします。」
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
