import { HeroSection } from "@/components/sections/hero-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { MonstersShowcaseSection } from "@/components/sections/monsters-showcase-section";

export default function HomePage() {
    return (
        <main className="flex flex-col w-full">
            <HeroSection />
            <FeaturesSection />
            <MonstersShowcaseSection />
        </main>
    );
}