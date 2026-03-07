import Image from "next/image";
import Link from "next/link";

interface OgpCardProps {
    url: string;
    title: string;
    description: string;
    imageUrl?: string;
    domain: string;
}

export function OgpCard({ url, title, description, imageUrl, domain }: OgpCardProps) {
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block my-8 group overflow-hidden border border-zinc-200 bg-white hover:border-brand-accent transition-colors duration-300 shadow-sm">
            <div className="flex flex-col sm:flex-row h-auto sm:h-32">
                <div className="flex-1 p-5 flex flex-col justify-center space-y-2">
                    <h4 className="text-sm font-bold text-zinc-900 line-clamp-1 group-hover:text-brand-accent transition-colors leading-tight">{title}</h4>
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{description}</p>
                    <div className="flex items-center gap-2 pt-1 text-[10px] uppercase font-black text-brand-accent tracking-widest">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1  1.1" />
                        </svg>
                        <span>{domain}</span>
                    </div>
                </div>
                {imageUrl && (
                    <div className="relative w-full sm:w-48 h-40 sm:h-full bg-zinc-100 flex-shrink-0 border-t sm:border-t-0 sm:border-l border-zinc-100 hidden sm:block">
                        <Image src={imageUrl} alt={title} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                )}
            </div>
        </a>
    );
}
