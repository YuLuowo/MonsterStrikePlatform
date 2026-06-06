import { MonsterScraperPipeline } from "./pipelines/monster/monster-scraper-pipeline.js";
import { PipelineContext } from "@/services";
import { prisma } from "@repo/db";

export async function main(): Promise<void> {
    const ctx = new PipelineContext();
    const pipeline = new MonsterScraperPipeline();

    try {
        await pipeline.execute(ctx);
        console.log("\n✅ 爬蟲執行成功");
        process.exitCode = 0;
    } catch (error) {
        console.error(
            "\n❌ 爬蟲執行失敗:",
            error instanceof Error ? error.message : error
        );
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

void main();

