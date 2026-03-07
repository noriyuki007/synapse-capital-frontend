"use client";

import { useEffect, useState } from "react";

export function ProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const currentScrollY = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollHeight > 0) {
                setProgress((currentScrollY / scrollHeight) * 100);
            }
        };

        window.addEventListener("scroll", updateProgress, { passive: true });
        updateProgress();

        return () => window.removeEventListener("scroll", updateProgress);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-[3px] z-[70] bg-zinc-100 pointer-events-none">
            <div
                className="h-full bg-brand-accent transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
