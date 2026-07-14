import { PipelineContext } from "@/services";
import { prisma } from "@repo/db";
import { createAllPipelines, createPipeline, getAllPipelineNames } from "@/pipelines/registry.js";
import type { ScraperPipeline } from "@/core/scraper-pipeline.js";

/**
 * 使用方式:
 *   tsx src/index.ts            -> 執行所有已註冊的爬蟲
 *   tsx src/index.ts monster    -> 只執行 monster 爬蟲
 *   tsx src/index.ts a b c      -> 依序執行多個指定爬蟲
 */
function resolvePipelines(argv: string[]): ScraperPipeline[] {
    const names = argv.slice(2);

    if (names.length === 0) {
        return createAllPipelines();
    }

    return names.map((name) => createPipeline(name));
}

export async function main(): Promise<void> {
    let pipelines: ScraperPipeline[];

    try {
        pipelines = resolvePipelines(process.argv);
    } catch (error) {
        console.error(
            "\n❌ 無法解析要執行的爬蟲:",
            error instanceof Error ? error.message : error
        );
        console.error(`可用的爬蟲: ${getAllPipelineNames().join(", ")}`);
        process.exitCode = 1;
        return;
    }

    let hasError = false;

    try {
        for (const pipeline of pipelines) {
            const ctx = new PipelineContext();

            try {
                await pipeline.execute(ctx);
                console.log(`\n✅ [${pipeline.name}] 爬蟲執行成功`);
            } catch (error) {
                hasError = true;
                console.error(
                    `\n❌ [${pipeline.name}] 爬蟲執行失敗:`,
                    error instanceof Error ? error.message : error
                );
            }
        }

        process.exitCode = hasError ? 1 : 0;
    } finally {
        await prisma.$disconnect();
    }
}

void main();
