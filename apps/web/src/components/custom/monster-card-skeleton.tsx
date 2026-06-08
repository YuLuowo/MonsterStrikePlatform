"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function MonsterCardSkeleton() {
    return (
        <div className="flex flex-col items-center gap-2">
            <Skeleton className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded shrink-0"/>
            <Skeleton className="w-full h-4 md:h-5"/>
        </div>
    );
}

