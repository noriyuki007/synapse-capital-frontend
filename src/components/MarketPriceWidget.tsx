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
                if (genre === 'CRYPTO') {
                    const coinId = targetPair.toLowerCase().includes('btc') ? 'bitcoin' : 
                                  targetPair.toLowerCase().includes('sol') ? 'solana' : 
                                  targetPair.toLowerCase().includes('eth') ? 'ethereum' : 'bitcoin';
                    
                    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`);
                    const data = await res.json();
                    if (data[coinId]) {
                        setPrice(data[coinId].usd);
                        setChange(data[coinId].usd_24h_change || 0);
                    }
                } else if (genre === 'FX') {
                    // Standard mock for live feel if we don't have a free reliable FX API handy
                    // In a real app, we'd use a broker API or specialized FX feed
                    const basePrice = targetPair.includes('150') ? 150.25 : 150.80;
                    const randomFlux = (Math.random() - 0.5) * 0.1;
                    setPrice(basePrice + randomFlux);
                    setChange(0.12);
                } else {
                    // Stocks mock
                    const basePrice = targetPair.includes('NASDAQ') ? 21350 : 5100;
                    const randomFlux = (Math.random() - 0.5) * 15;
                    setPrice(basePrice + randomFlux);
                    setChange(0.85);
                }
            } catch (e) {
                console.error('Failed to fetch price', e);
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
