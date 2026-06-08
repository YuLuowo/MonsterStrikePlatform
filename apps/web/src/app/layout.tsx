import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/provider/session-provider";
import Footer from "@/components/layout/footer";
import { Noto_Sans_TC } from "next/font/google";

const notoSansTC = Noto_Sans_TC({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "怪物彈珠平台",
    description: "探索怪物彈珠圖鑑，了解每一隻怪物的資料、屬性與被動。擁有怪物彈珠圖鑑與其他正在開發的功能。",
    keywords: "怪物彈珠,怪物彈珠圖鑑,怪物彈珠WIKI,遊戲攻略,怪物介紹,屬性分析,戰隊搭配",
    authors: [{ name: "怪物彈珠平台" }],
    openGraph: {
        type: "website",
        locale: "zh_TW",
        url: "https://ms.imagineyuluo.com",
        title: "怪物彈珠平台",
        description: "探索怪物彈珠圖鑑，了解每一隻怪物的資料、屬性與被動。擁有怪物彈珠圖鑑與其他正在開發的功能。",
        images: [
            {
                url: "https://ms.imagineyuluo.com/og.png",
                width: 1200,
                height: 630,
            },
        ],
    },
    robots: "follow, index",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning={true}
        >
            <body className={notoSansTC.className}>
                <Providers>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <Navbar />
                        {children}
                        <Footer />
                    </ThemeProvider>
                </Providers>
            </body>
        </html>
    );
}
