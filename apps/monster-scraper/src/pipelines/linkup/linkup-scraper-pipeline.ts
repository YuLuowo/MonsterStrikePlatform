import { parseLinkups, type LinkupRawData } from "@/services";
import { writeJsonFile } from "@/services";
import type { PipelineContext } from "@/services";
import { WikiAskPipeline } from "@/core/wiki-ask-pipeline.js";

const BASE_URL = "https://wiki.biligame.com/gwdz";
const TARGET_PAGE = "https://wiki.biligame.com/gwdz/%E8%81%94%E5%8A%A8%E4%B8%80%E8%A7%88";
const API_URL = "https://wiki.biligame.com/gwdz/api.php";

/**
 * 「联动一览」爬蟲。
 * 目前先把結果輸出成 JSON 檔案（output/linkups.json），方便先確認資料格式，
 * 之後若要正式寫入資料庫，只需把 persist() 改成呼叫對應的 db-writer。
 */
export class LinkupScraperPipeline extends WikiAskPipeline<LinkupRawData> {
    constructor() {
        super({
            name: "linkup",
            targetPage: TARGET_PAGE,
            apiUrl: API_URL,
        });
    }

    protected parseRows(html: string): LinkupRawData[] {
        return parseLinkups(html, BASE_URL);
    }

    protected getDedupeKey(row: LinkupRawData): string {
        return row.url ?? row.name ?? `${row.time}`;
    }

    protected async persist(rows: LinkupRawData[], ctx: PipelineContext): Promise<void> {
        await writeJsonFile(rows, ctx, "linkups.json");
    }
}
