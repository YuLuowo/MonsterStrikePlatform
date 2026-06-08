"use client";

import { Monster } from "@/types/monster";
import Image from "next/image";

interface MonsterCardProps {
    monster: Monster[number];
}

export function MonsterCard({monster}: MonsterCardProps) {
    return (
        <div className="flex flex-col items-center gap-2">
            {monster.image_url && (
                <div className="relative w-[60px] h-[60px] shrink-0">
                    <Image
                        src={monster.image_url}
                        alt={monster.name || `Monster ${monster.number}`}
                        height={60}
                        width={60}
                        className="object-cover rounded"
                    />
                </div>
            )}

            <p className="text-xs text-center line-clamp-2 wrap-break-word leading-tight">
                {monster.name || `#${monster.number}`}
            </p>
        </div>
    );
}


