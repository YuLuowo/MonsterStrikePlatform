import type { ScraperPipeline } from "@/core/scraper-pipeline.js";
import { MonsterScraperPipeline } from "./monster/monster-scraper-pipeline.js";
import { LinkupScraperPipeline } from "./linkup/linkup-scraper-pipeline.js";

/**
 * 爬蟲註冊表。
 *
 * 未來要新增一個新的爬蟲（例如 wiki 上的另一個頁面），只需：
 * 1. 在 `src/pipelines/<新爬蟲>/` 底下建立一個實作 `WikiAskPipeline`
 *    （或直接實作 `ScraperPipeline`）的類別。
 * 2. 在下面的 `pipelineFactories` 加上一行 `<name>: () => new XxxPipeline()`。
 *
 * 不需要修改 index.ts 或其他既有爬蟲的程式碼。
 */
export const pipelineFactories: Record<string, () => ScraperPipeline> = {
    monster: () => new MonsterScraperPipeline(),
    linkup: () => new LinkupScraperPipeline(),
};

export function getAllPipelineNames(): string[] {
    return Object.keys(pipelineFactories);
}

export function createPipeline(name: string): ScraperPipeline {
    const factory = pipelineFactories[name];
    if (!factory) {
        throw new Error(
            `找不到名為 "${name}" 的爬蟲，可用的爬蟲: ${getAllPipelineNames().join(", ")}`
        );
    }
    return factory();
}

export function createAllPipelines(): ScraperPipeline[] {
    return getAllPipelineNames().map((name) => createPipeline(name));
}
