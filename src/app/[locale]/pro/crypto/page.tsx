import React from 'react';
import { getDictionary } from '@/locales/dictionaries';
import CryptoProClient from '@/components/CryptoProClient';
import { Metadata } from 'next';

export const dynamicParams = false;
export async function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'ja' }];
}

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const params = await props.params;
    const locale = params?.locale || 'ja';
    const isJa = locale === 'ja';
    
    return {
        title: isJa ? "クリプト・シナプス・ターミナル | Synapse Capital" : "Crypto Synapse Terminal | Synapse Capital",
        description: isJa 
            ? "BTCからSOLまで、主要銘柄から新興L1までを網羅。大口の動きやDEXの出来高をAIが監視する、プロフェッショナル向け暗号資産解析ターミナル。" 
            : "From BTC to SOL, covering everything from major tickers to emerging L1s. Professional crypto analysis terminal with AI whale tracking.",
    };
}

export default async function CryptoProPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = params?.locale || 'ja';
    const dict = await getDictionary(locale);

    return <CryptoProClient locale={locale} dict={dict} />;
}
