'use client';

import React from 'react';
import { Activity, ShieldCheck, Mail, ArrowRight, Globe, Twitter, Github } from 'lucide-react';
import Link from 'next/link';

export const Footer = () => {
    return (
        <footer className="bg-slate-50/50 border-t border-slate-100 pt-32 pb-16 px-6 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-indigo-50/30 rounded-none blur-[120px] pointer-events-none" />
            
            <div className="max-w-[1440px] mx-auto space-y-24 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                    
                    {/* Brand Section */}
                    <div className="lg:col-span-5 space-y-12">
                        <div className="space-y-6">
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 bg-black rounded-none flex items-center justify-center text-white shrink-0 group-hover:bg-indigo-600 transition-all duration-500 shadow-xl shadow-black/5">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div className="text-xl font-black tracking-tighter text-black uppercase font-sans leading-none">
                                    SYNAPSE CAPITAL
                                </div>
                            </Link>
                            <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-sm uppercase tracking-tight">
                                AIによる多角的な市場解析と次世代金融インテリジェンスの融合。私たちは、不確実なマーケットにおいて「根拠ある予測」を追求し続けます。
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <Link href="#" className="w-10 h-10 bg-white border border-slate-200 rounded-none flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all hover:translate-y-[-2px] shadow-sm">
                                <Twitter className="w-4 h-4" />
                            </Link>
                            <Link href="#" className="w-10 h-10 bg-white border border-slate-200 rounded-none flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all hover:translate-y-[-2px] shadow-sm">
                                <Github className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
                        <div className="space-y-8">
                            <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none">プラットフォーム</h5>
                            <nav className="flex flex-col gap-5 text-xs font-black text-slate-400 uppercase tracking-widest">
                                <Link href="/ja/pro" className="hover:text-indigo-600 transition-colors">FX Pro</Link>
                                <Link href="/ja/pro/stocks" className="hover:text-indigo-600 transition-colors">株式 Pro</Link>
                                <Link href="/ja/pro/crypto" className="hover:text-indigo-600 transition-colors">暗号資産 Pro</Link>
                            </nav>
                        </div>
                        <div className="space-y-8">
                            <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none">インテリジェンス</h5>
                            <nav className="flex flex-col gap-5 text-xs font-black text-slate-400 uppercase tracking-widest">
                                <Link href="/ja/reports" className="hover:text-indigo-600 transition-colors">最新レポート</Link>
                                <Link href="/ja/track-record" className="hover:text-indigo-600 transition-colors">運用実績</Link>
                                <Link href="/ja/exchange" className="hover:text-indigo-600 transition-colors">推奨パートナー</Link>
                            </nav>
                        </div>
                        <div className="space-y-8">
                            <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none">信頼性 / 規約</h5>
                            <nav className="flex flex-col gap-5 text-xs font-black text-slate-400 uppercase tracking-widest">
                                <Link href="/terms" className="hover:text-indigo-600 transition-colors">利用規約</Link>
                                <Link href="/privacy" className="hover:text-indigo-600 transition-colors">プライバシーポリシー</Link>
                                <Link href="mailto:support@synapsecapital.net" className="hover:text-indigo-600 transition-colors">お問い合わせ</Link>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-16 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
                            © 2026 SYNAPSE CAPITAL GLOBAL NETWORK
                        </div>
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest max-w-2xl leading-relaxed">
                            免責事項：全ての金融予測はAIによって生成されたものであり、投資助言を構成するものではありません。取引には実質的なリスクが伴います。
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-8">
                         <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="w-1 h-1 bg-indigo-400 rounded-none" />
                            セキュリティ規格 ISO/AI 27001
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
