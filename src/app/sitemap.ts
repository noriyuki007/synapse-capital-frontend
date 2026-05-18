import type { MetadataRoute } from 'next';
import { getSortedReportsData } from '@/lib/reports';
import { getExchanges } from '@/lib/microcms';

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://synapsecapital.net').replace(/\/$/, '');
const LOCALES = ['ja', 'en'] as const;

const STATIC_PATHS = [
  '',
  'exchange',
  'news',
  'position-checker',
  'pro',
  'pro/crypto',
  'pro/stocks',
  'reports',
  'track-record',
  'terms',
  'privacy',
];

function url(locale: string, path: string): string {
  return path ? `${BASE_URL}/${locale}/${path}/` : `${BASE_URL}/${locale}/`;
}

function languagesMap(path: string, locales: readonly string[]): Record<string, string> {
  return Object.fromEntries(locales.map((l) => [l, url(l, path)]));
}

function safeDate(value: string): Date | undefined {
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    const languages = languagesMap(path, LOCALES);
    for (const locale of LOCALES) {
      entries.push({
        url: url(locale, path),
        changeFrequency: path === '' || path === 'reports' ? 'daily' : 'monthly',
        priority: path === '' ? 1 : path === 'reports' ? 0.9 : 0.7,
        alternates: { languages },
      });
    }
  }

  try {
    const reports = await getSortedReportsData();
    const byBaseId = new Map<string, { locales: Set<string>; date: string }>();
    for (const r of reports) {
      const baseId = r.id.replace(/-(ja|en)$/, '');
      const rec = byBaseId.get(baseId) ?? { locales: new Set<string>(), date: r.date };
      rec.locales.add(r.locale || 'ja');
      byBaseId.set(baseId, rec);
    }
    for (const [baseId, rec] of byBaseId) {
      const locales = [...rec.locales];
      const languages = languagesMap(`reports/${baseId}`, locales);
      for (const locale of locales) {
        entries.push({
          url: url(locale, `reports/${baseId}`),
          lastModified: safeDate(rec.date),
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: { languages },
        });
      }
    }
  } catch (e) {
    console.error('[sitemap] failed to load reports:', e);
  }

  try {
    const exchangeLocales = new Map<string, Set<string>>();
    for (const locale of LOCALES) {
      const exchanges = await getExchanges(locale);
      for (const ex of exchanges) {
        const set = exchangeLocales.get(ex.id) ?? new Set<string>();
        set.add(locale);
        exchangeLocales.set(ex.id, set);
      }
    }
    for (const [id, locs] of exchangeLocales) {
      const locales = [...locs];
      const languages = languagesMap(`exchange/${id}`, locales);
      for (const locale of locales) {
        entries.push({
          url: url(locale, `exchange/${id}`),
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: { languages },
        });
      }
    }
  } catch (e) {
    console.error('[sitemap] failed to load exchanges:', e);
  }

  return entries;
}
