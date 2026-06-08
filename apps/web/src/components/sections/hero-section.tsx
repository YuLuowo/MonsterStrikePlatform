"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { AuroraText } from "@/components/ui/aurora-text";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ShineBorder } from "@/components/ui/shine-border";

export function HeroSection() {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/15 via-blue-500/5 to-transparent blur-3xl -z-10" />

            <div className="container max-w-4xl mx-auto px-4">
                <div className="space-y-8 text-center">
                    <div className="flex flex-wrap justify-center gap-3">
                        <span className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium">
                            <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
                            <Sparkles className="w-4 h-4" />
                            <span>怪物彈珠 MonsterStrike</span>
                        </span>
                    </div>

                    <div className="space-y-4">
                        <AuroraText className="text-5xl md:text-7xl font-bold text-foreground">
                            怪物彈珠平台
                        </AuroraText>
                        <p className="text md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            探索怪物彈珠圖鑑，了解每一隻怪物的資料、屬性與被動。擁有怪物彈珠圖鑑與其他正在開發的功能。
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                        <Link href="/monster?page=1">
                            <Button size="lg" className="gap-2 text-base px-4">
                                <span>開始探索圖鑑</span>
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-8 max-w-2xl mx-auto">
                        <div className="p-4 rounded-lg bg-accent backdrop-blur-sm border border-accent">
                            <div className="text-2xl md:text-3xl font-bold text-foreground"><NumberTicker value={999}/>+</div>
                            <div className="text-xs md:text-sm text-muted-foreground">完整怪物資料</div>
                        </div>
                        <div className="p-4 rounded-lg bg-accent backdrop-blur-sm border border-accent">
                            <div className="text-2xl md:text-3xl font-bold text-foreground">每周</div>
                            <div className="text-xs md:text-sm text-muted-foreground">持續更新維護</div>
                        </div>
                        <div className="p-4 rounded-lg bg-accent backdrop-blur-sm border border-accent">
                            <div className="text-2xl md:text-3xl font-bold text-foreground">社群</div>
                            <div className="text-xs md:text-sm text-muted-foreground">協力共建</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

