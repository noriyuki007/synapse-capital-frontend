import React from 'react';
import { getDictionary } from '@/locales/dictionaries';
import PositionCheckerClient from '@/components/PositionCheckerClient';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isJa = locale === 'ja';
    
    return {
        title: isJa ? "AI投資戦略検証ターミナル | Synapse Capital" : "AI Strategy Verification Terminal | Synapse Capital",
        description: isJa 
            ? "あなたが立案した投資プランを機関投資家レベルのスペシャリストAI群が多角的に検証します。" 
            : "Institutional-level specialist AIs multi-dimensionally verify your investment strategy.",
    };
}

export default async function PositionCheckerPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);

    return <PositionCheckerClient locale={locale} dict={dict} />;
}
