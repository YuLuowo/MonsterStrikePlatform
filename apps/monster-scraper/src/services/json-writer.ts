import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type { PipelineContext } from "./pipeline-context.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** 輸出的 JSON 檔案統一放在 apps/monster-scraper/output/ 底下 */
const OUTPUT_DIR = path.resolve(__dirname, "../../output");

/**
 * 將資料寫成 JSON 檔案，方便在還沒串接資料庫寫入邏輯前，先確認爬到的資料長怎樣。
 */
export async function writeJsonFile<T>(
    data: T,
    ctx: PipelineContext,
    fileName: string
): Promise<void> {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const filePath = path.join(OUTPUT_DIR, fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

    const count = Array.isArray(data) ? data.length : 1;
    ctx.log(`[JSON] 已寫入 ${count} 筆資料至 ${filePath}`);
    ctx.stats.totalProcessed += count;
}
