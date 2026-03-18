import React from 'react';
import { Metadata } from 'next';
import { ShieldAlert, Activity } from 'lucide-react';

export const metadata: Metadata = {
    title: '利用規約 | Synapse Capital',
    description: 'Synapse Capitalの利用規約について。'
};

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 py-24 px-6 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-16">
                    <h1 className="text-4xl font-black tracking-tight text-white mb-4 uppercase">
                        Terms of <span className="text-indigo-500">Service</span>
                    </h1>
                    <p className="text-sm font-mono text-indigo-400/80 tracking-widest border-l-2 border-indigo-500 pl-4 py-1">
                        利用規約
                    </p>
                    <p className="mt-4 text-slate-400 text-xs font-mono">最終更新日: 2026年3月18日</p>
                </div>

                <div className="space-y-12 text-sm leading-relaxed text-slate-400 font-medium">
                    
                    {/* Important Disclaimer Banner */}
                    <div className="p-6 bg-red-900/10 border border-red-500/20 rounded-2xl">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-500/10 rounded-xl shrink-0">
                                <ShieldAlert size={24} className="text-red-500" />
                            </div>
                            <div className="space-y-3 text-red-100/90">
                                <h3 className="text-base font-bold text-red-400 tracking-widest">最重要の法的免責事項 - NO FINANCIAL ADVICE</h3>
                                <p>
                                    Synapse Capital（以下「当サイト」）上のすべての情報は、教育や研究、および情報提供のみを目的としており、いかなる場合においても<strong>投資助言を構成するものではありません</strong>。
                                </p>
                                <p>
                                    AIによって生成された予測や分析、スコアは、過去のデータや特定のアルゴリズムに基づいたシミュレーションであり、将来の市場動向や利益を保証するものではありません。当サイトの情報を利用して行われた金融取引による損失について、当社は一切の責任を負負いかねます。すべての投資判断は、ユーザー自身の完全なる自己責任において行ってください。
                                </p>
                            </div>
                        </div>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                            <span className="text-indigo-500 font-mono">第1条</span> 適用
                        </h2>
                        <p>
                            本規約は、ユーザーと当サイトとの間のサービスの利用に関わる全ての関係に適用されます。当サイトを利用することにより、ユーザーは本規約のすべての条件に同意したものとみなされます。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                            <span className="text-indigo-500 font-mono">第2条</span> 提供するインテリジェンス・サービス
                        </h2>
                        <p>
                            当サイトは、複数のLLM（大規模言語モデル）および市場APIを利用した金融市場の自動分析とレポート（以下「提供データ」）を公開しています。提供データは技術的な実証および実験を目的としており、その正確性、完全性、適時性について保証するものではありません。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                            <span className="text-indigo-500 font-mono">第3条</span> 禁止事項
                        </h2>
                        <p>ユーザーは、当サイトの利用にあたり、以下の行為をしてはなりません。</p>
                        <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-indigo-500">
                            <li>スクレイピングプログラムや自動化ツールを用いて、当サイトのコンテンツやAPIを過度に抽出または攻撃する行為</li>
                            <li>当サイトのAIシステムを利用して、意図的な市場操作を企図する行為</li>
                            <li>当サイトが提供する解析データを「投資助言業」として無断で第三者に販売・提供する行為</li>
                            <li>その他、当サイトが不適切と判断する行為</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                            <span className="text-indigo-500 font-mono">第4条</span> サービスの提供停止・中断
                        </h2>
                        <p>
                            当サイトは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなくサービスの全部または一部の提供を停止・中断することができます。
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-indigo-500">
                            <li>システムやAPIの保守点検または更新を行う場合</li>
                            <li>市場の異常な変動により、AIの推論結果が著しく不正確になる恐れがある場合</li>
                            <li>外部APIプロバイダー（Google、OpenRouter、金融データAPI）の障害が発生した場合</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                            <span className="text-indigo-500 font-mono">第5条</span> 著作権および知的財産権
                        </h2>
                        <p>
                            当サイト内のコンテンツ（レポート、データ構造、UIデザイン等）の著作権その他の知的財産権は、原則として当サイトまたは正当な権利者に帰属します。ユーザーは、個人的な利用を超える範囲での無断転載や二次配布を行うことはできません。
                        </p>
                    </section>

                    <section className="space-y-4 pt-8 border-t border-slate-800/50">
                        <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                            <span className="text-indigo-500 font-mono">第6条</span> お問い合わせ窓口
                        </h2>
                        <p>
                            本規約に関するお問い合わせは、以下のメールアドレスまでご連絡ください。
                        </p>
                        <p className="text-indigo-400 font-mono mt-2">
                            <a href="mailto:info@agent-frontier.jp" className="hover:underline">info@agent-frontier.jp</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default TermsOfService;
