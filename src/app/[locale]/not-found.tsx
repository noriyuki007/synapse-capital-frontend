import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getDictionary } from '@/locales/dictionaries';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default async function NotFound({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Header locale={locale} dict={dict} />
      <main className="max-w-4xl mx-auto px-6 py-32 text-center space-y-12">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-rose-50 rounded-none flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase font-sans">
            {dict.common.not_found_title}
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest max-w-lg mx-auto leading-relaxed">
            {dict.common.not_found_desc}
          </p>
        </div>
        <div className="flex justify-center pt-8">
          <Link 
            href={`/${locale}`} 
            className="px-12 py-5 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-none hover:bg-slate-800 transition-all flex items-center gap-3 shadow-2xl"
          >
            <ArrowLeft className="w-4 h-4" /> {dict.common.back_to_home}
          </Link>
        </div>
      </main>
      <Footer locale={locale} dict={dict} />
    </div>
  );
}
