import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Negotiator from 'negotiator';

const locales = ['en', 'ja'];
const defaultLocale = 'ja';

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  
  // Find the first supported locale in the preferred languages
  const locale = locales.find((l) => languages.some(preferred => preferred.toLowerCase().startsWith(l)));
  return locale || defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Permanent (301) redirects for legacy root-level SEO paths (Force /ja/)
  const legacyPaths = ['/reports', '/position-checker', '/terms', '/privacy', '/exchange'];
  const isLegacy = legacyPaths.some(lp => pathname === lp || pathname.startsWith(`${lp}/`));
  
  if (isLegacy) {
    const url = request.nextUrl.clone();
    url.pathname = `/ja${pathname.endsWith('/') ? pathname : pathname + '/'}`;
    return NextResponse.redirect(url, { status: 301 });
  }

  // 2. Skip if the pathname already has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // 3. Determine the best locale based on Accept-Language
  const locale = getLocale(request);

  // 4. Redirect to the localized path (Temporary 307 for dynamic detection)
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  
  if (!url.pathname.endsWith('/')) {
      url.pathname += '/';
  }

  return NextResponse.redirect(url, { status: 307 });
}

export const config = {
  // Matcher to exclude internal Next.js paths and public assets
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|content|robots.txt|sitemap.xml).*)',
  ],
};
