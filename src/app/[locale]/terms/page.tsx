import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getDictionary } from '@/locales/dictionaries';
import { TermsJA } from '@/components/legal/TermsJA';
import { TermsEN } from '@/components/legal/TermsEN';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return {
        title: locale === 'ja' ? '利用規約 | Synapse Capital' : 'Terms of Service | Synapse Capital',
        description: locale === 'ja' ? 'Synapse Capitalの利用規約について。' : 'Terms of Service for Synapse Capital.'
    };
}

const TermsOfService = async ({ params }: { params: Promise<{ locale: string }> }) => {
    const { locale } = await params;
    const dict = await getDictionary(locale);

    return (
        <div className="min-h-screen bg-[#020617] selection:bg-indigo-500/30 selection:text-white">
            <Header locale={locale} dict={dict} />
            
            <div className="py-24 px-6 relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="mb-16">
                        <h1 className="text-4xl font-black tracking-tight text-white mb-4 uppercase">
                            Terms of <span className="text-indigo-500">Service</span>
                        </h1>
                        <p className="text-sm font-mono text-indigo-400/80 tracking-widest border-l-2 border-indigo-500 pl-4 py-1">
                            {locale === 'ja' ? '利用規約' : 'Terms of Service'}
                        </p>
                        <p className="mt-4 text-slate-400 text-xs font-mono">
                            {locale === 'ja' ? '最終更新日: 2026年3月18日' : 'Last Updated: March 18, 2026'}
                        </p>
                    </div>

                    {locale === 'ja' ? <TermsJA /> : <TermsEN />}
                </div>
            </div>

            <Footer locale={locale} dict={dict} />
        </div>
    );
}

export default TermsOfService;
