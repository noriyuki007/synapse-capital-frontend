'use client';

import { useActionState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { loginAction, type CockpitLoginState } from '@/lib/cockpit-actions';

const initialState: CockpitLoginState = { error: '' };

export default function CockpitLogin({ locale }: { locale: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center p-4">
      <form
        action={formAction}
        className="w-full max-w-sm bg-[#0f172a] border border-slate-800 rounded-xl p-8 space-y-6"
      >
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-emerald-500" />
          <span className="text-[10px] font-mono font-bold text-emerald-500 tracking-widest uppercase">
            Restricted Access
          </span>
        </div>
        <div className="space-y-2">
          <h1 className="text-lg font-bold text-white">Deep Intel Cockpit</h1>
          <p className="text-xs text-slate-500">アクセスキーを入力してください。</p>
        </div>

        <input type="hidden" name="locale" value={locale} />
        <input
          type="password"
          name="accessKey"
          autoComplete="off"
          required
          placeholder="Access Key"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50"
        />

        {state?.error && <p className="text-xs text-red-400 font-mono">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-50 text-emerald-400 text-xs font-bold rounded-md border border-emerald-500/20 transition-all uppercase tracking-widest"
        >
          {pending ? 'Verifying...' : 'Enter'}
        </button>
      </form>
    </div>
  );
}
