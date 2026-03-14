'use client';

import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

export function SolanaPriceWidget() {
    const [price, setPrice] = useState<number | null>(null);
    const amount = 1.8;

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
                const data = await res.json();
                if (data.solana && data.solana.usd) {
                    setPrice(data.solana.usd);
                }
            } catch (e) {
                console.error('Failed to fetch SOL price', e);
            }
        };

        fetchPrice();
        const interval = setInterval(fetchPrice, 30000); // Update every 30s
        return () => clearInterval(interval);
    }, []);

    const totalPrice = price ? (price * amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---';

    return (
        <div className="space-y-1.5">
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">市場参考価格 (SOL)</div>
            <div className="text-base font-black text-slate-900 flex items-center gap-2 uppercase font-sans">
                <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                ${totalPrice} <span className="text-[10px] text-emerald-500 font-bold ml-1">LIVE</span>
            </div>
        </div>
    );
}
