'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ease-out"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white border border-slate-100 shadow-2xl rounded-none overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-50">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-900 transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};
