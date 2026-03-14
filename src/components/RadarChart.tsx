'use client';

import React from 'react';

type RadarChartProps = {
    scores: {
        cost: number;
        platform: number;
        speed: number;
        security: number;
        support: number;
    };
};

export const RadarChart = ({ scores }: RadarChartProps) => {
    const size = 300;
    const center = size / 2;
    const radius = center * 0.7;
    
    // Labels and points
    const metrics = [
        { key: 'cost', label: 'コスト', value: scores.cost },
        { key: 'platform', label: 'ツール', value: scores.platform },
        { key: 'speed', label: '約定力', value: scores.speed },
        { key: 'security', label: '安全性', value: scores.security },
        { key: 'support', label: 'サポート', value: scores.support },
    ];

    const angleStep = (Math.PI * 2) / metrics.length;

    // Calculate points for the polygon
    const points = metrics.map((m, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = (m.value / 5) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    // Background circles/hexagons
    const bgLevels = [1, 2, 3, 4, 5].map((level) => {
        const r = (level / 5) * radius;
        return metrics.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
    });

    return (
        <div className="relative w-full aspect-square max-w-[400px] mx-auto flex items-center justify-center">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-sm">
                {/* Background Grid */}
                {bgLevels.map((pts, i) => (
                    <polygon
                        key={i}
                        points={pts}
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="1"
                    />
                ))}
                
                {/* Axes */}
                {metrics.map((_, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const x = center + radius * Math.cos(angle);
                    const y = center + radius * Math.sin(angle);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={x}
                            y2={y}
                            stroke="#f1f5f9"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data Polygon */}
                <polygon
                    points={points}
                    fill="rgba(99, 102, 241, 0.05)"
                    stroke="#818cf8"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    className="animate-in fade-in zoom-in duration-1000"
                />

                {/* Data Points */}
                {metrics.map((m, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const r = (m.value / 5) * radius;
                    const x = center + r * Math.cos(angle);
                    const y = center + r * Math.sin(angle);
                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="3"
                            fill="#818cf8"
                            className="drop-shadow-sm"
                        />
                    );
                })}

                {/* Labels */}
                {metrics.map((m, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const x = center + (radius + 25) * Math.cos(angle);
                    const y = center + (radius + 20) * Math.sin(angle);
                    return (
                        <text
                            key={i}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="text-[10px] font-black fill-slate-400 uppercase tracking-tighter"
                        >
                            {m.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};
