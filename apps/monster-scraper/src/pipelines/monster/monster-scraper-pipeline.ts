import { parseMonsters, type MonsterRawData } from "@/services";
import { writeMonstersToDB, type MonsterToInsert } from "@/services";
import type { PipelineContext } from "@/services";
import { WikiAskPipeline } from "@/core/wiki-ask-pipeline.js";

const BASE_URL = "https://wiki.biligame.com/gwdz";
const TARGET_PAGE = "https://wiki.biligame.com/gwdz/%E5%BC%B9%E7%8F%A0%E5%85%A8%E5%9B%BE%E9%89%B4";
const API_URL = "https://wiki.biligame.com/gwdz/api.php";

export class MonsterScraperPipeline extends WikiAskPipeline<MonsterRawData> {
    constructor() {
        super({
            name: "monster",
            targetPage: TARGET_PAGE,
            apiUrl: API_URL,
        });
    }

    protected parseRows(html: string): MonsterRawData[] {
        return parseMonsters(html, BASE_URL);
    }

    protected getDedupeKey(row: MonsterRawData): number {
        return Number.parseInt(row.number, 10);
    }

    protected async persist(rows: MonsterRawData[], ctx: PipelineContext): Promise<void> {
        const monsters: MonsterToInsert[] = rows
            .map((m) => {
                const number = Number.parseInt(m.number, 10);
                return Number.isFinite(number) ? { ...m, number } : null;
            })
            .filter((m): m is MonsterToInsert => m !== null);

        await writeMonstersToDB(monsters, ctx);
    }
}
