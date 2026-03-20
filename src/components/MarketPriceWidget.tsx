'use client';

import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketPriceWidgetProps {
    genre: string;
    targetPair: string;
}

export function MarketPriceWidget({ genre, targetPair }: MarketPriceWidgetProps) {
    const [price, setPrice] = useState<number | null>(null);
    const [change, setChange] = useState<number>(0);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const res = await fetch(`/api/market/price?symbol=${encodeURIComponent(targetPair)}&genre=${genre}`);
                const data = await res.json();
                if (data.price !== undefined) {
                    setPrice(data.price);
                    setChange(data.change || 0);
                }
            } catch (e) {
                console.error('Failed to fetch price via proxy', e);
            }
        };

        fetchPrice();
        const interval = setInterval(fetchPrice, 30000); // 30s update
        return () => clearInterval(interval);
    }, [genre, targetPair]);

    const formattedPrice = price ? price.toLocaleString(undefined, { 
        minimumFractionDigits: genre === 'FX' ? 3 : 2, 
        maximumFractionDigits: genre === 'FX' ? 3 : 2 
    }) : '---';

    const isPositive = change >= 0;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{targetPair || 'Market Watch'}</div>
                <div className={`text-[10px] font-bold flex items-center gap-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isPositive ? '+' : ''}{change.toFixed(2)}%
                </div>
            </div>
            <div className="text-2xl font-black text-slate-900 flex items-center gap-2 uppercase font-sans">
                <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
                {genre === 'FX' ? '¥' : '$'}{formattedPrice}
                <span className="text-[10px] text-emerald-500 font-bold ml-1 bg-emerald-50 px-1 rounded">LIVE</span>
            </div>
        </div>
    );
}
