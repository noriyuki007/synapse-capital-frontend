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

interface PositionCheckerClientProps {
    locale: string;
    dict: any;
}

export default function PositionCheckerClient({ locale, dict }: PositionCheckerClientProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form inputs
    const [assetClass, setAssetClass] = useState<'FX' | 'STOCK' | 'CRYPTO'>('FX');
    const [ticker, setTicker] = useState('USD/JPY');
    const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
    const [entryPrice, setEntryPrice] = useState('');
    const [stopLoss, setStopLoss] = useState('');
    const [settlement, setSettlement] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    // Analysis results
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const loadingTexts = [
        dict.position_checker.loading_1,
        dict.position_checker.loading_2,
        dict.position_checker.loading_3,
        dict.position_checker.loading_4
    ];

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setLoadingStep(0);
        setShowResults(false);
        setError(null);

        const entry = parseFloat(entryPrice);
        const sl = parseFloat(stopLoss);
        const tp = parseFloat(settlement);

        if (isNaN(entry) || isNaN(sl) || isNaN(tp)) {
            setError(dict.position_checker.validation_nan);
            setIsLoading(false);
            return;
        }

        // Logical Validation
        if (direction === 'BUY') {
            if (tp <= entry) {
                setValidationError(dict.position_checker.validation_buy_tp);
                setIsLoading(false);
                return;
            }
            if (sl >= entry) {
                setValidationError(dict.position_checker.validation_buy_sl);
                setIsLoading(false);
                return;
            }
        } else {
            if (tp >= entry) {
                setValidationError(dict.position_checker.validation_sell_tp);
                setIsLoading(false);
                return;
            }
            if (sl <= entry) {
                setValidationError(dict.position_checker.validation_sell_sl);
                setIsLoading(false);
                return;
            }
        }

        setValidationError(null);

        const interval = setInterval(() => {
            setLoadingStep(prev => (prev < loadingTexts.length - 1 ? prev + 1 : prev));
        }, 2000);

        try {
            const userPlan = `${direction} on ${assetClass}:${ticker} from ${entryPrice} with SL at ${stopLoss} and target (settlement) at ${settlement}`;
            const response = await fetch('/api/check-position/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker, assetClass, userPlan })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || (locale === 'ja' ? '分析の取得に失敗しました' : 'Failed to fetch analysis'));
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
            setError(err.message || (locale === 'ja' ? '予期せぬエラーが発生しました。' : 'An unexpected error occurred.'));
        }
    };

    const extractData = (text?: string) => {
        if (!text) return null;
        const dataMatch = text.match(/<data>([\s\S]*?)(?:<\/data>|$)/i);
        const contentToParse = dataMatch ? dataMatch[1] : text;
        try {
            const jsonMatch = contentToParse.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.warn("Soft JSON parse failed, trying fallback", e);
        }
        const rawJsonMatch = text.match(/\{[\s\S]*?\}(?=[^}]*$)/);
        if (rawJsonMatch) {
            try { return JSON.parse(rawJsonMatch[0]); } catch (e) { return null; }
        }
        return null;
    };

    const getPlaceholder = (field: 'entry' | 'sl' | 'tp') => {
        if (assetClass === 'FX') {
            if (field === 'entry') return '150.50';
            if (field === 'sl') return direction === 'BUY' ? '149.80' : '151.20';
            return direction === 'BUY' ? '152.00' : '148.50';
        }
        if (assetClass === 'CRYPTO') {
            if (field === 'entry') return '95000';
            if (field === 'sl') return direction === 'BUY' ? '92000' : '98000';
            return direction === 'BUY' ? '105000' : '85000';
        }
        if (field === 'entry') return '250.00';
        if (field === 'sl') return direction === 'BUY' ? '245.00' : '255.00';
        return direction === 'BUY' ? '270.00' : '230.00';
    };

    const getUnit = () => {
        if (assetClass === 'FX') return ticker.includes('JPY') ? 'JPY' : 'USD';
        if (assetClass === 'CRYPTO') return 'USD';
        return ticker.match(/^\d+$/) ? 'JPY' : 'USD';
    };

    const cleanText = (text?: string) => {
        if (!text) return '';
        return text.replace(/<data>[\s\S]*?(?:<\/data>|$)/gi, '')
                   .replace(/```[\s\S]*?```/g, '')
                   .replace(/```(json|markdown|)/gi, '')
                   .replace(/\{[\s\S]*?\}(?=[^}]*$)/g, '')
                   .replace(/\{[\s\S]*\}/g, '')
                   .replace(/[`]/g, '')
                   .replace(/\sjson\s|(?:\s|^)json(?:\s|$)/gi, ' ')
                   .replace(/\*\*/g, '')
                   .replace(/シナプス・キャピタル(各位|の皆様|の皆さま|チーム|メンバー)/g, '')
                   .replace(/^.*様、?\s*/g, '')
                   .replace(/^[、,]\s*/, '')
                   .trim();
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-champagne-gold/20">
            <Header locale={locale} dict={dict} />

            {/* Premium Sub-Header */}
            <div className="bg-royal-navy text-white/90 py-3 px-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="px-2 py-0.5 bg-champagne-gold text-royal-navy text-[10px] font-black rounded-sm">PRO</div>
                        <span className="text-[11px] font-bold tracking-widest uppercase">{dict.position_checker.sub_header}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-medium opacity-60 tracking-tighter">
                        <Clock className="w-3.5 h-3.5" />
                        {dict.position_checker.last_analysis}：{new Intl.DateTimeFormat(locale === 'ja' ? 'ja-JP' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date())}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 text-slate-900">
                {!showResults && (
                    <div className="mb-16 space-y-12 animate-in fade-in duration-1000">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 text-champagne-gold">
                                <ShieldCheck className="w-6 h-6" />
                                <span className="text-xs font-black uppercase tracking-[0.3em]">{dict.position_checker.hero_badge}</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-royal-navy tracking-tighter leading-none flex items-center gap-3">
                                {dict.position_checker.hero_title}
                                <span className="text-[10px] bg-champagne-gold/20 text-champagne-gold border border-champagne-gold/30 px-2 py-1 rounded-md tracking-widest font-black uppercase">Beta</span>
                            </h2>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-4xl">
                                {dict.position_checker.hero_desc}
                            </p>
                        </div>
                    </div>
                )}

                {!showResults && !isLoading && (
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-12 space-y-4">
                            <h2 className="text-3xl font-black text-royal-navy">{dict.position_checker.form_title}</h2>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                {dict.position_checker.form_desc}
                            </p>
                        </div>
                        <div className="bg-white border border-slate-100 p-8 md:p-12 shadow-xl rounded-3xl">
                            <form onSubmit={handleCheck} className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dict.position_checker.asset_class}</label>
                                    <div className="grid grid-cols-3 p-1 bg-slate-50 rounded-xl">
                                        <button type="button" onClick={() => { setAssetClass('FX'); setTicker('USD/JPY'); }} className={`h-11 rounded-lg text-xs font-black transition-all ${assetClass === 'FX' ? 'bg-royal-navy text-white shadow-md' : 'text-slate-400 hover:text-royal-navy'}`}>{dict.position_checker.fx}</button>
                                        <button type="button" onClick={() => { setAssetClass('STOCK'); setTicker('AAPL'); }} className={`h-11 rounded-lg text-xs font-black transition-all ${assetClass === 'STOCK' ? 'bg-royal-navy text-white shadow-md' : 'text-slate-400 hover:text-royal-navy'}`}>{dict.position_checker.stocks}</button>
                                        <button type="button" onClick={() => { setAssetClass('CRYPTO'); setTicker('BTC/USD'); }} className={`h-11 rounded-lg text-xs font-black transition-all ${assetClass === 'CRYPTO' ? 'bg-royal-navy text-white shadow-md' : 'text-slate-400 hover:text-royal-navy'}`}>{dict.position_checker.crypto}</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dict.position_checker.ticker_selection}</label>
                                        <select 
                                            className="w-full h-14 px-5 bg-slate-50 border-none rounded-xl text-royal-navy outline-none font-bold text-sm appearance-none cursor-pointer"
                                            value={ticker} onChange={(e) => setTicker(e.target.value)}
                                        >
                                            {assetClass === 'FX' && (
                                                <>
                                                    <option value="USD/JPY">USD/JPY {locale === 'ja' ? '(ドル円)' : ''}</option>
                                                    <option value="EUR/USD">EUR/USD {locale === 'ja' ? '(ユーロドル)' : ''}</option>
                                                    <option value="GBP/USD">GBP/USD {locale === 'ja' ? '(ポンドドル)' : ''}</option>
                                                    <option value="AUD/JPY">AUD/JPY {locale === 'ja' ? '(豪ドル円)' : ''}</option>
                                                    <option value="EUR/JPY">EUR/JPY {locale === 'ja' ? '(ユーロ円)' : ''}</option>
                                                    <option value="GBP/JPY">GBP/JPY {locale === 'ja' ? '(ポンド円)' : ''}</option>
                                                    <option value="NZD/USD">NZD/USD</option>
                                                    <option value="USD/CAD">USD/CAD</option>
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
                                                    <option value="7203">Toyota (7203.T)</option>
                                                    <option value="9984">SoftBank (9984.T)</option>
                                                    <option value="6758">Sony (6758.T)</option>
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
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dict.position_checker.direction}</label>
                                        <div className="grid grid-cols-2 p-1 bg-slate-50 rounded-xl">
                                            <button type="button" onClick={() => setDirection('BUY')} className={`h-11 rounded-lg text-xs font-black transition-all ${direction === 'BUY' ? 'bg-royal-navy text-white' : 'text-slate-400'}`}>{dict.position_checker.buy}</button>
                                            <button type="button" onClick={() => setDirection('SELL')} className={`h-11 rounded-lg text-xs font-black transition-all ${direction === 'SELL' ? 'bg-royal-navy text-white' : 'text-slate-400'}`}>{dict.position_checker.sell}</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dict.position_checker.entry_target}</label>
                                            <span className="text-[10px] font-bold text-slate-300 uppercase">{getUnit()}</span>
                                        </div>
                                        <input type="number" step="any" placeholder={getPlaceholder('entry')} value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} className="w-full h-14 px-5 bg-slate-50 border-none rounded-xl text-royal-navy outline-none font-black text-sm" required />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dict.position_checker.stop_loss_limit}</label>
                                            <span className="text-[10px] font-bold text-slate-300 uppercase">{getUnit()}</span>
                                        </div>
                                        <input type="number" step="any" placeholder={getPlaceholder('sl')} value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className="w-full h-14 px-5 bg-slate-50 border-none rounded-xl text-royal-navy outline-none font-black text-sm" required />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dict.position_checker.take_profit_target}</label>
                                            <span className="text-[10px] font-bold text-slate-300 uppercase">{getUnit()}</span>
                                        </div>
                                        <input type="number" step="any" placeholder={getPlaceholder('tp')} value={settlement} onChange={(e) => setSettlement(e.target.value)} className="w-full h-14 px-5 bg-slate-50 border-none rounded-xl text-royal-navy outline-none font-black text-sm" required />
                                    </div>
                                </div>

                                {validationError && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                                        <p className="text-xs font-bold text-rose-600">{validationError}</p>
                                    </div>
                                )}
                                <button type="submit" className="w-full h-16 bg-royal-navy text-white font-black text-sm tracking-widest flex items-center justify-center gap-3 rounded-xl transition-all hover:bg-black hover:scale-[1.01] active:scale-[0.99] group shadow-lg shadow-royal-navy/20">
                                    <Zap className="w-4 h-4 text-champagne-gold fill-current group-hover:animate-pulse" />
                                    {dict.position_checker.validate_plan}
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
                        <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-12">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-champagne-gold">
                                    <Activity className="w-5 h-5" />
                                    <span className="text-xs font-black uppercase tracking-widest">{dict.position_checker.report_summary}</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-royal-navy tracking-tighter leading-none">
                                    {dict.position_checker.plan_label.replace('{ticker}', ticker).replace('{direction}', direction === 'BUY' ? (locale === 'ja' ? '買い' : 'Buy') : (locale === 'ja' ? '売り' : 'Sell'))}
                                </h1>
                                <div className="flex gap-8 pt-2">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dict.position_checker.entry_target}</span>
                                        <p className="text-2xl font-black text-royal-navy">{entryPrice}</p>
                                    </div>
                                    <div className="space-y-1 border-l border-slate-200 pl-8">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dict.position_checker.stop_loss_limit}</span>
                                        <p className="text-2xl font-black text-rose-500">{stopLoss}</p>
                                    </div>
                                    <div className="space-y-1 border-l border-slate-200 pl-8">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dict.position_checker.take_profit_target}</span>
                                        <p className="text-2xl font-black text-emerald-500">{settlement}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-12">
                                <SentimentGauge score={analysisResult?.visuals?.sentiment || 70} label={dict.position_checker.sentiment_label} />
                                <MarketAlertGauge level={analysisResult?.visuals?.risk || 3} label={dict.position_checker.risk_label} />
                            </div>
                        </div>

                        <div className="bg-royal-navy p-10 rounded-3xl border border-white/5 space-y-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <ShieldCheck className="w-32 h-32 text-white" />
                            </div>
                            <div className="relative">
                                <span className="text-[10px] font-black text-champagne-gold uppercase tracking-[0.3em] mb-2 block">Executive Summary</span>
                                <h3 className="text-xl font-black text-white mb-4">{dict.position_checker.overall_eval}</h3>
                                <p className="text-white/80 text-sm leading-relaxed max-w-4xl">
                                    {analysisResult?.visuals?.fullLeaderText?.split('\n').find((p: string) => p.length > 20) || (locale === 'ja' ? '分析データを統合中...' : 'Integrating analysis data...')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm space-y-8 flex flex-col">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-royal-navy/5 rounded-lg text-royal-navy">
                                            <Database className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-[11px] font-black text-royal-navy uppercase tracking-widest truncate">{dict.position_checker.expert_01_title}</h4>
                                    </div>
                                    <ExpertProfile 
                                        role={dict.position_checker.expert_01_role} 
                                        name="Macro Correlation AI" 
                                        description={dict.position_checker.expert_01_desc} 
                                    />
                                </div>
                                <div className="text-[13px] leading-relaxed text-slate-600 flex-1 border-t border-slate-50 pt-6">
                                    {analysisResult?.visuals?.analystText || (locale === 'ja' ? '検証中...' : 'Verifying...')}
                                </div>
                            </div>
                            
                            <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm space-y-8 flex flex-col">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-royal-navy/5 rounded-lg text-royal-navy">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-[11px] font-black text-royal-navy uppercase tracking-widest truncate">{dict.position_checker.expert_02_title}</h4>
                                    </div>
                                    <ExpertProfile 
                                        role={dict.position_checker.expert_02_role} 
                                        name="Risk Governance AI" 
                                        description={dict.position_checker.expert_02_desc} 
                                    />
                                </div>
                                <div className="text-[13px] leading-relaxed text-slate-600 flex-1 border-t border-slate-50 pt-6">
                                    {analysisResult?.visuals?.managerText || (locale === 'ja' ? '検証中...' : 'Verifying...')}
                                </div>
                            </div>

                            <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm space-y-8 flex flex-col">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-royal-navy/5 rounded-lg text-royal-navy">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-[11px] font-black text-royal-navy uppercase tracking-widest truncate">{dict.position_checker.expert_03_title}</h4>
                                    </div>
                                    <ExpertProfile 
                                        role={dict.position_checker.expert_03_role} 
                                        name="Tactical Execution AI" 
                                        description={dict.position_checker.expert_03_desc} 
                                    />
                                </div>
                                <div className="text-[13px] leading-relaxed text-slate-600 flex-1 border-t border-slate-50 pt-6">
                                    {analysisResult?.visuals?.traderText || (locale === 'ja' ? '検証中...' : 'Verifying...')}
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-10 rounded-3xl border border-slate-200 space-y-8">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-champagne-gold uppercase tracking-[0.3em] block">Committee Orchestration</span>
                                    <h3 className="text-xl font-black text-royal-navy">{dict.position_checker.committee_title}</h3>
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
                                            {locale === 'ja' 
                                                ? '「マクロ的背景は良好だが、PMの指摘するボラティリティの急拡大は看過できない。エントリーを0.2%引き下げることでリスクリワードを最適化できるのではないか？」'
                                                : '"The macro background is favorable, but the sharp increase in volatility pointed out by the PM cannot be ignored. Perhaps risk-reward can be optimized by lowering the entry by 0.2%?"'}
                                        </p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative ml-8">
                                        <div className="absolute -left-2 top-6 w-4 h-4 bg-white border-l border-t border-slate-100 rotate-[-45deg]" />
                                        <span className="text-[9px] font-black text-royal-navy/40 uppercase mb-2 block">Synthesis Node B</span>
                                        <p className="text-[12px] leading-relaxed text-slate-700 italic">
                                            {locale === 'ja'
                                                ? '「同意する。トレーディングデスク（Node 03）の観測するオーダーフローの偏りを待ってから執行することで、不必要なドローダウンを回避すべきだ。」'
                                                : '"Agreed. Unnecessary drawdown should be avoided by waiting for the order flow bias observed by the trading desk (Node 03) before execution."'}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-royal-navy/5 p-8 rounded-2xl border border-royal-navy/10 flex flex-col justify-center">
                                    <h4 className="text-xs font-black text-royal-navy uppercase tracking-widest mb-4">{dict.position_checker.consensus_process}</h4>
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
                                                {dict.position_checker.agreed_points}
                                            </h5>
                                            <div className="space-y-2">
                                                {analysisResult?.visuals?.leader?.agreedPoints?.map((point: string, idx: number) => (
                                                    <div key={idx} className="flex gap-3">
                                                        <div className="w-1 h-1 rounded-full bg-emerald-400 mt-2" />
                                                        <p className="text-[12px] text-slate-600 font-medium">{point}</p>
                                                    </div>
                                                )) || (
                                                    <p className="text-[12px] text-slate-400 italic">{locale === 'ja' ? '合意形成されたメリットを抽出中...' : 'Extracting consensus benefits...'}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-3 pt-4 border-t border-royal-navy/5">
                                            <h5 className="text-[11px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 border-b border-rose-500/20 pb-1.5">
                                                <AlertTriangle className="w-3 h-3" />
                                                {dict.position_checker.friction_points}
                                            </h5>
                                            <div className="space-y-2">
                                                {analysisResult?.visuals?.leader?.rejectedPoints?.map((point: string, idx: number) => (
                                                    <div key={idx} className="flex gap-3">
                                                        <div className="w-1 h-1 rounded-full bg-rose-300 mt-2" />
                                                        <p className="text-[12px] text-slate-600 font-medium">{point}</p>
                                                    </div>
                                                )) || (
                                                    <p className="text-[12px] text-slate-400 italic">{locale === 'ja' ? '否定または懸念されたリスクを抽出中...' : 'Extracting rejected points/concerns...'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            <div className="lg:col-span-8 bg-white border border-slate-200 p-10 rounded-2xl shadow-sm space-y-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-royal-navy">
                                        <Cpu className="w-5 h-5" />
                                        <h4 className="text-xs font-black uppercase tracking-widest">{dict.position_checker.detailed_report_title}</h4>
                                    </div>
                                    <h3 className="text-2xl font-bold text-royal-navy border-b-2 border-royal-navy/20 pb-2 mb-2">{dict.position_checker.final_verdict}</h3>
                                </div>
                                <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                                    <ReportRenderer text={analysisResult?.visuals?.fullLeaderText || ''} />
                                </div>
                            </div>

                            <div className="lg:col-span-4 flex flex-col gap-6">
                                <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl space-y-8">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{dict.position_checker.realtime_metrics}</h4>
                                    <div className="space-y-6">
                                        <MetricBar label={dict.position_checker.macro_fit} value={0.82} />
                                        <MetricBar label={dict.position_checker.risk_index} value={0.68} />
                                        <MetricBar label={dict.position_checker.imbalance_index} value={0.45} />
                                    </div>
                                </div>
                                <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm flex-1 space-y-6">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{dict.position_checker.technical_checklist}</h4>
                                    <TechnicalChecklist dict={dict} />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-10 pt-12 border-t border-slate-100">
                            <div className="space-y-4 text-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{dict.position_checker.share_report}</span>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => {
                                            const appDesc = locale === 'ja' ? "AI投資戦略検証ターミナル：あなたが立案した投資プランを3人のスペシャリストAIが多角的に検証する機関投資家向けダッシュボード" : "AI Investment Strategy Verification Terminal: An institutional dashboard where 3 specialist AIs verify your investment plan.";
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
                                    <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert(dict.common.link_copied); }} className="w-12 h-12 flex items-center justify-center rounded-full bg-royal-navy text-white hover:scale-110 transition-all shadow-lg" title={locale === 'ja' ? 'レポートリンクをコピー' : 'Copy Report Link'}>
                                      <LayoutGrid className="w-5 h-5 rotate-45" />
                                    </button>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setShowResults(false)}
                                className="h-16 px-16 border-2 border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl transition-all hover:bg-slate-50 active:scale-95"
                            >
                                {dict.position_checker.another_plan}
                            </button>
                        </div>

                        <div className="max-w-4xl mx-auto p-10 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-4">
                            <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                                {dict.position_checker.disclaimer_title} {dict.position_checker.disclaimer_text}
                            </p>
                        </div>
                    </div>
                )}
            </main>

            <Footer locale={locale} dict={dict} />
        </div>
    );
}
