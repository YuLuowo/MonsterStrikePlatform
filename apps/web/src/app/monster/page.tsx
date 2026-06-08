import { Suspense } from "react";
import { AllMonstersSection } from "@/components/sections/all-monsters-section";
import { MonsterCardSkeleton } from "@/components/custom/monster-card-skeleton";

function SkeletonFallback() {
    return (
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
            {Array.from({length: 100}).map((_, idx) => (
                <MonsterCardSkeleton key={idx}/>
            ))}
        </div>
    );
}

export default function MonsterPage() {
    return (
        <main className="min-h-screen pt-[60px] bg-gradient-to-b from-background to-muted/20">
            <div className="w-full max-w-6xl mx-auto py-8">
                <Suspense fallback={<SkeletonFallback/>}>
                    <AllMonstersSection/>
                </Suspense>
            </div>
        </main>
    );
}

