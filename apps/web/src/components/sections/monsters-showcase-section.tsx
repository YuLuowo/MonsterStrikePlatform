"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoLoop, type LogoItem } from "@/components/LogoLoop";
import { useEffect, useState } from "react";

interface Monster {
    name: string;
    image_url: string | null;
}

export function MonstersShowcaseSection() {
    const [monsterLogos, setMonsterLogos] = useState<LogoItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMonsters = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("/api/monsters?page=1&limit=20");
                const data = await response.json();

                const logoItems: LogoItem[] = data.data
                    .filter((monster: Monster) => monster.image_url)
                    .map((monster: Monster) => ({
                        src: monster.image_url!,
                        alt: monster.name,
                    }));

                setMonsterLogos(logoItems);
            } catch (error) {
                console.error("Failed to fetch monsters:", error);
                setMonsterLogos([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMonsters();
    }, []);

    return (
        <section className="py-20 px-4 bg-muted/30">
            <div className="container max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        怪物彈珠圖鑑
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        數千隻角色，每一隻都擁有特殊的被動與屬性
                    </p>
                </div>

                <div className="relative mb-12 w-full">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="text-muted-foreground">載入中...</div>
                        </div>
                    ) : monsterLogos.length > 0 ? (
                        <LogoLoop
                            logos={monsterLogos}
                            speed={75}
                            direction="left"
                            logoHeight={70}
                            gap={32}
                            pauseOnHover={true}
                            fadeOut={true}
                            scaleOnHover={true}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-40">
                            <div className="text-muted-foreground">無法載入怪物圖片</div>
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <Link href="/monster?page=1">
                        <Button size="lg" className="gap-2">
                            <span>查看完整圖鑑</span>
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

