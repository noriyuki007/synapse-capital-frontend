import React from 'react';
import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getDictionary } from '@/locales/dictionaries';
import { PrivacyJA } from '@/components/legal/PrivacyJA';
import { PrivacyEN } from '@/components/legal/PrivacyEN';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return {
        title: locale === 'ja' ? 'プライバシーポリシー | Synapse Capital' : 'Privacy Policy | Synapse Capital',
        description: locale === 'ja' ? 'Synapse Capitalのプライバシーポリシーについて。' : 'Privacy Policy for Synapse Capital.'
    };
}

const PrivacyPolicy = async ({ params }: { params: Promise<{ locale: string }> }) => {
    const { locale } = await params;
    const dict = await getDictionary(locale);

    return (
        <div className="min-h-screen bg-[#020617] selection:bg-emerald-500/30 selection:text-white">
            <Header locale={locale} dict={dict} />
            
            <div className="py-24 px-6 relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="mb-16">
                        <h1 className="text-4xl font-black tracking-tight text-white mb-4 uppercase">
                            Privacy <span className="text-emerald-500">Policy</span>
                        </h1>
                        <p className="text-sm font-mono text-emerald-500/80 tracking-widest border-l-2 border-emerald-500 pl-4 py-1">
                            {locale === 'ja' ? 'プライバシーポリシー' : 'Privacy Policy'}
                        </p>
                        <p className="mt-4 text-slate-400 text-xs font-mono">
                            {locale === 'ja' ? '最終更新日: 2026年3月18日' : 'Last Updated: March 18, 2026'}
                        </p>
                    </div>

                    {locale === 'ja' ? <PrivacyJA /> : <PrivacyEN />}
                </div>
            </div>

            <Footer locale={locale} dict={dict} />
        </div>
    );
}

export default PrivacyPolicy;
