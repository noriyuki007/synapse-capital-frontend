import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const PrivacyJA = () => (
    <div className="space-y-12 text-sm leading-relaxed text-slate-400 font-medium">
        <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                <span className="text-emerald-500 font-mono">01.</span> 個人情報の収集について
            </h2>
            <p>
                Synapse Capital（以下「当サイト」）は、提供するインテリジェンス・サービスを運営するにあたり、ユーザー体験の向上およびサイトのセキュリティ維持を目的として、以下の情報を収集する場合があります。
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-emerald-500">
                <li>アクセスログ情報（IPアドレス、ブラウザの種類、アクセス日時など）</li>
                <li>Cookieやローカルストレージを通じた利用状況のデータ</li>
                <li>お問い合わせ時に任意でご提供いただく情報（メールアドレス等）</li>
            </ul>
        </section>

        <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                <span className="text-emerald-500 font-mono">02.</span> 収集した情報の利用目的
            </h2>
            <p>
                収集した情報は、以下の目的のみで利用いたします。
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-emerald-500">
                <li>AI分析機能（ポジションチェッカー等）のレート制限および不正利用防止のため</li>
                <li>当サイトの改善、および新しいインテリジェンス機能の開発のため</li>
                <li>ユーザーからのお問い合わせに対する回答のため</li>
            </ul>
        </section>

        <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                <span className="text-emerald-500 font-mono">03.</span> 個人情報の第三者提供
            </h2>
            <p>
                当サイトは、法令に基づく場合や不正アクセスへの対応など正当な理由がある場合を除き、事前の同意なくユーザーの個人情報を第三者に提供・開示することはありません。ただし、AIモデル（Google Gemini, OpenRouter等）による推論処理において、入力されたチケット情報等のデータがAPI経由で送信されます。送信されるデータにはユーザーを直接特定する個人情報は含まれません。
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                <span className="text-emerald-500 font-mono">04.</span> 免責事項およびセキュリティ
            </h2>
            <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-xl mt-4">
                <div className="flex items-start gap-3">
                    <ShieldAlert size={20} className="text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-2 text-red-200/80">
                        <p>当サイトは金融情報の提供およびAIによる分析を目的としたツールであり、いかなる投資助言を行うものでもありません。</p>
                        <p>データの最新性や正確性には最大限の注意を払っておりますが、当サイトの情報を利用して生じたいかなる損害についても、当サイトは一切の責任を負いません。投資判断は必ず自己責任において行ってください。</p>
                    </div>
                </div>
            </div>
        </section>

        <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                <span className="text-emerald-500 font-mono">05.</span> アクセス解析ツールについて
            </h2>
            <p>
                当サイトでは、トラフィックデータの収集のためにアクセス解析ツールを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。Cookieを無効にすることで収集を拒否することができますので、お使いのブラウザの設定をご確認ください。
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                <span className="text-emerald-500 font-mono">06.</span> プライバシーポリシーの変更
            </h2>
            <p>
                当サイトは、法令の変更やサービス内容の更新に伴い、本ポリシーを予告なく変更することがあります。変更後のポリシーは、当サイトに掲載された時点で効力を生じるものとします。
            </p>
        </section>

        <section className="space-y-4 pt-8 border-t border-slate-800/50">
            <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                <span className="text-emerald-500 font-mono">07.</span> お問い合わせ窓口
            </h2>
            <p>
                本ポリシーに関するお問い合わせ、または個人情報の取り扱いに関するご相談は、以下のメールアドレスまでご連絡ください。
            </p>
            <p className="text-emerald-400 font-mono mt-2">
                <a href="mailto:info@agent-frontier.jp" className="hover:underline">info@agent-frontier.jp</a>
            </p>
        </section>
    </div>
);
