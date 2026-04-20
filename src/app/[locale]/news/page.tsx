import React from 'react';
import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { getDictionary } from '@/locales/dictionaries';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import NewsList from '@/components/NewsList';

type NewsItem = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  coreMessage: string;
  actionableAdvice: string;
  publishedAt: string;
  updatedAt: string;
  importance: string;
  importanceLevel: number;
  markets: string[];
  assetClasses: string[];
  categories: string[];
  sentiment: string;
  freshness: string;
  keywords: string;
};

function loadNews(): NewsItem[] {
  try {
    const p = path.join(process.cwd(), 'content', 'notion-news.json');
    if (!fs.existsSync(p)) return [];
    const raw = fs.readFileSync(p, 'utf8');
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    // Sort by publishedAt descending
    return arr.sort((a: NewsItem, b: NewsItem) =>
      (b.publishedAt || '').localeCompare(a.publishedAt || '')
    );
  } catch (e) {
    console.log('[news page] failed to load notion-news.json:', (e as Error).message);
    return [];
  }
}

export async function generateStaticParams() {
  return [{ locale: 'ja' }, { locale: 'en' }];
}

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const isJa = locale === 'ja';
  return {
    title: isJa ? '市場ニュース | Synapse Capital' : 'Market News | Synapse Capital',
    description: isJa
      ? 'Notion InvestmentDB から抽出した、市場に影響する重要ニュースの一覧。'
      : 'Curated market-moving news from the Notion InvestmentDB.',
  };
}

export default async function NewsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const dict = await getDictionary(locale);
  const news = loadNews();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header locale={locale} dict={dict} />
      <main className="max-w-6xl mx-auto px-6 py-16">
        <header className="mb-16 space-y-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
            {dict.news.title}
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
            {dict.news.subtitle}
          </p>
        </header>
        <NewsList items={news} locale={locale} dict={dict} />
      </main>
      <Footer locale={locale} dict={dict} />
    </div>
  );
}
