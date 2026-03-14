'use client';

import React, { useState } from 'react';
import { Facebook, Linkedin, Link2, Check, Share2 } from 'lucide-react';

interface ShareButtonsProps {
    title: string;
    url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    
    // Custom X icon (X logo)
    const XIcon = () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </svg>
    );

    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;

    const shareTargets = [
        {
            name: 'X',
            icon: <XIcon />,
            color: 'bg-black text-white',
            link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`
        },
        {
            name: 'Facebook',
            icon: <Facebook className="w-5 h-5" />,
            color: 'bg-[#1877F2] text-white',
            link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`
        },
        {
            name: 'LinkedIn',
            icon: <Linkedin className="w-5 h-5" />,
            color: 'bg-[#0A66C2] text-white',
            link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`
        }
    ];

    const copyToClipboard = () => {
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-6 py-12 border-t border-slate-100">
            <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-slate-400" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">このレポートをシェアする</h3>
            </div>
            <div className="flex flex-wrap gap-4">
                {shareTargets.map((target) => (
                    <a
                        key={target.name}
                        href={target.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200 ${target.color}`}
                    >
                        {target.icon}
                        <span>{target.name}</span>
                    </a>
                ))}
                
                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-3 px-6 py-3 rounded-full font-bold text-sm bg-white border border-slate-200 text-slate-900 transition-all hover:bg-slate-50 hover:scale-105 active:scale-95 shadow-lg shadow-slate-100"
                >
                    {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Link2 className="w-5 h-5 text-slate-400" />}
                    <span>{copied ? 'コピーされました' : 'リンクをコピー'}</span>
                </button>
            </div>
        </div>
    );
}
