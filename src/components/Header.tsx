'use client';

import React, { useState } from 'react';
import { Activity, ChevronDown, BarChart3, Bitcoin, ShieldCheck, FileText, TrendingUp, Users, Menu, X, Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export const Header = ({ locale, dict }: { locale: string; dict: any }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        {
            label: dict.header.markets,
            id: "markets",
            items: [
                { label: dict.header.fx_pro, href: `/${locale}/pro`, icon: Activity, desc: dict.header.fx_desc },
                { label: dict.header.stocks_pro, href: `/${locale}/pro/stocks`, icon: BarChart3, desc: dict.header.stocks_desc },
                { label: dict.header.crypto_pro, href: `/${locale}/pro/crypto`, icon: Bitcoin, desc: dict.header.crypto_desc },
            ]
        },
        {
            label: dict.header.intelligence,
            id: "intelligence",
            items: [
                { label: dict.header.strategy_check, href: `/${locale}/position-checker`, icon: ShieldCheck, desc: dict.header.strategy_desc },
                { label: dict.header.reports, href: `/${locale}/reports`, icon: FileText, desc: dict.header.reports_desc },
                { label: dict.header.track_record, href: `/${locale}/track-record`, icon: TrendingUp, desc: dict.header.track_desc },
            ]
        },
        {
            label: dict.header.partners,
            id: "partners",
            items: [
                { label: dict.header.exchange_partners, href: `/${locale}/exchange`, icon: Users, desc: dict.header.exchange_desc },
            ]
        }
    ];

    const toggleLanguage = () => {
        const newLocale = locale === 'ja' ? 'en' : 'ja';
        const segments = pathname.split('/');
        segments[1] = newLocale;
        router.push(segments.join('/') || `/${newLocale}/`);
    };

    return (
        <>
            {/* Mobile Navigation Drawer */}
            <div className={`fixed inset-0 z-[600] lg:hidden transition-all duration-500 overflow-hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'}`}>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setIsMobileMenuOpen(false)} />
                <div className={`absolute top-0 right-0 w-[300px] sm:w-[380px] h-screen bg-white shadow-2xl transition-transform duration-500 ease-out border-l border-slate-100 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-6 md:p-8 space-y-12 overflow-y-auto h-full scrollbar-hide">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 shrink-0">
                                <Link href={`/${locale}/`} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-black rounded-none flex items-center justify-center text-white">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div className="text-sm font-black tracking-tighter text-black uppercase">SYNAPSE</div>
                                </Link>
                            </div>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)} 
                                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-black hover:bg-slate-50 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <nav className="space-y-10">
                            {menuItems.map((menu) => (
                                <div key={menu.id} className="space-y-6">
                                    <div className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] pl-2 border-l-2 border-slate-100">{menu.label}</div>
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
                                                    <div className="text-[11px] font-bold text-slate-500">{item.desc}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </nav>

                        <div className="pt-8 border-t border-slate-100 space-y-4">
                             <button 
                                onClick={toggleLanguage}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-none text-[11px] font-black text-slate-900 uppercase tracking-widest hover:bg-slate-100 transition-colors"
                             >
                                <Globe className="w-4 h-4 text-indigo-600" />
                                {locale === 'ja' ? 'English' : '日本語'} に切り替え
                             </button>
                             <div className="flex items-center gap-2 px-3 py-3 bg-slate-50 border border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-widest justify-center">
                                <div className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
                                {dict.common.system_active}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <header className="sticky top-0 z-[500] bg-white border-b border-slate-100 px-4 md:px-8 py-3 flex items-center justify-between backdrop-blur-md bg-opacity-95">
                <div className="flex items-center gap-4 md:gap-12 flex-1 min-w-0">
                    <Link href={`/${locale}/`} className="flex items-center gap-3 group shrink-0">
                        <div className="w-8 h-8 bg-black rounded-none flex items-center justify-center text-white shrink-0 group-hover:bg-indigo-600 transition-all duration-300">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div className="text-sm md:text-base font-black tracking-tighter text-black uppercase font-sans leading-none flex items-center gap-2">
                            <span className="hidden min-[380px]:inline">SYNAPSE CAPITAL</span>
                            <span className="min-[380px]:hidden">SYNAPSE</span>
                            <span className="text-[8px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1 py-0.5 rounded tracking-widest font-black uppercase tracking-tighter shrink-0">{dict.common.live}</span>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-1 text-[13px] font-black text-slate-500 uppercase tracking-widest h-full">
                        {menuItems.map((menu) => (
                            <div key={menu.id} className="relative py-2 px-4 group">
                                 <div className="flex items-center h-full">
                                    <button className="flex items-center gap-1.5 hover:text-black transition-colors focus:outline-none uppercase py-2 h-full">
                                        {menu.label}
                                        <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180" />
                                    </button>
                                 </div>

                                {/* Dropdown Menu (Pure CSS Hover) */}
                                <div className="absolute top-[80%] left-0 w-64 pt-4 opacity-0 translate-y-2 invisible pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible group-hover:pointer-events-auto transition-all duration-300 z-[999]">
                                    <div className="bg-white border border-slate-100 rounded-none shadow-2xl shadow-slate-200/60 overflow-hidden p-2">
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

                <div className="flex items-center gap-2 md:gap-4">
                    <button 
                        onClick={toggleLanguage}
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-slate-200 text-slate-900 text-[11px] font-black shadow-sm uppercase tracking-widest hover:bg-slate-50 transition-colors"
                    >
                        <Globe className="w-3.5 h-3.5 text-indigo-600" />
                        {locale === 'ja' ? 'EN' : 'JA'}
                    </button>

                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-none text-[11px] font-black text-slate-500 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
                        {dict.common.system_active}
                    </div>
                    
                    {/* Hamburger Menu Button */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2.5 -mr-1 text-slate-900 focus:outline-none hover:bg-slate-50 rounded-none transition-colors"
                        aria-label="Menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </header>
        </>
    );
};
