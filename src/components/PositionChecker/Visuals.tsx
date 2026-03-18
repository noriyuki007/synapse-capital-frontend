'use client';

import React from 'react';
import { 
  TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle2, XCircle, ChevronRight,
  Shield, Zap, Activity, Info, User
} from 'lucide-react';

// --------------------------------------------------------------------------
// 1. 市場警戒レベル (Market Alert Gauge)
// --------------------------------------------------------------------------
export const MarketAlertGauge = ({ level = 3 }: { level: number }) => {
  const colors = [
    'bg-emerald-500', // 1: Low Risk
    'bg-emerald-400', // 2
    'bg-amber-400',   // 3: Normal
    'bg-orange-500',  // 4
    'bg-rose-600'     // 5: High Risk
  ];

  const labels = ["低リスク", "安定", "警戒", "高リスク", "極めて危険"];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-1.5 h-12 items-end">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i}
            className={`w-6 transition-all duration-500 rounded-t-sm ${i <= level ? colors[i-1] : 'bg-slate-200'}`}
            style={{ height: `${20 + i * 15}%`, opacity: i <= level ? 1 : 0.3 }}
          />
        ))}
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-black text-royal-navy opacity-40 uppercase tracking-widest mb-1">現在のリスク状態</span>
        <span className={`text-sm font-black px-3 py-1 rounded-full text-white ${colors[level-1]}`}>
          {labels[level-1]}
        </span>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 2. センチメント・インジケーター (Sentiment Gauge)
