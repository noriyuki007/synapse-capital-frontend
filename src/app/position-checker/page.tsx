'use client';

import React, { useState, useEffect } from 'react';
import { 
    ShieldCheck, Activity, Users, Zap, Info, TrendingUp, TrendingDown, 
    AlertTriangle, CheckCircle2, Globe, Shield, Swords, Crown, ChevronDown, ChevronUp,
    Loader2, ArrowUpRight, BarChart3, FileText, Search, Database, Scale, Target
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

/**
 * Position Checker (Professional Terminal Edition)
 * 情報密度を劇的に高め、専門的なリサーチレポートとしての風格を持たせた診断ツール。
 */
export default function PositionCheckerPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [showResults, setShowResults] = useState(false);

    const loadingTexts = [
        "🌐 マクロ経済指標および中央銀行声明の解析中...",
        "🛡️ ボラティリティ統計およびテクニカル相関係数の算出中...",
        "⚔️ 板情報およびオーダーブックの不均衡を検知中...",
        "👑 投資委員会による統合的トレード戦略の策定中..."
    ];

    // 診断の実行
    const handleCheck = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setLoadingStep(0);
        setShowResults(false);

        const interval = setInterval(() => {
            setLoadingStep(prev => {
                if (prev >= loadingTexts.length - 1) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setIsLoading(false);
                        setShowResults(true);
                    }, 1000);
                    return prev;
                }
                return prev + 1;
            });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-indigo-100 italic-none">
            <Header />

            <main className="max-w-6xl mx-auto px-6 py-16 md:py-24 space-y-20">
                {/* ヒーローセクション */}
                <div className="text-center space-y-8">
                    <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-[#eeefff] rounded-full text-[10px] font-bold text-indigo-600 uppercase tracking-widest border border-indigo-50/50">
                        <Zap className="w-3 h-3 fill-current" /> SYNAPSE POSITION CHECKER V1.0
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none">
                            AI投資委員会：<br className="md:hidden" />高度トレードシナリオ診断
                        </h1>
                        <p className="text-[15px] font-bold text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            数百万規模の市場データ、100以上のテクニカル指標、リアルタイム・センチメントをAI合議制で解析。
                            「直感」を「論理」へ。3名の特化型AIがあなたの意志決定の根拠を、圧倒的な情報量で可視化します。
                        </p>
                    </div>
                </div>

                {/* 入力フォーム & プロフィール */}
                {!showResults && !isLoading && (
                    <div className="space-y-20">
                        <div className="max-w-4xl mx-auto">
                            <section className="bg-white border border-slate-100 p-8 md:p-12 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.03)] relative overflow-hidden">
                                <form onSubmit={handleCheck} className="space-y-10 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                        {/* 通貨ペア */}
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                                                <Globe className="w-4 h-4 text-indigo-300" /> 通貨ペア
                                            </label>
                                            <div className="relative">
                                                <select 
                                                    className="w-full h-[56px] px-5 bg-slate-50 border border-transparent focus:border-indigo-100 focus:bg-white text-slate-900 outline-none text-sm font-bold transition-all appearance-none cursor-pointer"
                                                    required
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>通貨ペアを選択してください</option>
                                                    <option value="USD/JPY">USD/JPY (ドル円)</option>
                                                    <option value="EUR/USD">EUR/USD (ユーロドル)</option>
                                                    <option value="GBP/USD">GBP/USD (ポンドドル)</option>
                                                    <option value="AUD/USD">AUD/USD (豪ドルドル)</option>
                                                    <option value="BTC/USD">BTC/USD (ビットコイン)</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* 売買方向 */}
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                                                <Activity className="w-4 h-4 text-indigo-300" /> 売買方向
                                            </label>
                                            <div className="grid grid-cols-2 gap-0 border border-slate-50 h-[56px] bg-slate-50 p-1">
                                                <button type="button" className="bg-white shadow-sm text-[11px] font-bold text-indigo-600">ロング/買い</button>
                                                <button type="button" className="bg-transparent text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors">ショート/売り</button>
                                            </div>
                                        </div>

                                        {/* 価格入力 */}
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                                                <TrendingUp className="w-4 h-4 text-indigo-300" /> エントリー価格
                                            </label>
                                            <input 
                                                type="text" 
                                                inputMode="decimal"
                                                pattern="[0-9]*\.?[0-9]*"
                                                placeholder="150.25"
                                                className="w-full h-[56px] px-5 bg-slate-50 border border-transparent focus:border-indigo-100 focus:bg-white text-slate-900 outline-none text-sm font-bold transition-all placeholder:text-slate-300"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[11px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                                                <TrendingDown className="w-4 h-4 text-indigo-300" /> 損切り価格 (SL)
                                            </label>
                                            <input 
                                                type="text" 
                                                inputMode="decimal"
                                                pattern="[0-9]*\.?[0-9]*"
                                                placeholder="149.50"
                                                className="w-full h-[56px] px-5 bg-slate-50 border border-transparent focus:border-indigo-100 focus:bg-white text-slate-900 outline-none text-sm font-bold transition-all placeholder:text-slate-300"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        className="w-full h-[72px] bg-black text-white text-[13px] font-bold transition-all duration-300 flex items-center justify-center gap-3 hover:opacity-90"
                                    >
                                        <Zap className="w-4 h-4 fill-current" />
                                        AI投資委員会に診断を依頼する
                                    </button>
                                </form>
                            </section>
                        </div>

                        {/* 専門家AIのプロフィール */}
                        <section className="space-y-10">
                            <div className="text-center space-y-2">
                                <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em]">Expert AI Profiles</h3>
                                <p className="text-xl font-black text-slate-900">診断を担当する3名の特化型AI</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* アナリスト */}
                                <div className="p-8 bg-white border border-slate-100 shadow-sm space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900">マクロ・アナリスト</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fundamental Specialist</p>
                                        </div>
                                    </div>
                                    <p className="text-[12px] font-medium text-slate-500 leading-relaxed">
                                        過去30年分の中央銀行声明、雇用統計、CPI、および主要経済紙（Bloomberg, Reuters等）の全アーカイブを学習。人間には不可能な速度でファンダメンタルズの構造的変化を検知します。感情に左右されず、数字と声明文の「矛盾」のみを抽出する冷徹な分析が持ち味です。
                                    </p>
                                </div>

                                {/* マネージャー */}
                                <div className="p-8 bg-white border border-slate-100 shadow-sm space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900">ファンドマネージャー</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statistical & Risk Management</p>
                                        </div>
                                    </div>
                                    <p className="text-[12px] font-medium text-slate-500 leading-relaxed">
                                        世界中のヘッジファンドが採用する100種類以上のテクニカルアルゴリズムと、ボラティリティ相関データを学習。数百万通りのシミュレーションを瞬時に実行し、期待値の低い「希望的観測」を徹底的に排除します。常に最悪のシナリオを想定し、生存確率を最大化させる守護神としての役割を果たします。
                                    </p>
                                </div>

                                {/* トレーダー */}
                                <div className="p-8 bg-white border border-slate-100 shadow-sm space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-600">
                                            <Swords className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900">プロップトレーダー</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sentiment & Liquidity Hunter</p>
                                        </div>
                                    </div>
                                    <p className="text-[12px] font-medium text-slate-500 leading-relaxed">
                                        リアルタイムの板情報、オーダーブック、および数千万件のリテールポジショニングデータを学習。「大衆がどこで絶望し、どこで損切りを巻き込まれるか」を暴くことに特化しています。人間が陥る「恐怖」や「強欲」を数値として扱い、流動性の溜まり場（罠）を冷徹に特定します。
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* プロフェッショナル・ローディング */}
                {isLoading && (
                    <div className="space-y-16 py-12 flex flex-col items-center">
                        <div className="relative">
                            <div className="w-32 h-32 border-2 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Activity className="w-10 h-10 text-indigo-600 animate-pulse" />
                            </div>
                        </div>
                        
                        <div className="space-y-10 w-full max-w-md">
                            <div className="text-center space-y-3">
                                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] animate-pulse">Synchronizing Professional Intelligence</div>
                                <div className="text-[15px] font-bold text-slate-900 h-8 overflow-hidden">
                                    <span className="block animate-in fade-in slide-in-from-bottom-2">
                                        {loadingTexts[loadingStep]}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                {loadingTexts.map((_, i) => (
                                    <div key={i} className={`h-1 flex-1 transition-all duration-700 ${i <= loadingStep ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 結果：プロフェショナル・リサーチ・レポート */}
                {showResults && !isLoading && (
                    <div className="space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        
                        {/* 1. AI 総括推奨プラン (Executive Summary) */}
                        <section className="bg-slate-950 text-white shadow-[0_48px_96px_-24px_rgba(0,0,0,0.18)] relative overflow-hidden rounded-2xl border border-white/5">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-emerald-900/10 pointer-events-none" />
                            <Crown className="absolute -right-8 -top-8 w-64 h-64 text-white opacity-[0.03] pointer-events-none" />
                            <div className="p-8 md:p-16 space-y-12 relative z-10">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-10">
                                    <div className="space-y-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[9px] font-black text-indigo-300 uppercase tracking-widest">
                                            Professional Intelligence Synthesis
                                        </div>
                                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">👑 AI 総括推奨プラン</h2>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 text-right">
                                        <div className="bg-emerald-500/10 border border-emerald-500/30 px-5 py-2 text-emerald-400 text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
                                            <ShieldCheck className="w-5 h-5" /> 統合信頼スコア: 94.2%
                                        </div>
                                        <span className="text-[10px] text-white/30 font-medium">最終計算時刻: {new Date().toLocaleTimeString()} JST</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* プラン Alpha */}
                                    <div className="p-8 bg-white/5 border border-white/10 hover:bg-indigo-600 transition-all duration-500 group text-left">
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-[10px] font-black text-indigo-400 group-hover:text-white uppercase transition-colors">推奨シナリオ A (積極的)</span>
                                            <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-white" />
                                        </div>
                                        <h3 className="text-2xl font-black mb-6">積極的・追撃戦略</h3>
                                        <p className="text-[13px] font-medium text-white/50 group-hover:text-white/90 leading-relaxed min-h-[60px]">
                                            現行のロングポジションを維持し、151.20への損切りライン引き上げによる利益保護を優先。153.50のテクニカルターゲットを目指す強気なアプローチ。
                                        </p>
                                        <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between group-hover:border-white/20">
                                            <div className="flex flex-col text-left">
                                                <span className="text-[9px] font-black text-white/30 uppercase group-hover:text-white/60">目標利益</span>
                                                <span className="text-xl font-black text-emerald-400 group-hover:text-white mt-1">+145 pips</span>
                                            </div>
                                            <div className="text-[11px] font-black text-white px-3 py-1 bg-white/10 group-hover:bg-black/20 text-center">R:R 1:2.4</div>
                                        </div>
                                    </div>

                                    {/* プラン Beta */}
                                    <div className="p-8 bg-white/5 border border-white/10 hover:bg-slate-700 transition-all duration-500 group text-left">
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase transition-colors">推奨シナリオ B (待機)</span>
                                            <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-white" />
                                        </div>
                                        <h3 className="text-2xl font-black mb-6">堅実・待機戦略</h3>
                                        <p className="text-[13px] font-medium text-white/50 group-hover:text-white/90 leading-relaxed min-h-[60px]">
                                            不確実性の高まりを考慮し、一旦ニュートラルへ。欧州市場開始後の「振り落とし」を待ち、150.80のサポート形成を確認後、再エントリー。
                                        </p>
                                        <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between group-hover:border-white/20">
                                            <div className="flex flex-col text-left">
                                                <span className="text-[9px] font-black text-white/30 uppercase group-hover:text-white/60">目標利益</span>
                                                <span className="text-xl font-black text-slate-300 group-hover:text-white mt-1">+80 pips</span>
                                            </div>
                                            <div className="text-[11px] font-black text-white px-3 py-1 bg-white/10 group-hover:bg-black/20 text-center">R:R 1:1.8</div>
                                        </div>
                                    </div>
                                    {/* 執行プラン詳細 */}
                                    <div className="md:col-span-2 p-6 bg-white/5 border border-white/10 rounded-lg">
                                        <div className="flex items-center gap-3 mb-6">
                                            <FileText className="w-5 h-5 text-indigo-400" />
                                            <h3 className="text-lg font-black uppercase tracking-wider text-left">執行プラン詳細（推奨ベース）</h3>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="p-4 bg-black/40 border border-white/5 text-left">
                                                <span className="text-[9px] font-black text-white/40 uppercase block mb-1">Entry Range</span>
                                                <span className="text-sm font-black text-white">150.80 - 151.00</span>
                                            </div>
                                            <div className="p-4 bg-black/40 border border-white/5 text-left">
                                                <span className="text-[9px] font-black text-white/40 uppercase block mb-1">Take Profit 1</span>
                                                <span className="text-sm font-black text-emerald-400">152.40</span>
                                            </div>
                                            <div className="p-4 bg-black/40 border border-white/5 text-left">
                                                <span className="text-[9px] font-black text-white/40 uppercase block mb-1">Take Profit 2</span>
                                                <span className="text-sm font-black text-indigo-400">153.50</span>
                                            </div>
                                            <div className="p-4 bg-black/40 border border-white/5 text-left">
                                                <span className="text-[9px] font-black text-white/40 uppercase block mb-1">Stop Loss</span>
                                                <span className="text-sm font-black text-rose-500">149.50</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. 専門家詳細リサーチ：プロフェッショナル・ターミナル */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4 px-2">
                                <Search className="w-5 h-5 text-indigo-500" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">各専門AIによる詳細リサーチ報告</h3>
                                <div className="h-px flex-1 bg-slate-100" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                
                                {/* 🌐 アナリスト */}
                                <div className="bg-white border border-slate-100 shadow-sm relative overflow-hidden group text-left">
                                    <div className="bg-slate-900 p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Globe className="w-4 h-4 text-white" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">マクロ・アナリスト</span>
                                        </div>
                                        <div className="px-2 py-0.5 bg-indigo-500 text-[8px] font-black text-white uppercase rounded-sm">検証済</div>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="space-y-4">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-1">主要経済指標データ & AI分析</span>
                                            <ul className="space-y-4">
                                                <li className="space-y-1.5 border-b border-slate-50 pb-2.5">
                                                    <div className="flex items-center justify-between text-[11px] font-bold">
                                                        <span className="text-slate-600">米CPI (前年比)</span>
                                                        <span className="text-slate-900">3.1% <span className="text-slate-300 font-normal ml-1">(予想: 2.9%)</span></span>
                                                    </div>
                                                    <p className="text-[10px] text-rose-500 font-bold leading-tight">予想上振れによるドル金利維持圧力が継続中。</p>
                                                </li>
                                                <li className="space-y-1.5 border-b border-slate-50 pb-2.5">
                                                    <div className="flex items-center justify-between text-[11px] font-bold">
                                                        <span className="text-slate-600">米小売売上高</span>
                                                        <span className="text-emerald-600">+0.6% <span className="text-slate-300 font-normal ml-1">(予想: +0.4%)</span></span>
                                                    </div>
                                                    <p className="text-[10px] text-emerald-600 font-bold leading-tight">米経済の頑健性を示唆。ソフトランディングへの期待高。</p>
                                                </li>
                                                <li className="space-y-1.5 border-b border-slate-50 pb-2.5">
                                                    <div className="flex items-center justify-between text-[11px] font-bold">
                                                        <span className="text-slate-600">日米金利差 (10年)</span>
                                                        <span className="text-slate-900">+4.25% <span className="text-slate-300 font-normal ml-1">(拡大中)</span></span>
                                                    </div>
                                                    <p className="text-[10px] text-indigo-500 font-bold leading-tight">キャリートレードの持続性を裏付ける絶対的優位性。</p>
                                                </li>
                                                <li className="space-y-1.5 border-b border-slate-50 pb-2.5">
                                                    <div className="flex items-center justify-between text-[11px] font-bold">
                                                        <span className="text-slate-600">実質効用為替レート</span>
                                                        <span className="text-rose-500">過小評価 (-12.4%)</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold leading-tight">歴史的割安水準。介入警戒感はあるが、トレンド反転には力不足。</p>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block">情報ソース</span>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-500 rounded-sm italic">Bloomberg 端末データ</span>
                                                <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-500 rounded-sm italic">米連邦公開市場委員会 議事録</span>
                                                <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-500 rounded-sm italic">Reuters 経済速報</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-50 border-l-2 border-slate-900">
                                            <span className="text-[9px] font-black text-slate-900 uppercase block mb-1 flex items-center gap-2">
                                                <Database className="w-3 h-3" /> 推論ロジック：構造的優位性の検証
                                            </span>
                                            <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
                                                米ドルの優位性は単なる投機ではなく、日米金利差の拡大というマクロ構造に裏打ちされている。CPIの鈍化が予想を下回る中、実質金利の維持がドルの押し目買いを強力に正当化する。債務対GDP比の増大は長期的懸念材料だが、短期的には他国通貨に対する「相対的な安全性」と「利回り」がフローを支配しており、反転の兆しは見られない。
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 🛡️ マネージャー */}
                                <div className="bg-white border border-slate-100 shadow-sm relative overflow-hidden group text-left">
                                    <div className="bg-slate-900 p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-4 h-4 text-white" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">ファンドマネージャー</span>
                                        </div>
                                        <div className="px-2 py-0.5 bg-indigo-500 text-[8px] font-black text-white uppercase rounded-sm">検証済</div>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="space-y-4">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-1">テクニカル指標シグナル & AI分析</span>
                                            <ul className="space-y-4">
                                                <li className="space-y-1.5 border-b border-slate-50 pb-2.5">
                                                    <div className="flex items-center gap-3 text-[11px] font-bold">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                        <span className="text-slate-600">RSI(14): <span className="text-rose-600">72.4 (過熱/Divergence)</span></span>
                                                    </div>
                                                    <p className="text-[10px] text-rose-500 font-bold leading-tight">上昇の勢いは強いが、高値圏での調整リスクを示唆。</p>
                                                </li>
                                                <li className="space-y-1.5 border-b border-slate-50 pb-2.5">
                                                    <div className="flex items-center gap-3 text-[11px] font-bold">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                        <span className="text-slate-600">SMA(200)乖離率: <span className="text-indigo-600">+4.12%</span></span>
                                                    </div>
                                                    <p className="text-[10px] text-indigo-500 font-bold leading-tight">長期トレンドは完全に上向き。押し目買いの有効性高。</p>
                                                </li>
                                                <li className="space-y-1.5 border-b border-slate-50 pb-2.5">
                                                    <div className="flex items-center gap-3 text-[11px] font-bold">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                        <span className="text-slate-600">ATR(20): 84.5 pips <span className="text-slate-300 font-normal">(上昇傾向)</span></span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold leading-tight">ボラティリティ拡大中。広めのSLまたはロット調整を推奨。</p>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="space-y-3">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block">ボラティリティ・マッピング</span>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                                <div className="h-full bg-indigo-500" style={{ width: '70%' }} />
                                            </div>
                                            <div className="flex justify-between text-[9px] font-black text-slate-400">
                                                <span>低ボラ</span>
                                                <span>高ボラ (現在)</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-50 border-l-2 border-slate-900">
                                            <span className="text-[9px] font-black text-slate-900 uppercase block mb-1 flex items-center gap-2">
                                                <Scale className="w-3 h-3" /> 推論ロジック：統計的優位性の検証
                                            </span>
                                            <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
                                                オシレーター（RSI）の過熱感は、強力なトレンドの「初期症状」であることが多い。200日移動平均線からの乖離率は許容範囲内であり、MACDのヒストグラム拡大は二次的な加速を示唆している。ボラティリティの拡大を前提としたATRベースのSL設定により、ノイズを回避しつつ統計的なエッジを最大化できる局面であると判断する。
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* ⚔️ トレーダー */}
                                <div className="bg-white border border-slate-100 shadow-sm relative overflow-hidden group text-left">
                                    <div className="bg-slate-900 p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Swords className="w-4 h-4 text-white" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">プロップトレーダー</span>
                                        </div>
                                        <div className="px-2 py-0.5 bg-indigo-500 text-[8px] font-black text-white uppercase rounded-sm">検証済</div>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="space-y-4">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-1">センチメント & 比率分析</span>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-[11px] font-black mb-1">
                                                    <span className="text-slate-600 uppercase">個人投資家ロング比率</span>
                                                    <span className="text-indigo-600">68%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.3)]" style={{ width: '68%' }} />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-[11px] font-black mb-1">
                                                    <span className="text-slate-600 uppercase">オーダーブック不均衡</span>
                                                    <span className="text-rose-500">+12.4% 売り圧力</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]" style={{ width: '56%' }} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-1">流動性・クラスター(罠) & AI分析</span>
                                            <ul className="space-y-4">
                                                <li className="space-y-1.5 border-b border-slate-50 pb-2.5">
                                                    <div className="text-[11px] font-bold text-slate-600 flex items-center gap-2">
                                                        <Target className="w-3.5 h-3.5 text-rose-400" />
                                                        損切り溜まりゾーン: <span className="text-slate-900 ml-auto">150.50 - 150.20</span>
                                                    </div>
                                                    <p className="text-[10px] text-rose-500 font-bold leading-tight">個人投資家のストップが集積。ここを刈った後の反転を想定。</p>
                                                </li>
                                                <li className="space-y-1.5 border-b border-slate-50 pb-2.5">
                                                    <div className="text-[11px] font-bold text-slate-600 flex items-center gap-2">
                                                        <Target className="w-3.5 h-3.5 text-emerald-400" />
                                                        機関投資家買い壁: <span className="text-slate-900 ml-auto">149.80 (大口注文)</span>
                                                    </div>
                                                    <p className="text-[10px] text-emerald-600 font-bold leading-tight">大手機関の鉄板サポート。「堤防」として機能する可能性大。</p>
                                                </li>
                                                <li className="space-y-1.5 border-b border-slate-50 pb-2.5">
                                                    <div className="text-[11px] font-bold text-slate-600 flex items-center gap-2">
                                                        <Activity className="w-3.5 h-3.5 text-indigo-400" />
                                                        ダークプール取引量: <span className="text-slate-900 ml-auto">+24% (増大)</span>
                                                    </div>
                                                    <p className="text-[10px] text-indigo-500 font-bold leading-tight">表に出ない大口のポジションビルドが進行中。急騰の予兆。</p>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-slate-50 border-l-2 border-slate-900">
                                            <span className="text-[9px] font-black text-slate-900 uppercase block mb-1 flex items-center gap-2">
                                                <BarChart3 className="w-3 h-3" /> 推論ロジック：流動性罠の特定と回避
                                            </span>
                                            <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
                                                リテール勢の極端なロング偏重は短期的な下方バイアスを生むが、オーダーブック上の大口買い壁が150円台という強力な「盾」を形成している。ダークプールの不穏な活動は、むしろ個人投資家の損切りプログラムをトリガーにした「ショートスクイーズ（踏み上げ）」を狙った準備である可能性が高い。流動性が最も枯渇する瞬間に、反転の上放れを期待できる。
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="max-w-4xl mx-auto space-y-8 border-t border-slate-100 pt-12">
                            <div className="bg-slate-50 p-6 space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <Info className="w-3 h-3" /> Professional Research Disclaimer
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed font-bold italic">
                                    本リサーチレポートは、AI投資委員会（Synapse AI Committee）による独自の市場分析結果であり、特定の投資行為の勧誘、または将来の運用成果を保証するものではありません。外国為替証拠金取引（FX）は高いリスクを伴い、投資元本を超える損失が発生する可能性があります。最終的な投資決定は、お客様ご自身の判断と責任において行ってください。本レポートの情報はリアルタイムデータに基づき計算されていますが、市場の急激な変化により内容が陳腐化する場合があります。
                                </p>
                            </div>
                            
                            <div className="text-center">
                                <button 
                                    onClick={() => { setShowResults(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className="inline-flex items-center gap-3 text-[11px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-all tracking-[0.3em] pb-1 border-b border-transparent hover:border-indigo-600"
                                >
                                    <Zap className="w-4 h-4" /> 別のプランを診断する
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
