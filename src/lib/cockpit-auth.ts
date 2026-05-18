import 'server-only';
import { cookies } from 'next/headers';

export const COCKPIT_COOKIE = 'sc_cockpit_session';

const SESSION_MAX_AGE = 60 * 60 * 12;

function getAccessKey(): string {
  return process.env.COCKPIT_ACCESS_KEY ?? '';
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// The session cookie holds a derived token, never the raw access key.
export async function cockpitSessionToken(): Promise<string | null> {
  const key = getAccessKey();
  if (!key) return null;
  return sha256Hex('sc-cockpit-session:' + key);
}

export async function verifyCockpitKey(submitted: string): Promise<boolean> {
  const key = getAccessKey();
  if (!key || !submitted) return false;
  return timingSafeEqual(await sha256Hex(submitted), await sha256Hex(key));
}

export async function verifyCockpitToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const expected = await cockpitSessionToken();
  if (!expected) return false;
  return timingSafeEqual(token, expected);
}

export async function isCockpitAuthed(): Promise<boolean> {
  const jar = await cookies();
  return verifyCockpitToken(jar.get(COCKPIT_COOKIE)?.value);
}

export function cockpitCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
}
