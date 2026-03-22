import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./../globals.css";
import Script from "next/script";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
    display: "swap",
});

const noto = Noto_Sans_JP({
    variable: "--font-noto",
    subsets: ["latin"],
    weight: ["400", "500", "700", "900"],
    display: "swap",
});

export const viewport: Viewport = {
    themeColor: "#ffffff",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    title: "Synapse Capital | AIマーケット分析・情報ターミナル",
    description: "高度なAIが常時市場を監視。透明性の高いデータと分析結果を提供する情報ターミナル。",
    icons: {
        icon: "/favicon.png",
    }
};


// export async function generateStaticParams() {
//     return [{ locale: 'en' }, { locale: 'ja' }];
// }

export default async function RootLayout(props: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const params = await props.params;
    const locale = params?.locale || 'ja';
    
    return (
        <html lang={locale}>
            <head>
                <Script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7153020075776102"
                    crossOrigin="anonymous"
                    strategy="afterInteractive"
                />
            </head>
            <body className={`${inter.variable} ${noto.variable} font-sans antialiased bg-white text-slate-900`}>
                {props.children}
            </body>
        </html>
    );
}
