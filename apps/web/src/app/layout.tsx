import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/provider/session-provider";
import Footer from "@/components/layout/footer";

export const metadata: Metadata = {
    title: "怪物彈珠平台",
    description: "探索完整的怪物彈珠圖鑑，深入了解每一隻怪物的特殊能力、屬性與戰術應用。提供詳細的怪物彈珠WIKI知識庫，與玩家共同打造最完善的遊戲資訊平台。",
    keywords: "怪物彈珠,怪物彈珠圖鑑,怪物彈珠WIKI,遊戲攻略,怪物介紹,屬性分析,戰隊搭配",
    authors: [{ name: "怪物彈珠平台" }],
    openGraph: {
        type: "website",
        locale: "zh_TW",
        url: "https://ms.imagineyuluo.com",
        title: "怪物彈珠平台｜完整圖鑑、策略分析、WIKI知識庫",
        description: "探索完整的怪物彈珠圖鑑，深入了解每一隻怪物的特殊能力、屬性與戰術應用。",
    },
    robots: "follow, index",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning={true}
        >
            <body>
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