// --------------------------------------------------------------------------
export const SentimentGauge = ({ score = 50 }: { score: number }) => {
  const rotation = (score / 100) * 180 - 90;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-[12px] border-slate-100" />
        <div 
          className="absolute top-0 left-0 w-32 h-32 rounded-full border-[12px] border-champagne-gold border-b-transparent border-l-transparent transition-transform duration-1000"
          style={{ transform: `rotate(${rotation}deg)` }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-royal-navy origin-bottom" style={{ transform: `rotate(${rotation}deg)` }} />
      </div>
      <div className="mt-2 flex flex-col items-center">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">センチメント指数</span>
        <span className="text-xl font-black text-royal-navy">{score}%</span>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 3. インテリジェンス・カード (Asset Card)
// --------------------------------------------------------------------------
export const IntelligenceCard = ({ name, price, score, signal }: { name: string, price: string, score: number, signal: string }) => {
  const isUp = signal.includes('BUY') || signal.includes('買い');
  
  return (
    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-royal-navy/5 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-xs font-black text-slate-400 mb-1">{name}</h4>
          <div className="text-2xl font-black text-royal-navy tracking-tighter">{price}</div>
        </div>
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-50" />
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
              strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * score) / 100}
              className="text-champagne-gold transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-royal-navy">{score}</div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className={`flex items-center gap-1.5 text-[10px] font-black ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {signal}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-royal-navy group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 4. メトリック・バー (Metric Bar)
// --------------------------------------------------------------------------
export const MetricBar = ({ label, value }: { label: string, value: number }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-black tracking-wider">
        <span className="text-slate-500 uppercase">{label}</span>
        <span className="text-royal-navy">{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-royal-navy transition-all duration-1000 ease-out"
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 5. テクニカル・チェックリスト (Technical Checklist)
// --------------------------------------------------------------------------
export const TechnicalChecklist = () => {
  const items = [
    { label: "RSI (過熱感なし)", status: "OK" },
    { label: "移動平均線乖離", status: "OK" },
    { label: "ボリンジャーバンド領域", status: "NG" },
    { label: "一目均衡表 (転換線)", status: "OK" }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
          <span className="text-[11px] font-bold text-slate-600">{item.label}</span>
          {item.status === "OK" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-500" />
          )}
        </div>
      ))}
    </div>
  );
};

// --------------------------------------------------------------------------
// 6. 価格レベル・マップ (Price Level Map)
// --------------------------------------------------------------------------
export const PriceLevelMap = ({ entry, target, stop }: { entry: number, target: number, stop: number }) => {
  const min = Math.min(entry, target, stop) * 0.995;
  const max = Math.max(entry, target, stop) * 1.005;
  const range = max - min;
  
  const getPos = (val: number) => ((val - min) / range) * 100;

  return (
    <div className="relative w-full h-24 mt-12 mb-16 px-4">
      <div className="absolute top-1/2 left-0 w-full h-px bg-white/10" />
      
      {/* Target */}
      <div className="absolute top-0 transition-all duration-1000 group/target" style={{ left: `${getPos(target)}%` }}>
        <div className="flex flex-col items-center -translate-x-1/2">
          <div className="w-3 h-3 bg-champagne-gold rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
          <div className="h-4 w-px bg-champagne-gold/30 my-1" />
          <span className="text-[10px] font-black text-champagne-gold uppercase tracking-widest whitespace-nowrap">利確目標</span>
          <span className="text-sm font-black text-white">{target.toFixed(2)}</span>
        </div>
      </div>

      {/* Entry */}
      <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000" style={{ left: `${getPos(entry)}%` }}>
        <div className="flex flex-col items-center -translate-x-1/2">
          <div className="w-4 h-4 border-2 border-white bg-royal-navy rounded-full z-10" />
          <span className="mt-2 text-[10px] font-black text-white/50 uppercase tracking-widest whitespace-nowrap">現在価格/点</span>
          <span className="text-sm font-black text-white">{entry.toFixed(2)}</span>
        </div>
      </div>

      {/* Stop */}
      <div className="absolute bottom-0 transition-all duration-1000 group/stop" style={{ left: `${getPos(stop)}%` }}>
        <div className="flex flex-col items-center -translate-x-1/2 translate-y-full">
          <div className="h-4 w-px bg-rose-500/30 my-1" />
          <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest whitespace-nowrap">損切り価格</span>
          <span className="text-sm font-black text-white">{stop.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 7. 専門家プロフィール (Expert Profile)
// --------------------------------------------------------------------------
export const ExpertProfile = ({ role, name, description }: { role: string, name: string, description: string }) => {
  return (
    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div className="w-10 h-10 bg-royal-navy rounded-full flex items-center justify-center flex-shrink-0">
        <User className="w-5 h-5 text-white" />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-champagne-gold uppercase tracking-widest">{role}</span>
          <h5 className="text-xs font-black text-royal-navy">{name}</h5>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </div>
  );
};
// --------------------------------------------------------------------------
// 8. レポートレンダラー (Report Renderer)
// --------------------------------------------------------------------------
export const ReportRenderer = ({ text }: { text: string }) => {
  if (!text) return null;

  // 1. Remove all ** and clean up bullets/citations
  const cleanText = text.replace(/\*\*/g, '');

  // 2. Split by lines and identify special headers
  const lines = cleanText.split('\n');

  return (
    <div className="space-y-4">
      {lines.map((line, i) => {
        let trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;

        // Remove leading bullet points for cleaner look in the custom renderer
        trimmed = trimmed.replace(/^[\*\-\+]\s+/, '');

        // Headers to highlight (Institutional Style)
        const highlights = [
          "現状分析", "戦略", "最終結論", "現状分析とリスク評価", "代替案", "総合評価",
          "推奨戦略", "合意事項（メリット・強み）", "否定・懸念事項（リスク・弱点）", "結論",
          "総合分析", "委員会内での議論", "時間軸でのアドバイス (JST)", "推奨するアクション",
          "プランの妥当性に関する最終評決", "最終評決"
        ];
        
        // Check if the line strictly constitutes one of the major headers
        // We handle both half-width (:) and full-width (：) colons
        const isHeader = highlights.some(h => 
          trimmed === h || 
          trimmed === `${h}:` || 
          trimmed === `${h}：` ||
          (trimmed.startsWith(h) && (trimmed.endsWith(':') || trimmed.endsWith('：'))) ||
          (trimmed.startsWith(h) && trimmed.length < 35 && (trimmed.includes(':') || trimmed.includes('：')))
        );

        if (isHeader) {
          return (
            <div key={i} className="pt-8 pb-4 border-y border-royal-navy/20 mb-6 mt-4 bg-slate-50/50 px-4 -mx-4 first:mt-0">
              <span className="text-royal-navy font-black text-sm uppercase tracking-widest">{trimmed}</span>
            </div>
          );
        }

        return (
          <p key={i} className="text-sm leading-relaxed text-slate-700">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
};
