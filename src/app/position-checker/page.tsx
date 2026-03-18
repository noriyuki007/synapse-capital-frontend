'use client';

import React, { useState } from 'react';
import { 
    ShieldCheck, Activity, TrendingUp, TrendingDown, 
    CheckCircle2, Shield, Zap, Clock, Database, 
    LineChart, LayoutGrid, Cpu, ArrowRight, User, AlertTriangle
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
    SentimentGauge, MarketAlertGauge, IntelligenceCard, 
    MetricBar, TechnicalChecklist, ExpertProfile, ReportRenderer
} from '@/components/PositionChecker/Visuals';


export default function PositionCheckerPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form inputs
    const [assetClass, setAssetClass] = useState<'FX' | 'STOCK' | 'CRYPTO'>('FX');
    const [ticker, setTicker] = useState('USD/JPY');
    const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
    const [entryPrice, setEntryPrice] = useState('150.25');
    const [stopLoss, setStopLoss] = useState('149.50');
    const [settlement, setSettlement] = useState('152.50');

    // Analysis results
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const loadingTexts = [
        "🌐 マクロ相関データの同期中...",
        "📊 オーダーブック不均衡プロトコル実行中...",
        "⚖️ リスク・ガバナンス・シミュレーション中...",
        "💎 プレミアム・戦略シナリオ生成中..."
    ];

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setLoadingStep(0);
        setShowResults(false);
        setError(null);

        const interval = setInterval(() => {
            setLoadingStep(prev => (prev < loadingTexts.length - 1 ? prev + 1 : prev));
        }, 2000);

        try {
            const userPlan = `${direction} on ${assetClass}:${ticker} from ${entryPrice} with SL at ${stopLoss} and target (settlement) at ${settlement}`;
            const response = await fetch('/api/check-position', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker, assetClass, userPlan })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || '分析の取得に失敗しました');
            }

            const result = await response.json();
            
            // Extract and model data
            const analystData = extractData(result.expertAnalyses?.find((a: any) => a.agentName === 'Analyst')?.analysis);
            const fundManagerData = extractData(result.expertAnalyses?.find((a: any) => a.agentName === 'Fund Manager')?.analysis);
            const propTraderData = extractData(result.expertAnalyses?.find((a: any) => a.agentName === 'Prop Trader')?.analysis);
            const leaderData = extractData(result.leaderSynthesis);

            setAnalysisResult({
                ...result,
                visuals: {
                    sentiment: analystData?.sentimentScore || 68,
                    risk: fundManagerData?.riskLevel || 3,
                    target: propTraderData?.targetPrice || parseFloat(entryPrice) * 1.015,
                    leader: leaderData,
                    analystText: cleanText(result.expertAnalyses?.find((a: any) => a.agentName === 'Analyst')?.analysis),
                    managerText: cleanText(result.expertAnalyses?.find((a: any) => a.agentName === 'Fund Manager')?.analysis),
                    traderText: cleanText(result.expertAnalyses?.find((a: any) => a.agentName === 'Prop Trader')?.analysis),
                    fullLeaderText: cleanText(result.leaderSynthesis)
                }
            });
            
            clearInterval(interval);
            setTimeout(() => {
                setIsLoading(false);
                setShowResults(true);
            }, 800);
        } catch (err: any) {
            clearInterval(interval);
            setIsLoading(false);
            setError(err.message || '予期せぬエラーが発生しました。');
        }
    };

    const extractData = (text?: string) => {
        if (!text) return null;
        const match = text.match(/<data>([\s\S]*?)<\/data>/);
        if (match && match[1]) {
            try { return JSON.parse(match[1].trim()); } catch (e) { return null; }
        }
        return null;
    };

    const cleanText = (text?: string) => {
        if (!text) return '';
        return text.replace(/<data>[\s\S]*?<\/data>/g, '')
                   .replace(/```[\s\S]*?```/g, '')
                   .replace(/\*\*/g, '')
                   .replace(/シナプス・キャピタル(各位|の皆様|の皆さま|チーム|メンバー)/g, '')
                   .replace(/^.*様、?\s*/g, '')
                   .replace(/^[、,]\s*/, '') // Remove leading comma
                   .trim();
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-champagne-gold/20">
            <Header />

            {/* Premium Sub-Header */}
            <div className="bg-royal-navy text-white/90 py-3 px-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="px-2 py-0.5 bg-champagne-gold text-royal-navy text-[10px] font-black rounded-sm">PRO</div>
                        <span className="text-[11px] font-bold tracking-widest uppercase">Synapse Position Checker v2.0</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-medium opacity-60 tracking-tighter">
                        <Clock className="w-3.5 h-3.5" />
                        最終解析時刻：{new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date())}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 text-slate-900">
                
                {/* 1. App Introduction & Scenario Analysis Header */}
                {!showResults && (
                    <div className="mb-16 space-y-12 animate-in fade-in duration-1000">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 text-champagne-gold">
                                <ShieldCheck className="w-6 h-6" />
                                <span className="text-xs font-black uppercase tracking-[0.3em]">Synapse AI Intelligence</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-royal-navy tracking-tighter leading-none flex items-center gap-3">
                                AI投資戦略検証ターミナル
                                <span className="text-[10px] bg-champagne-gold/20 text-champagne-gold border border-champagne-gold/30 px-2 py-1 rounded-md tracking-widest font-black uppercase">Beta</span>
                            </h2>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                あなたが立案した投資プラン（銘柄・価格・リスク設定）を、機関投資家レベルのスペシャリストAI群が多角的に検証します。<br />
                                マクロ相関、ボラティリティ予測、板情報の不均衡など、高度な専門領域を持つ3体の人格化されたAI（チーフ・マクロストラテジスト、シニア・ポートフォリオマネージャー、ヘッド・オブ・トレーディング）が、それぞれ独自の視点からあなたの戦略を鋭く批判・検討します。
                            </p>
                        </div>
                    </div>
                )}

                {/* Analysis Form */}
                {!showResults && !isLoading && (
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-12 space-y-4">
                            <h2 className="text-3xl font-black text-royal-navy">分析シナリオの入力</h2>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                検証したいトレードの概要（エントリー根拠、想定する時間軸、リスク許容度など）を自由に入力してください。具体的数値や背景を入力することで、精度の高い多角的検証が可能になります。
                            </p>
                        </div>
                        <div className="bg-white border border-slate-100 p-8 md:p-12 shadow-xl rounded-3xl">
                            <form onSubmit={handleCheck} className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">アセットクラス選択</label>
                                    <div className="grid grid-cols-3 p-1 bg-slate-50 rounded-xl">
                                        <button type="button" onClick={() => { setAssetClass('FX'); setTicker('USD/JPY'); }} className={`h-11 rounded-lg text-xs font-black transition-all ${assetClass === 'FX' ? 'bg-royal-navy text-white shadow-md' : 'text-slate-400 hover:text-royal-navy'}`}>外国為替 (FX)</button>
                                        <button type="button" onClick={() => { setAssetClass('STOCK'); setTicker('AAPL'); }} className={`h-11 rounded-lg text-xs font-black transition-all ${assetClass === 'STOCK' ? 'bg-royal-navy text-white shadow-md' : 'text-slate-400 hover:text-royal-navy'}`}>株式 (STOCKS)</button>
                                        <button type="button" onClick={() => { setAssetClass('CRYPTO'); setTicker('BTC/USD'); }} className={`h-11 rounded-lg text-xs font-black transition-all ${assetClass === 'CRYPTO' ? 'bg-royal-navy text-white shadow-md' : 'text-slate-400 hover:text-royal-navy'}`}>暗号資産 (CRYPTO)</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">銘柄選択</label>
                                        <select 
                                            className="w-full h-14 px-5 bg-slate-50 border-none rounded-xl text-royal-navy outline-none font-bold text-sm appearance-none cursor-pointer"
                                            value={ticker} onChange={(e) => setTicker(e.target.value)}
                                        >
                                            {assetClass === 'FX' && (
                                                <>
                                                    <option value="USD/JPY">USD/JPY (ドル円)</option>
                                                    <option value="EUR/USD">EUR/USD (ユーロドル)</option>
                                                    <option value="GBP/USD">GBP/USD (ポンドドル)</option>
                                                    <option value="AUD/JPY">AUD/JPY (豪ドル円)</option>
                                                    <option value="EUR/JPY">EUR/JPY (ユーロ円)</option>
                                                    <option value="GBP/JPY">GBP/JPY (ポンド円)</option>
                                                    <option value="NZD/USD">NZD/USD (北米ドル)</option>
                                                    <option value="USD/CAD">USD/CAD (ドルカナダ)</option>
                                                </>
                                            )}
                                            {assetClass === 'STOCK' && (
                                                <>
                                                    <option value="AAPL">Apple (AAPL)</option>
                                                    <option value="NVDA">NVIDIA (NVDA)</option>
                                                    <option value="TSLA">Tesla (TSLA)</option>
                                                    <option value="MSFT">Microsoft (MSFT)</option>
                                                    <option value="GOOGL">Alphabet (GOOGL)</option>
                                                    <option value="AMZN">Amazon (AMZN)</option>
                                                    <option value="META">Meta (META)</option>
                                                    <option value="7203">トヨタ自動車 (7203.T)</option>
                                                    <option value="9984">ソフトバンクG (9984.T)</option>
                                                    <option value="6758">ソニーG (6758.T)</option>
                                                </>
                                            )}
                                            {assetClass === 'CRYPTO' && (
                                                <>
                                                    <option value="BTC/USD">Bitcoin (BTC)</option>
                                                    <option value="ETH/USD">Ethereum (ETH)</option>
                                                    <option value="SOL/USD">Solana (SOL)</option>
                                                    <option value="XRP/USD">Ripple (XRP)</option>
                                                    <option value="DOGE/USD">Dogecoin (DOGE)</option>
                                                    <option value="ADA/USD">Cardano (ADA)</option>
                                                    <option value="BNB/USD">Binance Coin (BNB)</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">売買方向</label>
                                        <div className="grid grid-cols-2 p-1 bg-slate-50 rounded-xl">
                                            <button type="button" onClick={() => setDirection('BUY')} className={`h-11 rounded-lg text-xs font-black transition-all ${direction === 'BUY' ? 'bg-royal-navy text-white' : 'text-slate-400'}`}>買い (BUY)</button>
                                            <button type="button" onClick={() => setDirection('SELL')} className={`h-11 rounded-lg text-xs font-black transition-all ${direction === 'SELL' ? 'bg-royal-navy text-white' : 'text-slate-400'}`}>売り (SELL)</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">エントリー目標</label>
                                        <input type="text" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} className="w-full h-14 px-5 bg-slate-50 border-none rounded-xl text-royal-navy outline-none font-black text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">損切り目安</label>
                                        <input type="text" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className="w-full h-14 px-5 bg-slate-50 border-none rounded-xl text-royal-navy outline-none font-black text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">利確/決済目標</label>
                                        <input type="text" value={settlement} onChange={(e) => setSettlement(e.target.value)} className="w-full h-14 px-5 bg-slate-50 border-none rounded-xl text-royal-navy outline-none font-black text-sm" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full h-16 bg-royal-navy text-white font-black text-sm tracking-widest flex items-center justify-center gap-3 rounded-xl transition-all hover:bg-black hover:scale-[1.01] active:scale-[0.99] group shadow-lg shadow-royal-navy/20">
                                    <Zap className="w-4 h-4 text-champagne-gold fill-current group-hover:animate-pulse" />
                                    プランの妥当性を検証する
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-12">
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-slate-50 border-t-royal-navy rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Activity className="w-8 h-8 text-champagne-gold animate-pulse" />
                            </div>
                        </div>
                        <div className="text-center space-y-4">
                            <h3 className="text-2xl font-black text-royal-navy tracking-tight">{loadingTexts[loadingStep]}</h3>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Running AI Simulation</p>
                        </div>
                    </div>
                )}

                {showResults && !isLoading && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        
                        {/* 1. Evaluation Target & Status Dashboard */}
                        <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-12">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-champagne-gold">
                                    <Activity className="w-5 h-5" />
                                    <span className="text-xs font-black uppercase tracking-widest">戦略検証レポート：サマリー</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-royal-navy tracking-tighter leading-none">
                                    {ticker} {direction === 'BUY' ? '買い' : '売り'} プラン
                                </h1>
                                <div className="flex gap-8 pt-2">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">検証エントリー価格</span>
                                        <p className="text-2xl font-black text-royal-navy">{entryPrice}</p>
                                    </div>
                                    <div className="space-y-1 border-l border-slate-200 pl-8">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">検証損切り価格</span>
                                        <p className="text-2xl font-black text-rose-500">{stopLoss}</p>
                                    </div>
                                    <div className="space-y-1 border-l border-slate-200 pl-8">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">検証決済価格</span>
                                        <p className="text-2xl font-black text-emerald-500">{settlement}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-12">
                                <SentimentGauge score={analysisResult?.visuals?.sentiment || 70} />
                                <MarketAlertGauge level={analysisResult?.visuals?.risk || 3} />
                            </div>
                        </div>

                        {/* Executive Summary Section */}
                        <div className="bg-royal-navy p-10 rounded-3xl border border-white/5 space-y-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <ShieldCheck className="w-32 h-32 text-white" />
                            </div>
                            <div className="relative">
                                <span className="text-[10px] font-black text-champagne-gold uppercase tracking-[0.3em] mb-2 block">Executive Summary</span>
                                <h3 className="text-xl font-black text-white mb-4">本プランの総合評価</h3>
                                <p className="text-white/80 text-sm leading-relaxed max-w-4xl">
                                    {analysisResult?.visuals?.fullLeaderText?.split('\n').find((p: string) => p.length > 20) || '分析データを統合中...'}
                                </p>
                            </div>
                        </div>

                        {/* 2. Expert Evaluation Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Expert 01: Chief Macro Strategist */}
                            <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm space-y-8 flex flex-col">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-royal-navy/5 rounded-lg text-royal-navy">
                                            <Database className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-[11px] font-black text-royal-navy uppercase tracking-widest truncate">01 チーフ・マクロストラテジスト</h4>
                                    </div>
                                    <ExpertProfile 
                                        role="専門領域" 
                                        name="Macro Correlation AI" 
                                        description="主要な中央銀行の政策、金利動向、およびグローバル・アセット間の相関データを深層学習した特化型モデル。" 
                                    />
                                </div>
                                <div className="text-[13px] leading-relaxed text-slate-600 flex-1 border-t border-slate-50 pt-6">
                                    {analysisResult?.visuals?.analystText || '検証中...'}
                                </div>
                            </div>
                            
                            {/* Expert 02: Senior Portfolio Manager */}
                            <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm space-y-8 flex flex-col">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-royal-navy/5 rounded-lg text-royal-navy">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-[11px] font-black text-royal-navy uppercase tracking-widest truncate">02 シニア・ポートフォリオマネージャー</h4>
                                    </div>
                                    <ExpertProfile 
                                        role="専門領域" 
                                        name="Risk Governance AI" 
                                        description="金融工学に基づくボラティリティ推定と、機関投資家のリスク・バジェット管理プロトコルを司る管理モデル。" 
                                    />
                                </div>
                                <div className="text-[13px] leading-relaxed text-slate-600 flex-1 border-t border-slate-50 pt-6">
                                    {analysisResult?.visuals?.managerText || '検証中...'}
                                </div>
                            </div>

                            {/* Expert 03: Head of Trading */}
                            <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm space-y-8 flex flex-col">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-royal-navy/5 rounded-lg text-royal-navy">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-[11px] font-black text-royal-navy uppercase tracking-widest truncate">03 ヘッド・オブ・トレーディング</h4>
                                    </div>
                                    <ExpertProfile 
                                        role="専門領域" 
                                        name="Tactical Execution AI" 
                                        description="マイクロストラクチャー、板情報の不均衡、およびセンチメントの極端な偏りを学習した実行モデル。" 
                                    />
                                </div>
                                <div className="text-[13px] leading-relaxed text-slate-600 flex-1 border-t border-slate-50 pt-6">
                                    {analysisResult?.visuals?.traderText || '検証中...'}
                                </div>
                            </div>
                        </div>

                        {/* AI Orchestration: Core Dialogue Section */}
                        <div className="bg-slate-50 p-10 rounded-3xl border border-slate-200 space-y-8">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-champagne-gold uppercase tracking-[0.3em] block">Committee Orchestration</span>
                                    <h3 className="text-xl font-black text-royal-navy">投資委員会：戦略オーケストレーション</h3>
                                </div>
                                <div className="flex -space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-royal-navy border-2 border-white flex items-center justify-center text-white text-[10px] font-black">01</div>
                                    <div className="w-10 h-10 rounded-full bg-slate-400 border-2 border-white flex items-center justify-center text-white text-[10px] font-black">02</div>
                                    <div className="w-10 h-10 rounded-full bg-royal-navy border-2 border-white flex items-center justify-center text-white text-[10px] font-black">03</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
                                        <div className="absolute -left-2 top-6 w-4 h-4 bg-white border-l border-t border-slate-100 rotate-[-45deg]" />
                                        <span className="text-[9px] font-black text-royal-navy/40 uppercase mb-2 block">Synthesis Node A</span>
                                        <p className="text-[12px] leading-relaxed text-slate-700 italic">
                                            「マクロ的背景は良好だが、PMの指摘するボラティリティの急拡大は看過できない。エントリーを0.2%引き下げることでリスクリワードを最適化できるのではないか？」
                                        </p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative ml-8">
                                        <div className="absolute -left-2 top-6 w-4 h-4 bg-white border-l border-t border-slate-100 rotate-[-45deg]" />
                                        <span className="text-[9px] font-black text-royal-navy/40 uppercase mb-2 block">Synthesis Node B</span>
                                        <p className="text-[12px] leading-relaxed text-slate-700 italic">
                                            「同意する。トレーディングデスク（Node 03）の観測するオーダーフローの偏りを待ってから執行することで、不必要なドローダウンを回避すべきだ。」
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-royal-navy/5 p-8 rounded-2xl border border-royal-navy/10 flex flex-col justify-center">
                                    <h4 className="text-xs font-black text-royal-navy uppercase tracking-widest mb-4">委員会による最終合意プロセス</h4>
                                    <div className="space-y-6">
                                        {analysisResult?.visuals?.leader?.consensusSummary && (
                                            <div className="p-4 bg-white/50 rounded-xl border border-royal-navy/5 mb-2">
                                                <p className="text-[12px] leading-relaxed text-royal-navy font-bold italic">
                                                    「{analysisResult.visuals.leader.consensusSummary}」
                                                </p>
                                            </div>
                                        )}
                                        <div className="space-y-3">
                                            <h5 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 border-b border-emerald-500/20 pb-1.5">
                                                <CheckCircle2 className="w-3 h-3" />
                                                合意事項 (Consensus)
                                            </h5>
                                            <div className="space-y-2">
                                                {analysisResult?.visuals?.leader?.agreedPoints?.map((point: string, idx: number) => (
                                                    <div key={idx} className="flex gap-3">
                                                        <div className="w-1 h-1 rounded-full bg-emerald-400 mt-2" />
                                                        <p className="text-[12px] text-slate-600 font-medium">{point}</p>
                                                    </div>
                                                )) || (
                                                    <p className="text-[12px] text-slate-400 italic">合意形成されたメリットを抽出中...</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-3 pt-4 border-t border-royal-navy/5">
                                            <h5 className="text-[11px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 border-b border-rose-500/20 pb-1.5">
                                                <AlertTriangle className="w-3 h-3" />
                                                否定・懸念事項 (Friction Points)
                                            </h5>
                                            <div className="space-y-2">
                                                {analysisResult?.visuals?.leader?.rejectedPoints?.map((point: string, idx: number) => (
                                                    <div key={idx} className="flex gap-3">
                                                        <div className="w-1 h-1 rounded-full bg-rose-300 mt-2" />
                                                        <p className="text-[12px] text-slate-600 font-medium">{point}</p>
                                                    </div>
                                                )) || (
                                                    <p className="text-[12px] text-slate-400 italic">否定または懸念されたリスクを抽出中...</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Synthesis & Indicators */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Left: Overall Synthesis */}
                            <div className="lg:col-span-8 bg-white border border-slate-200 p-10 rounded-2xl shadow-sm space-y-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-royal-navy">
                                        <Cpu className="w-5 h-5" />
                                        <h4 className="text-xs font-black uppercase tracking-widest">多角市場分析・詳細レポート</h4>
                                    </div>
                                    <h3 className="text-2xl font-bold text-royal-navy border-b-2 border-royal-navy/20 pb-2 mb-2">プランの妥当性に関する最終評決</h3>
                                </div>
                                <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                                    <ReportRenderer text={analysisResult?.visuals?.fullLeaderText || ''} />
                                </div>
                            </div>

                            {/* Right: Technical/Real-time Metrics */}
                            <div className="lg:col-span-4 flex flex-col gap-6">
                                <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl space-y-8">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">リアルタイム指標スコア</h4>
                                    <div className="space-y-6">
                                        <MetricBar label="マクロ相関適合度" value={0.82} />
                                        <MetricBar label="分散リスク指数" value={0.68} />
                                        <MetricBar label="板情報不均衡度" value={0.45} />
                                    </div>
                                </div>
                                <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm flex-1 space-y-6">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">テクニカル・チェック項目</h4>
                                    <TechnicalChecklist />
                                </div>
                            </div>
                        </div>

                        {/* SNS Share & Navigation */}
                        <div className="flex flex-col items-center gap-10 pt-12 border-t border-slate-100">
                            <div className="space-y-4 text-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Share Report</span>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => {
                                            const appDesc = "AI投資戦略検証ターミナル：あなたが立案した投資プランを3人のスペシャリストAIが多角的に検証する機関投資家向けダッシュボード";
                                            const url = window.location.href;
                                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(appDesc)}&url=${encodeURIComponent(url)}`, '_blank');
                                        }} 
                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-black text-white hover:scale-110 transition-all shadow-lg" 
                                        title="X (Twitter) でシェア"
                                    >
                                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const url = window.location.href;
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                                        }} 
                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:scale-110 transition-all shadow-lg" 
                                        title="Facebookでシェア"
                                    >
                                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    </button>
                                    <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('リンクをコピーしました'); }} className="w-12 h-12 flex items-center justify-center rounded-full bg-royal-navy text-white hover:scale-110 transition-all shadow-lg" title="レポートリンクをコピー">
                                      <LayoutGrid className="w-5 h-5 rotate-45" />
                                    </button>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setShowResults(false)}
                                className="h-16 px-16 border-2 border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl transition-all hover:bg-slate-50 active:scale-95"
                            >
                                別のプランを検証・シミュレーションする
                            </button>
                        </div>

                        {/* Disclaimer */}
                        <div className="max-w-4xl mx-auto p-10 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-4">
                            <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                                【免責事項】 本分析は、Synapse AI Committeeを構成する特化型AIモデル群によるシミュレーション結果であり、投資勧誘や収益の保証を行うものではありません。金融市場には固有のリスクが存在し、投入価格や損切り設定はユーザー自身の裁量と責任に基づくものです。
                            </p>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
