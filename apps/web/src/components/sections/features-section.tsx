"use client";

import { 
    BookOpen,
    Search,
    Shield,
    Zap
} from "lucide-react";
import { NeonGradientCard } from "@/components/ui/neon-gradient-card";

const features = [
    {
        icon: BookOpen,
        title: "完整圖鑑",
        description: "收錄所有怪物詳細資料，包含屬性、被動等完整資訊",
    },
    {
        icon: Search,
        title: "進階篩選",
        description: "按屬性、被動等篩選，快速找到所需怪物",
    },
    {
        icon: Zap,
        title: "快速查詢",
        description: "強大的搜尋功能，一秒找到對應關卡陷阱的怪物",
    },
    {
        icon: Shield,
        title: "每周更新",
        description: "持續更新遊戲最新內容，確保資訊始終準確無誤",
    },
];

export function FeaturesSection() {
    return (
        <section className="min-h-screen flex items-center px-4 py-20">
            <div className="container max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        平台功能介紹
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        完整的怪物彈珠資訊平台，提供一切你需要的遊戲資訊與實用工具
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <NeonGradientCard key={index} className="group hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 border rounded-lg bg-accent transition-colors">
                                        <Icon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                                    </div>
                                </div>
                                <span className="text-xl">{feature.title}</span>
                                <div className="text-muted-foreground text-sm mt-2">
                                    <span className="text-base">{feature.description}</span>
                                </div>
                            </NeonGradientCard>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

