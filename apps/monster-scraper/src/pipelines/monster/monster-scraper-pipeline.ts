import { HttpClient } from "@/services";
import {
    buildConditions,
    parseCount,
    parseMonsters,
    parseWikiConfig,
    type MonsterRawData,
    type WikiConfig,
} from "@/services";
import { writeMonstersToDB, type MonsterToInsert } from "@/services";
import { PipelineContext } from "@/services";

const TARGET_PAGE = "https://wiki.biligame.com/gwdz/%E5%BC%B9%E7%8F%A0%E5%85%A8%E5%9B%BE%E9%89%B4";
const API_URL = "https://wiki.biligame.com/gwdz/api.php";

export class MonsterScraperPipeline {
    private httpClient: HttpClient;

    constructor() {
        this.httpClient = new HttpClient();
    }

    async execute(ctx: PipelineContext): Promise<void> {
        ctx.log("========== 怪物爬蟲 Pipeline 開始 ==========");

        try {
            ctx.log("[1/5] 拉取主頁面...");
            const pageHtml = await this.httpClient.get(TARGET_PAGE, {
                referer: TARGET_PAGE,
            });

            await new Promise((resolve) => setTimeout(resolve, 1000));

            ctx.log("[2/5] 解析 Wiki 配置...");
            const config = parseWikiConfig(pageHtml);
            const conditions = buildConditions(pageHtml);

            ctx.log(
                `[config] limit=${config.limit}, conditions=${conditions.substring(0, 50)}...`
            );

            await new Promise((resolve) => setTimeout(resolve, 500));

            ctx.log("[3/5] 查詢總記錄數...");
            const total = await this.queryCount(conditions);
            const pages = Math.ceil(total / config.limit);

            ctx.log(`[count] 總記錄數: ${total}, 總頁數: ${pages}`);
            ctx.stats.totalFetched = total;

            ctx.log(`[4/5] 開始分頁拉取 (${pages} 頁)...`);
            const monsters = await this.fetchAllPages(config, conditions, pages, ctx);

            ctx.log(`[parsed] 提取怪物數: ${monsters.length}`);

            ctx.log("[5/5] 寫入數據庫...");
            await writeMonstersToDB(monsters, ctx);

            ctx.log("========== 怪物爬蟲 Pipeline 完成 ==========");
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            ctx.error(`Pipeline 執行失敗: ${errorMsg}`);
            ctx.stats.totalErrors++;
            throw error;
        } finally {
            ctx.finish();
            ctx.printStats();
        }
    }

    private async queryCount(conditions: string): Promise<number> {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const text = `{{#ask:${conditions}|format=count}}`;
        const html = await this.queryParse(text);
        return parseCount(html);
    }

    private async queryParse(text: string): Promise<string> {
        const params = new URLSearchParams({
            format: "json",
            action: "parse",
            text,
            contentmodel: "wikitext",
        });

        const url = `${API_URL}?${params.toString()}`;
        const data = await this.httpClient.getJson<any>(url, {
            referer: TARGET_PAGE,
            timeout: 60000,
        });

        return data.parse?.text?.["*"] || "";
    }

    private async fetchAllPages(
        config: WikiConfig,
        conditions: string,
        pages: number,
        ctx: PipelineContext
    ): Promise<{
        number: number;
        name: string | null;
        image_url: string | null;
        source_url: string | null;
        element: string | null;
        type: string | null;
        evolution: string | null;
        obtain_method: string | null;
        star: number | null;
        category: string | null;
        info: string[];
        passive: string[];
        abilities: string[];
        ss: string | null
    }[]> {
        const allMonsters: MonsterRawData[] = [];

        for (let page = 1; page <= pages; page++) {
            if (page > 1) {
                const delay = 1000 + Math.random() * 1000;
                await new Promise((resolve) => setTimeout(resolve, delay));
            }

            ctx.log(`[fetch] 正在拉取第 ${page}/${pages} 頁...`);

            const html = await this.fetchPage(config, conditions, page);
            const pageMonsters = parseMonsters(html);

            ctx.log(`[fetch] 第 ${page} 頁: 提取 ${pageMonsters.length} 條`);

            allMonsters.push(...pageMonsters);
        }

        const uniqueMap = new Map<number, MonsterRawData>();

        for (const monster of allMonsters) {
            const parsedNumber = Number.parseInt(monster.number, 10);
            if (!Number.isFinite(parsedNumber)) {
                continue;
            }

            uniqueMap.set(parsedNumber, {
                ...monster,
                number: String(parsedNumber),
            });
        }

        ctx.log(`[dedupe] 原始 ${allMonsters.length} 條, 去重後 ${uniqueMap.size} 條`);

        return Array.from(uniqueMap.entries()).map(([number, m]) => ({
            number,
            name: m.name,
            image_url: m.image_url,
            source_url: m.source_url,
            element: m.element,
            type: m.type,
            evolution: m.evolution,
            obtain_method: m.obtain_method,
            star: m.star,
            category: m.category,
            info: m.info,
            passive: m.passive,
            abilities: m.abilities,
            ss: m.ss,
        }));
    }

    private async fetchPage(
        config: WikiConfig,
        conditions: string,
        page: number
    ): Promise<string> {
        const offset = (page - 1) * config.limit;
        const parametersTemp = `${config.parameters}|limit=${config.limit}|offset=${offset}`;

        const queryText =
            `${config.tableHeader}` +
            `{{#ask:${conditions}${config.printColumn}${parametersTemp}}}` +
            `${config.tableFooter}`;

        return await this.queryParse(queryText);
    }
}

