import React from 'react';
import { getDictionary } from '@/locales/dictionaries';
import FXProClient from '@/components/FXProClient';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isJa = locale === 'ja';
    
    return {
        title: isJa ? "FX シナプス・ターミナル | Synapse Capital" : "FX Synapse Terminal | Synapse Capital",
        description: isJa 
            ? "AIが通貨ペアの値動き・経済指標・市場センチメントを複合解析。プロフェッショナル向けFX解析ターミナル。" 
            : "AI multi-factorially analyzes currency price actions and market sentiment. Professional FX analysis terminal.",
    };
}

export default async function FXProPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);

    return <FXProClient locale={locale} dict={dict} />;
}
