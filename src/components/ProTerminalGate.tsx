'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Zap, CreditCard, ExternalLink, Lock, CheckCircle2, Key } from 'lucide-react';
import Link from 'next/link';

interface ProTerminalGateProps {
    locale: string;
    dict: any;
    onUnlock?: () => void;
}

export default function ProTerminalGate({ locale, dict, onUnlock }: ProTerminalGateProps) {
    const [accessKey, setAccessKey] = useState('');
    const [error, setError] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);

    const gDict = dict.pro_gate || {
        title: "Access Restricted: Institutional Intel Inside",
        subtitle: "Unlock the Synapse PRO Terminal",
        desc_1: "You are attempting to access a high-probability AI signal layer. Public access is currently restricted to ensure execution latency and API stability for our active trading community.",
        desc_2: "Unlock lifetime unlimited access to all PRO features (including real-time ticks, whale alerts, and sector dispersion analyses) by completing one of the verification steps below.",
        option_1_title: "Option A: Connect Partner Account (100% Free)",
        option_1_desc: "Open a new trading account with one of our certified partner brokers using our official link, deposit funds, and verify your account. You will get lifetime PRO terminal access for free.",
        option_1_button: "View Certified Broker Partners",
        option_2_title: "Option B: Premium Membership License",
        option_2_desc: "Get instant access without changing your current broker. Subscription plans start at $99/month, billed quarterly. Perfect for institutional desks or existing account holders.",
        option_2_button: "Subscribe to Premium",
        trust_badge_title: "Secure & Certified Connection",
        trust_badge_desc: "Integrity Certified by Synapse AI Protocol. No hidden fees. Direct execution integration."
    };

    const handleVerifyKey = (e: React.FormEvent) => {
        e.preventDefault();
        // A simple test bypass key
        if (accessKey.trim().toUpperCase() === 'PRO-MOCK-2026') {
            setIsUnlocked(true);
            localStorage.setItem('sc_pro_terminal_unlocked', 'true');
            if (onUnlock) onUnlock();
        } else {
            setError(locale === 'ja' ? '無効なアクセスキーです。' : 'Invalid access key.');
        }
    };

    useEffect(() => {
        const cached = localStorage.getItem('sc_pro_terminal_unlocked');
        if (cached === 'true') {
            setIsUnlocked(true);
            if (onUnlock) onUnlock();
        }
    }, [onUnlock]);

    if (isUnlocked) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-none shadow-2xl p-6 md:p-12 space-y-10 my-8">
                {/* Header */}
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-950/50 border border-rose-800/30 rounded-none text-[11px] font-black text-rose-400 uppercase tracking-[0.2em]">
                        <Lock className="w-3.5 h-3.5" />
                        {gDict.title}
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-none font-sans uppercase">
                        {gDict.subtitle}
                    </h1>
                    <p className="text-xs md:text-sm font-medium text-slate-400 leading-relaxed uppercase">
                        {gDict.desc_1}
                    </p>
                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase border-t border-slate-800 pt-4">
                        {gDict.desc_2}
                    </p>
                </div>

                {/* Conversion Funnels / Two Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    {/* Option 1: Affiliate Route */}
                    <div className="bg-slate-950 border border-slate-800 p-8 flex flex-col justify-between space-y-8 relative overflow-hidden group hover:border-indigo-500/50 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:scale-110 transition-transform">
                            <Zap className="w-24 h-24 text-white" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-indigo-400">
                                <Zap className="w-5 h-5 fill-indigo-500/10" />
                                <h3 className="text-xs font-black uppercase tracking-widest">{gDict.option_1_title}</h3>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                {gDict.option_1_desc}
                            </p>
                        </div>
                        <Link 
                            href={`/${locale}/exchange`}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 rounded-none"
                        >
                            {gDict.option_1_button} <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* Option 2: Subscription Route */}
                    <div className="bg-slate-950 border border-slate-800 p-8 flex flex-col justify-between space-y-8 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:scale-110 transition-transform">
                            <CreditCard className="w-24 h-24 text-white" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <CreditCard className="w-5 h-5" />
                                <h3 className="text-xs font-black uppercase tracking-widest">{gDict.option_2_title}</h3>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                {gDict.option_2_desc}
                            </p>
                        </div>
                        <button 
                            onClick={() => alert(locale === 'ja' ? '現在準備中です。Option Aをご利用ください。' : 'Premium checkout is coming soon. Please use Option A.')}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 rounded-none"
                        >
                            {gDict.option_2_button} <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Verification/Bypass Field */}
                <div className="border-t border-slate-800 pt-8 max-w-md mx-auto">
                    <form onSubmit={handleVerifyKey} className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Key className="w-3.5 h-3.5" />
                                {locale === 'ja' ? 'アクセスキーを入力（開発バイパス：PRO-MOCK-2026）' : 'Enter Access Key (Bypass: PRO-MOCK-2026)'}
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={accessKey}
                                onChange={(e) => { setAccessKey(e.target.value); setError(''); }}
                                placeholder="Access Key"
                                className="flex-1 px-4 py-3 bg-slate-950 border border-slate-850 text-white text-xs font-mono focus:outline-none focus:border-indigo-650 rounded-none uppercase"
                            />
                            <button 
                                type="submit"
                                className="px-6 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-black uppercase tracking-widest rounded-none border border-slate-700"
                            >
                                {locale === 'ja' ? '解除' : 'Unlock'}
                            </button>
                        </div>
                        {error && <p className="text-[10px] font-mono text-rose-500">{error}</p>}
                    </form>
                </div>

                {/* Trust Badges */}
                <div className="pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3.5 text-left">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500/80 shrink-0" />
                        <div>
                            <h4 className="text-[10px] font-black text-slate-350 uppercase tracking-widest">{gDict.trust_badge_title}</h4>
                            <p className="text-[9px] font-bold text-slate-500 uppercase leading-normal">{gDict.trust_badge_desc}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3.5 text-left md:border-l md:border-slate-800 md:pl-8">
                        <ShieldAlert className="w-8 h-8 text-indigo-400 shrink-0" />
                        <div>
                            <h4 className="text-[10px] font-black text-slate-350 uppercase tracking-widest">
                                {locale === 'ja' ? 'スプレッド・約定保証' : 'Execution & Spread certified'}
                            </h4>
                            <p className="text-[9px] font-bold text-slate-500 uppercase leading-normal">
                                {locale === 'ja' ? '提携口座での執行に最適化された取引シグナル設計' : 'Signals optimized for low-latency execution with partner accounts'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
