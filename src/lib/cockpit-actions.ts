'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  COCKPIT_COOKIE,
  cockpitCookieOptions,
  cockpitSessionToken,
  verifyCockpitKey,
} from '@/lib/cockpit-auth';

export type CockpitLoginState = { error: string };

export async function loginAction(
  _prev: CockpitLoginState,
  formData: FormData
): Promise<CockpitLoginState> {
  const key = String(formData.get('accessKey') ?? '');
  const locale = String(formData.get('locale') ?? 'ja') === 'en' ? 'en' : 'ja';

  if (!(await verifyCockpitKey(key))) {
    return { error: 'アクセスキーが正しくありません。' };
  }

  const token = await cockpitSessionToken();
  if (!token) {
    return { error: 'サーバー側でアクセスキー(COCKPIT_ACCESS_KEY)が未設定です。' };
  }

  const jar = await cookies();
  jar.set(COCKPIT_COOKIE, token, cockpitCookieOptions());

  redirect(`/${locale}/private-cockpit-x92j/`);
}
