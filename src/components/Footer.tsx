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
                            <Link 
                                href="https://x.com/SynapseCAP_AI" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white border border-slate-200 rounded-none flex items-center justify-center text-slate-400 hover:text-black hover:border-slate-300 transition-all hover:translate-y-[-2px] shadow-sm"
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                                </svg>
                            </Link>
                            <Link 
                                href="https://www.facebook.com/profile.php?id=61580554229879" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white border border-slate-200 rounded-none flex items-center justify-center text-slate-400 hover:text-[#1877F2] hover:border-[#1877F2]/20 transition-all hover:translate-y-[-2px] shadow-sm"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                                </svg>
                            </Link>
                            <Link 
                                href="https://github.com/noriyuki007/synapse-capital-frontend" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white border border-slate-200 rounded-none flex items-center justify-center text-slate-400 hover:text-black hover:border-slate-300 transition-all hover:translate-y-[-2px] shadow-sm"
                            >
                                <Github className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
                        <div className="space-y-8">
                            <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none">プラットフォーム</h5>
                            <nav className="flex flex-col gap-5 text-xs font-black text-slate-400 uppercase tracking-widest">
                                <Link href="/ja/pro" className="hover:text-indigo-600 transition-colors">FX プロ</Link>
                                <Link href="/ja/pro/stocks" className="hover:text-indigo-600 transition-colors">株式プロ</Link>
                                <Link href="/ja/pro/crypto" className="hover:text-indigo-600 transition-colors">暗号資産プロ</Link>
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
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] flex items-center gap-4">
                            © 2026 SYNAPSE CAPITAL GLOBAL NETWORK
                            <span className="text-[8px] border border-slate-200 px-1.5 py-0.5 opacity-50">v0.8.2-BETA</span>
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
