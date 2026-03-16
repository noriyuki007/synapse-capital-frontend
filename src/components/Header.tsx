'use client';

import React, { useState } from 'react';
import { Activity, Globe, ChevronDown, BarChart3, Bitcoin, ShieldCheck, Cpu, LayoutGrid, FileText, TrendingUp, Users, Menu, X } from 'lucide-react';
import Link from 'next/link';

export const Header = () => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        {
            label: "マーケット・ターミナル",
            id: "markets",
            items: [
                { label: "FX プロ", href: "/ja/pro", icon: Activity, desc: "外国為替市場のAI解析" },
                { label: "株式 プロ", href: "/ja/pro/stocks", icon: BarChart3, desc: "グローバル株式ターミナル" },
                { label: "暗号資産 プロ", href: "/ja/pro/crypto", icon: Bitcoin, desc: "オンチェーン・インサイト" },
            ]
        },
        {
            label: "インテリジェンス",
            id: "intelligence",
            items: [
                { label: "最新レポート", href: "/ja/reports", icon: FileText, desc: "AIマーケット分析レポート" },
                { label: "運用実績", href: "/ja/track-record", icon: TrendingUp, desc: "透明性の高い的中率公開" },
            ]
        },
        {
            label: "パートナー・連携",
            id: "partners",
            items: [
                { label: "パートナー連携", href: "/ja/exchange", icon: Users, desc: "推奨取引プラットフォーム一覧" },
            ]
        }
    ];

    return (
        <header className="sticky top-0 z-[100] bg-white/90 border-b border-slate-100 px-4 md:px-8 py-3 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-12">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-black rounded-none flex items-center justify-center text-white shrink-0 group-hover:bg-indigo-600 transition-all duration-300">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div className="text-base font-black tracking-tighter text-black uppercase font-sans leading-none">
                        SYNAPSE CAPITAL
                    </div>
                </Link>

                <nav className="hidden lg:flex items-center gap-1 text-[13px] font-black text-slate-500 uppercase tracking-widest">
                    {menuItems.map((menu) => (
                        <div 
                            key={menu.id} 
                            className="relative group py-2 px-4"
                            onMouseEnter={() => setOpenDropdown(menu.id)}
                            onMouseLeave={() => setOpenDropdown(null)}
                        >
                            <button className="flex items-center gap-1.5 hover:text-black transition-colors focus:outline-none uppercase">
                                {menu.label}
                                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${openDropdown === menu.id ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            <div className={`absolute top-full left-0 w-64 pt-2 transition-all duration-300 ${openDropdown === menu.id ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                                <div className="bg-white border border-slate-100 rounded-none shadow-2xl shadow-slate-200/50 overflow-hidden p-2">
                                    {menu.items.map((item) => (
                                        <Link 
                                            key={item.href} 
                                            href={item.href}
                                            className="flex items-start gap-4 p-3 rounded-none hover:bg-slate-50 transition-colors group/item"
                                        >
                                            <div className="mt-0.5 w-8 h-8 bg-slate-50 rounded-none flex items-center justify-center text-slate-400 group-hover/item:bg-indigo-50 group-hover/item:text-indigo-600 transition-colors">
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.label}</div>
                                                <div className="text-[9px] font-bold text-slate-400">{item.desc}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-none text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
                    システム稼働中
                </div>
                
                {/* Hamburger Menu Button */}
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-2 text-slate-900 focus:outline-none"
                    aria-label="Menu"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Navigation Drawer */}
            <div className={`fixed inset-0 z-[110] lg:hidden transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                <div className={`absolute top-0 right-0 w-[80%] h-full bg-white shadow-2xl transition-transform duration-500 ease-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-8 space-y-12 overflow-y-auto h-full">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="flex items-center gap-3 shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
                                <div className="w-8 h-8 bg-black rounded-none flex items-center justify-center text-white">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div className="text-sm font-black tracking-tighter text-black uppercase">SYNAPSE</div>
                            </Link>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <nav className="space-y-10">
                            {menuItems.map((menu) => (
                                <div key={menu.id} className="space-y-6">
                                    <div className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] pl-2 border-l-2 border-slate-100">{menu.label}</div>
                                    <div className="grid gap-4 pl-2">
                                        {menu.items.map((item) => (
                                            <Link 
                                                key={item.href} 
                                                href={item.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-4 group"
                                            >
                                                <div className="w-10 h-10 bg-slate-50 flex items-center justify-center text-slate-400 group-active:bg-indigo-50 group-active:text-indigo-600">
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="text-[13px] font-black text-slate-900 uppercase tracking-widest">{item.label}</div>
                                                    <div className="text-[10px] font-bold text-slate-400">{item.desc}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </nav>

                        <div className="pt-8 border-t border-slate-100">
                             <div className="flex items-center gap-2 px-3 py-3 bg-slate-50 border border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-widest justify-center">
                                <div className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
                                システム稼働中
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
