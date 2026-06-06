import type { PipelineContext } from "./pipeline-context.js";
import 'dotenv/config';
import { prisma } from "@repo/db";

export interface MonsterToInsert {
    number: number;
    name: string | null;
    element: string | null;
    image_url: string | null;
    source_url: string | null;
}

const BATCH_SIZE = 500;

type NameConverter = (text: string) => Promise<string>;
let converterPromise: Promise<NameConverter> | null = null;

async function getTraditionalConverter(ctx: PipelineContext): Promise<NameConverter> {
    if (converterPromise) {
        return converterPromise;
    }

    converterPromise = (async () => {
        try {
            const openccModule = await import("opencc");
            const OpenCC = (openccModule.default || openccModule) as unknown as new (
                config?: string
            ) => {
                convertPromise?: (text: string) => Promise<string>;
                convertSync?: (text: string) => string;
            };

            const converter = new OpenCC("s2t.json");
            ctx.log("[DB] 已啟用 OpenCC，將名稱轉為繁體中文");

            if (typeof converter.convertPromise === "function") {
                return async (text: string) => (text ? converter.convertPromise!(text) : text);
            }

            if (typeof converter.convertSync === "function") {
                return async (text: string) => (text ? converter.convertSync!(text) : text);
            }

            ctx.log("[DB] OpenCC 不支援可用轉換方法，將保留原始名稱");
            return async (text: string) => text;
        } catch {
            ctx.log("[DB] 未載入 OpenCC，將保留原始名稱");
            return async (text: string) => text;
        }
    })();

    return converterPromise;
}

export async function writeMonstersToDB(
    monsters: MonsterToInsert[],
    ctx: PipelineContext
): Promise<void> {
    try {
        const uniqueMonsters = Array.from(
            new Map(monsters.map((monster) => [monster.number, monster])).values()
        );

        if (uniqueMonsters.length !== monsters.length) {
            ctx.log(`[DB] 發現重複 number，去重: ${monsters.length} -> ${uniqueMonsters.length}`);
        }

        const convertName = await getTraditionalConverter(ctx);

        ctx.log("[DB] 清空舊數據...");
        const deleted = await prisma.monsters.deleteMany();
        ctx.log(`[DB] 已刪除 ${deleted.count} 條舊記錄`);

        ctx.log(`[DB] 開始寫入 ${uniqueMonsters.length} 條新記錄...`);

        for (let i = 0; i < uniqueMonsters.length; i += BATCH_SIZE) {
            const batch = uniqueMonsters.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(uniqueMonsters.length / BATCH_SIZE);

            ctx.log(`[DB] 正在寫入第 ${batchNum}/${totalBatches} 批 (${batch.length} 條)`);

            const translatedBatch = await Promise.all(
                batch.map(async (m) => ({
                    number: m.number,
                    name: m.name ? await convertName(m.name) : "",
                    element: m.element || "",
                    image_url: m.image_url || "",
                    source_url: m.source_url || "",
                }))
            );

            await prisma.monsters.createMany({
                data: translatedBatch,
                skipDuplicates: true,
            });

            ctx.stats.totalProcessed += batch.length;
        }

        ctx.log(`[DB] 成功寫入 ${uniqueMonsters.length} 條記錄`);
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        ctx.error(`[DB] 寫入失敗: ${errorMsg}`);
        ctx.stats.totalErrors++;
        throw error;
    }
}

