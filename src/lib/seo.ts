import type { Metadata } from 'next';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://synapsecapital.net').replace(/\/$/, '');

const LOCALES = ['ja', 'en'] as const;
const DEFAULT_OG_IMAGE = '/images/hero_visual.png';

function pathFor(locale: string, path: string): string {
  return path ? `/${locale}/${path}/` : `/${locale}/`;
}

// Canonical URL for the current locale plus hreflang alternates for every locale.
export function localeAlternates(locale: string, path: string) {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = pathFor(l, path);
  languages['x-default'] = pathFor('ja', path);
  return { canonical: pathFor(locale, path), languages };
}

type PageSeoInput = {
  locale: string;
  path: string; // no leading/trailing slash; '' for the home page
  title: string;
  description?: string;
  ogImage?: string;
};

export function pageSeo({ locale, path, title, description, ogImage }: PageSeoInput): Metadata {
  const { canonical, languages } = localeAlternates(locale, path);
  const image = ogImage ?? DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Synapse Capital',
      locale: locale === 'en' ? 'en_US' : 'ja_JP',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
