import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    weight: ["400", "500", "700", "900"],
});

export const viewport: Viewport = {
    themeColor: "#4f46e5",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    title: "AIが教えるはじめてのFX・暗号資産 | Synapse Capital",
    description: "複雑な分析はAIに任せ、あなたは「最高のタイミング」を知るだけ。Synapse Capitalの次世代意思決定エンジン。",
    icons: {
        icon: "/favicon.png",
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <body className={`${inter.variable} font-sans antialiased text-slate-900 bg-slate-50`}>
                {children}
            </body>
        </html>
    );
}
