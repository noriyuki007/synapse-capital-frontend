import Image from "next/image";
import Link from "next/link";

export function ArticleCard({ post }: { post: any }) {
    const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/placeholder.jpg";
    const category = post._embedded?.["wp:term"]?.[0]?.[0]?.name || "Uncategorized";

    return (
        <Link
            href={`/insights/${post.id}`}
            className="group block bg-transparent transition-all duration-200"
        >
            <div className="flex flex-col sm:flex-row px-0 py-6 gap-4 sm:gap-6 border-b border-zinc-100 group-last:border-none">
                {/* Responsive Aspect Ratio 16:9 for all images */}
                <div className="relative aspect-video w-full sm:w-48 md:w-56 rounded-none overflow-hidden flex-shrink-0 bg-zinc-50 border border-zinc-100">
                    <Image
                        src={featuredImage}
                        alt={post.title.rendered}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">
                            {category}
                        </span>
                        <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
                            {new Date(post.date).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
                        </span>
                    </div>
                    <h3
                        className="text-lg sm:text-xl font-bold leading-tight line-clamp-2 group-hover:text-zinc-950 transition-colors duration-200 tracking-tight"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                    />
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <span>続きを読む</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
