'use client';

import React from 'react';

export const MarketTicker = () => {
    const items = [
        { label: "EUR/USD", val: "1.0820", chg: "+0.05%", up: true },
        { label: "BTC/USD", val: "96,200.00", chg: "+1.20%", up: true },
        { label: "GOLD", val: "2,024.10", chg: "+0.15%", up: true },
        { label: "US 10Y", val: "4.28%", chg: "-0.02", up: false },
        { label: "S&P 500", val: "5,026.61", chg: "+0.57%", up: true },
    ];

    return (
        <div className="w-full bg-[#f8fafc] border-b border-slate-100 py-1.5 overflow-hidden">
            <div className="flex animate-ticker whitespace-nowrap">
                {[...items, ...items, ...items].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 text-[9px] font-bold tracking-tighter">
                        <span className="text-slate-400 uppercase">{item.label}</span>
                        <span className="text-slate-900">{item.val}</span>
                        <span className={item.up ? "text-emerald-500" : "text-rose-500"}>{item.chg}</span>
                    </div>
                ))}
            </div>
            <style jsx>{`
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                .animate-ticker {
                    animation: ticker 40s linear infinite;
                }
            `}</style>
        </div>
    );
};
