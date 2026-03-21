import React from 'react';
export const runtime = 'edge';
import { getDictionary } from '@/locales/dictionaries';
import PositionCheckerClient from '@/components/PositionCheckerClient';
import { Metadata } from 'next';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const params = await props.params;
    const locale = params?.locale || 'ja';
    const isJa = locale === 'ja';
    
    return {
        title: isJa ? "AI投資戦略検証ターミナル | Synapse Capital" : "AI Strategy Verification Terminal | Synapse Capital",
        description: isJa 
            ? "あなたが立案した投資プランを機関投資家レベルのスペシャリストAI群が多角的に検証します。" 
            : "Institutional-level specialist AIs multi-dimensionally verify your investment strategy.",
    };
}

export default async function PositionCheckerPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = params?.locale || 'ja';
    const dict = await getDictionary(locale);

    return <PositionCheckerClient locale={locale} dict={dict} />;
}
