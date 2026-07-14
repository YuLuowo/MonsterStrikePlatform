# monster-scraper

用來爬取 Wiki 資料並寫入資料庫的爬蟲工具。架構已重構為「可插拔 Pipeline」模式，方便未來新增其他頁面/網站的爬蟲。

## 執行

```bash
# 執行所有已註冊的爬蟲
pnpm scraper

# 只執行指定的爬蟲
pnpm scraper:monsters
# 等同於
tsx src/index.ts monster
```

## 架構

```
src/
  core/
    scraper-pipeline.ts   # 所有爬蟲都要實作的最小介面 ScraperPipeline
    wiki-ask-pipeline.ts  # 通用的「MediaWiki #ask 分頁查詢」流程基底類別 WikiAskPipeline
  pipelines/
    registry.ts           # 爬蟲註冊表，index.ts 依此表決定要跑哪些爬蟲
    monster/
      monster-scraper-pipeline.ts  # 「怪物圖鑑」爬蟲，繼承 WikiAskPipeline
  services/
    http-client.ts        # 通用 HTTP 請求 (含重試/超時)，任何爬蟲皆可共用
    wiki-parser.ts         # biligame wiki 常見的頁面解析工具函式
    db-writer.ts           # 怪物資料寫入 DB 的邏輯
    pipeline-context.ts    # 執行期的 log / 統計資訊
  index.ts                 # CLI 入口，依 process.argv 選擇要跑的爬蟲
```

## 如何新增一個新的爬蟲

大多數 biligame wiki 頁面都是靠 Semantic MediaWiki 的 `{{#ask:...}}` 語法分頁查詢資料，
這部分的流程（抓主頁面 → 解析查詢設定 → 查總數 → 分頁抓取 → 去重）已經被抽到
`WikiAskPipeline` 這個基底類別中，新增爬蟲時通常只需要三步：

1. 在 `src/pipelines/<新爬蟲名稱>/` 底下建立一個檔案，繼承 `WikiAskPipeline<TRow>`：

   ```ts
   import { WikiAskPipeline } from "@/core/wiki-ask-pipeline.js";

   export class XxxScraperPipeline extends WikiAskPipeline<XxxRawData> {
       constructor() {
           super({
               name: "xxx",
               targetPage: "https://wiki.biligame.com/.../目標頁面",
               apiUrl: "https://wiki.biligame.com/.../api.php",
           });
       }

       protected parseRows(html: string): XxxRawData[] {
           // 解析單頁表格 HTML，回傳原始資料陣列
       }

       protected getDedupeKey(row: XxxRawData): string | number {
           // 用哪個欄位當作去重的唯一鍵
       }

       protected async persist(rows: XxxRawData[], ctx: PipelineContext): Promise<void> {
           // 寫入資料庫
       }
   }
   ```

2. 在 `src/pipelines/registry.ts` 的 `pipelineFactories` 加上一行：

   ```ts
   xxx: () => new XxxScraperPipeline(),
   ```

3. （選用）在 `package.json` 加上一個對應的 script，例如：

   ```json
   "scraper:xxx": "tsx src/index.ts xxx"
   ```

完成以上步驟後，`index.ts` 和其他既有爬蟲皆不需要改動；`pnpm scraper` 會自動一併執行新爬蟲，
`pnpm scraper:xxx`（或 `tsx src/index.ts xxx`）則只會執行這一個。

若目標網站不是走 `{{#ask:}}` 分頁查詢的模式，只需直接實作 `ScraperPipeline` 介面
（`src/core/scraper-pipeline.ts`）即可，不受 `WikiAskPipeline` 的流程限制。
