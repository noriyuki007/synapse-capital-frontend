import React from 'react';
export const runtime = 'edge';
import { getDictionary } from '@/locales/dictionaries';
import StocksProClient from '@/components/StocksProClient';
import { Metadata } from 'next';

export async function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'ja' }];
}

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const params = await props.params;
    const locale = params?.locale || 'ja';
    const isJa = locale === 'ja';
    
    return {
        title: isJa ? "株式シナプス・ターミナル | Synapse Capital" : "Stocks Synapse Terminal | Synapse Capital",
        description: isJa 
            ? "S&P500・日経225・欧州主要株のPER・PBR・短期売買シグナルをリアルタイムで統合。機関投資家と同じ視点を、個人投資家の手元に。" 
            : "Integrating real-time PER, PBR, and short-term trading signals for S&P 500, Nikkei 225, and major European stocks. The same perspective as institutional investors.",
    };
}

export default async function StocksProPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = params?.locale || 'ja';
    const dict = await getDictionary(locale);

    return <StocksProClient locale={locale} dict={dict} />;
}
