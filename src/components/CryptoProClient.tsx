'use client';

import React from 'react';
import { Activity, Globe, AlertCircle, Zap, TrendingUp, Bitcoin, BarChart3, Users } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Modal } from '@/components/Modal';

/**
 * Shared Pro Ticker
 */
const ProTicker = () => {
    const items = [
        { label: "BTC/USDT", val: "51,200.00", chg: "+1.20%", up: true },
        { label: "ETH/USDT", val: "2,848.68", chg: "+0.85%", up: true },
        { label: "SOL/USDT", val: "105.45", chg: "-0.45%", up: false },
        { label: "XRP/USDT", val: "0.5432", chg: "-0.12%", up: false },
        { label: "ADA/USDT", val: "0.4851", chg: "+2.11%", up: true },
        { label: "BNB/USDT", val: "352.12", chg: "+0.15%", up: true },
        { label: "AVAX/USDT", val: "38.92", chg: "-0.90%", up: false },
        { label: "MATIC/USDT", val: "1.0432", chg: "+0.12%", up: true },
    ];
    return (
        <div className="w-full bg-slate-50 border-b border-slate-100 py-1.5 overflow-hidden sticky top-[57px] z-[40] backdrop-blur-sm">
            <div className="flex animate-ticker whitespace-nowrap">
                {[...items, ...items].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 text-[11px] font-bold tracking-tighter">
                        <span className="text-slate-400 uppercase">{item.label}</span>
                        <span className="text-slate-900 tabular-nums">{item.val}</span>
                        <span className={item.up ? "text-emerald-500" : "text-rose-500"}>{item.chg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function CryptoProClient({ locale, dict }: { locale: string, dict: any }) {
    const assets = [
        { label: "BTC/USD", status: 'status_in_progress', sync: 100, levels: [true, true, true, true], consistency: 'cons_low' },
        { label: "ETH/USD", status: 'status_stable', sync: 80, levels: [true, true, false, true], consistency: 'cons_low' },
        { label: "SOL/USD", status: 'status_in_progress', sync: 45, levels: [false, true, null, true], consistency: 'cons_mid' },
        { label: "XRP/USD", status: 'status_divergent', sync: 15, levels: [false, false, false, false], consistency: 'cons_high' },
        { label: "ADA/USD", status: 'status_stable', sync: 55, levels: [true, false, true, false], consistency: 'cons_mid' },
        { label: "DOT/USD", status: 'status_stable', sync: 30, levels: [false, null, null, true], consistency: 'cons_high' },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-amber-100 selection:text-amber-900">
            <Header locale={locale} dict={dict} />
            <ProTicker />

            <main className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-slate-100 bg-white min-h-screen shadow-sm">
                
                <div className="lg:col-span-8 p-6 md:p-12 lg:p-16 space-y-20 border-r border-slate-100">
                    
                    <div className="space-y-8 max-w-2xl">
                        <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-none text-[12px] font-black text-slate-500 uppercase tracking-widest">
                            {dict.crypto_pro.hero_badge}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none font-sans uppercase whitespace-nowrap">
                            {dict.crypto_pro.hero_title}
                        </h1>
                        <p className="text-base font-medium text-slate-500 max-w-xl leading-relaxed uppercase border-l-2 border-slate-100 pl-8">
                            {dict.crypto_pro.hero_desc}
                        </p>
                    </div>

                    <section className="space-y-10 pt-16 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[13px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-slate-900 leading-none">
                                <Bitcoin className="w-4 h-4 text-amber-500" />
                                {dict.crypto_pro.terminal_title}
                            </h2>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{dict.crypto_pro.onchain_synced}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assets.map((asset, i) => (
                                <CryptoCard key={i} {...asset} dict={dict} />
                            ))}
                        </div>
                    </section>

                    <section className="space-y-10 pt-16 border-t border-slate-100">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <span className="w-4 h-px bg-slate-900" />
                            {dict.crypto_pro.advanced_analysis_layer}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-50 p-8 rounded-none space-y-4 shadow-sm border border-slate-100">
                                <div className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">{dict.crypto_pro.market_inter_sync}</div>
                                <h4 className="text-lg font-black tracking-tight text-slate-900 font-sans uppercase">{dict.crypto_pro.btc_vs_us10y_title}</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase">
                                    {dict.crypto_pro.btc_vs_us10y_desc}
                                </p>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-none space-y-4 shadow-sm border border-slate-100">
                                <div className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">{dict.crypto_pro.onchain_pulse}</div>
                                <h4 className="text-lg font-black tracking-tight text-slate-900 font-sans uppercase">{dict.crypto_pro.whale_accumulation_title}</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase">
                                    {dict.crypto_pro.whale_accumulation_desc}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-12 pt-16 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                    <BarChart3 className="w-4 h-4 text-amber-500" />
                                    {dict.crypto_pro.liquidity_depth}
                                </h3>
                                <div className="p-8 bg-slate-50 border border-slate-100 rounded-none space-y-6">
                                    <div className="flex flex-col gap-4">
                                        {[
                                            { range: dict.crypto_pro.depth_range.replace('{range}', '+2%'), bid: "$42.5M", ask: "$38.2M" },
                                            { range: dict.crypto_pro.depth_range.replace('{range}', '+1%'), bid: "$18.2M", ask: "$15.9M" },
                                        ].map((depth, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="text-[11px] font-black text-slate-400 uppercase">{depth.range}</div>
                                                <div className="grid grid-cols-2 gap-1 bg-white p-2 border border-slate-100">
                                                    <div className="text-center">
                                                        <div className="text-[11px] font-black text-emerald-500 uppercase">{dict.crypto_pro.bid_side}</div>
                                                        <div className="text-xs font-black text-slate-900">{depth.bid}</div>
                                                    </div>
                                                    <div className="text-center border-l border-slate-50">
                                                        <div className="text-[11px] font-black text-rose-500 uppercase">{dict.crypto_pro.ask_side}</div>
                                                        <div className="text-xs font-black text-slate-900">{depth.ask}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase">
                                        {dict.crypto_pro.liquidity_desc}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                    <Activity className="w-4 h-4 text-amber-500" />
                                    {dict.crypto_pro.node_network_pulse}
                                </h3>
                                <div className="p-8 bg-white border border-slate-100 rounded-none space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <div className="text-[11px] font-black text-slate-300 uppercase">{dict.crypto_pro.network_load}</div>
                                            <div className="text-xl font-black text-slate-900 tabular-nums uppercase">{dict.crypto_pro.network_stable}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[11px] font-black text-slate-300 uppercase">{dict.crypto_pro.avg_gas_price}</div>
                                            <div className="text-xl font-black text-slate-900 tabular-nums uppercase">12 Gwei</div>
                                        </div>
                                    </div>
                                    <div className="h-20 flex items-center gap-1">
                                        {[40, 20, 60, 30, 80, 50, 90, 40, 70].map((v, i) => (
                                            <div key={i} className="flex-1 bg-amber-100 rounded-none" style={{ height: `${v}%` }} />
                                        ))}
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase">
                                        {dict.crypto_pro.node_desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-10 pt-16 border-t border-slate-100">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-slate-900 leading-none">
                            <Users className="w-4 h-4 text-slate-400" />
                            {dict.crypto_pro.whale_tracking}
                        </h2>
                        <div className="space-y-4">
                            {[
                                { address: "0x7a2...fE1", amount: "1,200 BTC", type: 'whale_type_outflow', target: 'whale_target_cold' },
                                { address: "bc1q...x9v", amount: "50,000 ETH", type: 'whale_type_inflow', target: "Binance" },
                                { address: "0x98f...21c", amount: "5,000,000 SOL", type: 'whale_type_staking', target: 'whale_target_protocol' },
                            ].map((whale, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-none relative overflow-hidden">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-1 h-8 ${whale.type === 'whale_type_inflow' ? 'bg-rose-500' : whale.type === 'whale_type_outflow' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                                        <div className="space-y-1">
                                            <div className="text-[12px] font-black text-slate-900 uppercase font-sans">{whale.amount}</div>
                                            <div className="text-[10px] font-bold text-slate-400 font-mono">{whale.address}</div>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <div className={`text-[11px] font-black uppercase tracking-widest ${whale.type === 'whale_type_inflow' ? 'text-rose-500' : whale.type === 'whale_type_outflow' ? 'text-emerald-500' : 'text-indigo-500'}`}>{dict.crypto_pro[whale.type]}</div>
                                        <div className="text-[11px] font-bold text-slate-400 uppercase">→ {whale.target.startsWith('whale_') ? dict.crypto_pro[whale.target] : whale.target}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[11px] font-bold text-slate-300 leading-relaxed uppercase">
                            {dict.crypto_pro.whale_desc}
                        </p>
                    </section>
                </div>

                <div className="lg:col-span-4 p-6 md:p-10 border-none bg-white">
                    <Sidebar 
                        locale={locale}
                        dict={dict}
                        latestReports={[]} 
                        stats={{ winRate: 100, total: 242 }} 
                    />
                </div>
            </main>

            <Footer locale={locale} dict={dict} />
        </div>
    );
}

const CryptoCard = ({ label, status, sync, levels, consistency, dict }: any) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    return (
        <div className="bg-white border border-slate-100 rounded-none p-6 space-y-6 shadow-sm hover:shadow-xl hover:border-amber-100 transition-all cursor-crosshair group">
            <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900 tracking-tighter uppercase font-sans">{label}</span>
                <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-none tracking-widest uppercase border ${
                    status === 'status_divergent' || status === 'status_in_progress' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                    status === 'status_syncing' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' :
                    'bg-slate-50 border-slate-100 text-slate-400'
                }`}>
                    {dict.pro[status]}
                </span>
            </div>

            <div className="grid grid-cols-4 gap-1">
                {['15M', '1H', '4H', '1D'].map((tf, i) => {
                    const dir = levels[i];
                    return (
                        <div key={tf} className="bg-slate-50 p-2 rounded-none border border-slate-100 flex flex-col items-center gap-1.5">
                            <div className="text-[12px] font-black text-slate-300 tracking-tighter uppercase">{tf}</div>
                            {dir === true && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                            {dir === false && <TrendingUp className="w-4 h-4 text-rose-500 rotate-180" />}
                            {dir === null && <Activity className="w-4 h-4 text-slate-200" />}
                        </div>
                    );
                })}
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tighter">
                    <span className="text-slate-400">{dict.pro.sync_rate}</span>
                    <span className="text-amber-500">{sync}%</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-none overflow-hidden">
                    <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${sync}%` }} />
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">{dict.pro.consistency_alert.replace('{level}', dict.pro[consistency])}</span>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-[11px] font-black text-amber-500 uppercase tracking-widest hover:underline transition-all"
                >
                    {dict.pro.view_details}
                </button>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={dict.crypto_pro.modal_crypto_deep.replace('{pair}', label)}
            >
                <div className="space-y-8">
                    <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100">
                        <div className="space-y-1">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{dict.pro.current_status}</div>
                            <div className="text-xl font-black text-slate-900">{dict.pro[status]}</div>
                        </div>
                        <div className="text-right space-y-1">
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{dict.crypto_pro.market_consistency}</div>
                            <div className="text-xl font-black text-amber-500">{dict.pro[consistency]}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-200 pb-2">{dict.crypto_pro.onchain_liquidity_matrix}</div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white border border-slate-100 space-y-2">
                                <div className="text-[10px] font-black text-slate-400 uppercase">{dict.pro.sync_rate}</div>
                                <div className="text-lg font-black text-slate-900 tabular-nums">{sync}%</div>
                                <div className="w-full h-1 bg-slate-50">
                                    <div className="h-full bg-amber-500" style={{ width: `${sync}%` }} />
                                </div>
                            </div>
                            <div className="p-4 bg-white border border-slate-100 space-y-2">
                                <div className="text-[10px] font-black text-slate-400 uppercase">{dict.crypto_pro.volatility}</div>
                                <div className="text-lg font-black text-slate-900 uppercase">{sync > 80 ? dict.crypto_pro.vola_stable : dict.crypto_pro.vola_active}</div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`h-1 flex-1 ${i <= (sync > 80 ? 4 : 2) ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border border-slate-100 space-y-4">
                        <div className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{dict.crypto_pro.ai_onchain_diagnosis}</div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {dict.crypto_pro.onchain_diagnosis_text.replace('{pair}', label).replace('{sync}', sync.toString()).replace('{detail}', dict.crypto_pro[consistency === 'cons_high' ? 'onchain_high' : 'onchain_low'])}
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
