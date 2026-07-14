import { HttpClient } from "@/services";
import { buildConditions, parseCount, parseWikiConfig, type WikiConfig } from "@/services";
import type { PipelineContext } from "@/services";
import type { ScraperPipeline } from "./scraper-pipeline.js";

export interface WikiAskPipelineOptions {
    /** Pipeline 名稱，用於 CLI 選擇/日誌輸出 */
    name: string;
    /** 要爬取的目標頁面（含 #ask 查詢表格的頁面） */
    targetPage: string;
    /** 該 Wiki 的 api.php 完整網址 */
    apiUrl: string;
}

/**
 * 通用的「MediaWiki + Semantic MediaWiki #ask 分頁查詢」爬蟲流程基底類別。
 *
 * 這類 Wiki（例如 biligame 的各個遊戲 wiki）通常都是：
 * 1. 目標頁面內嵌 JS 變數描述查詢用的 tableHeader / printColumn / parameters
 * 2. 透過 api.php 的 action=parse 執行 {{#ask:...}} 查詢文字，取得渲染後的表格 HTML
 * 3. 先查詢總數，再依 limit 分頁抓取所有資料
 *
 * 未來若要新增其他頁面/wiki 的爬蟲，只需繼承此類別並實作：
 * - parseRows(html): 把某一頁的表格 HTML 解析成原始資料陣列
 * - getDedupeKey(row): 用什麼欄位作為去重的唯一鍵
 * - persist(rows, ctx): 把去重後的資料寫入資料庫
 *
 * 共用流程（抓主頁面、解析 config、查詢總數、分頁抓取、去重）皆已在此實作，
 * 不需要每個 Pipeline 重複撰寫。
 */
export abstract class WikiAskPipeline<TRow> implements ScraperPipeline {
    readonly name: string;
    protected readonly httpClient: HttpClient;
    protected readonly options: WikiAskPipelineOptions;

    constructor(options: WikiAskPipelineOptions, httpClient: HttpClient = new HttpClient()) {
        this.name = options.name;
        this.options = options;
        this.httpClient = httpClient;
    }

    /** 將某一頁的表格 HTML 解析成原始資料 */
    protected abstract parseRows(html: string): TRow[];

    /** 用哪個欄位作為去重的唯一鍵 */
    protected abstract getDedupeKey(row: TRow): string | number;

    /** 將去重後的資料寫入資料庫 */
    protected abstract persist(rows: TRow[], ctx: PipelineContext): Promise<void>;

    async execute(ctx: PipelineContext): Promise<void> {
        ctx.log(`========== [${this.name}] 爬蟲 Pipeline 開始 ==========`);

        try {
            ctx.log("[1/5] 拉取主頁面...");
            const pageHtml = await this.httpClient.get(this.options.targetPage, {
                referer: this.options.targetPage,
            });

            await this.delay(1000);

            ctx.log("[2/5] 解析 Wiki 配置...");
            const config = parseWikiConfig(pageHtml);
            const conditions = buildConditions(pageHtml);

            ctx.log(
                `[config] limit=${config.limit}, conditions=${conditions.substring(0, 50)}...`
            );

            await this.delay(500);

            ctx.log("[3/5] 查詢總記錄數...");
            const total = await this.queryCount(conditions);
            const pages = Math.ceil(total / config.limit);

            ctx.log(`[count] 總記錄數: ${total}, 總頁數: ${pages}`);
            ctx.stats.totalFetched = total;

            ctx.log(`[4/5] 開始分頁拉取 (${pages} 頁)...`);
            const rows = await this.fetchAllPages(config, conditions, pages, ctx);

            ctx.log(`[parsed] 提取資料數: ${rows.length}`);

            ctx.log("[5/5] 寫入數據庫...");
            await this.persist(rows, ctx);

            ctx.log(`========== [${this.name}] 爬蟲 Pipeline 完成 ==========`);
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

    protected delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private async queryCount(conditions: string): Promise<number> {
        await this.delay(2000);

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

        const url = `${this.options.apiUrl}?${params.toString()}`;
        const data = await this.httpClient.getJson<any>(url, {
            referer: this.options.targetPage,
            timeout: 60000,
        });

        return data.parse?.text?.["*"] || "";
    }

    private async fetchAllPages(
        config: WikiConfig,
        conditions: string,
        pages: number,
        ctx: PipelineContext
    ): Promise<TRow[]> {
        const allRows: TRow[] = [];

        for (let page = 1; page <= pages; page++) {
            if (page > 1) {
                const delay = 1000 + Math.random() * 1000;
                await this.delay(delay);
            }

            ctx.log(`[fetch] 正在拉取第 ${page}/${pages} 頁...`);

            const html = await this.fetchPage(config, conditions, page);
            const pageRows = this.parseRows(html);

            ctx.log(`[fetch] 第 ${page} 頁: 提取 ${pageRows.length} 條`);

            allRows.push(...pageRows);
        }

        const uniqueMap = new Map<string | number, TRow>();
        for (const row of allRows) {
            uniqueMap.set(this.getDedupeKey(row), row);
        }

        ctx.log(`[dedupe] 原始 ${allRows.length} 條, 去重後 ${uniqueMap.size} 條`);

        return Array.from(uniqueMap.values());
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
