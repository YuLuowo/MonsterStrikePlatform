import type { PipelineContext } from "@/services";

/**
 * 所有爬蟲 Pipeline 都必須實現的介面。
 * 未來新增其他網站的爬蟲，只需實作這個介面並在 pipelines/registry.ts 中註冊即可。
 */
export interface ScraperPipeline {
    /** Pipeline 的唯一識別名稱，用於 CLI 選擇要執行哪個爬蟲 */
    readonly name: string;

    execute(ctx: PipelineContext): Promise<void>;
}
