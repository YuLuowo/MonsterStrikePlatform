import { load } from "cheerio";

export interface WikiConfig {
    tableHeader: string;
    printColumn: string;
    parameters: string;
    tableFooter: string;
    limit: number;
}

export interface MonsterRawData {
    number: string;
    name: string | null;
    element: string | null;
    image_url: string | null;
    source_url: string | null;
}

const DEFAULT_LIMIT = 100;
const DEFAULT_TABLE_FOOTER = "&ensp;";
const BASE_URL = "https://wiki.biligame.com/gwdz";

function findJsVariable(
    pattern: RegExp | string,
    text: string,
    defaultValue: string = ""
): string {
    const match = text.match(pattern as RegExp | string);
    if (!match) {
        return defaultValue;
    }

    let raw = match[1] || "";
    raw = raw.replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t");
    return raw;
}

export function parseWikiConfig(html: string): WikiConfig {
    const $ = load(html);
    const scriptText = $("script")
        .map((_, el) => $(el).html() || "")
        .get()
        .join("\n");

    let tableHeader = findJsVariable(/var tableHeader\s*=\s*\(\s*\(\s*"(.*?)"\s*\)\.replace\("\{ \|",\s*"\{\|"\)\s*;/, scriptText);

    if (!tableHeader) {
        tableHeader = findJsVariable(/var tableHeader\s*=\s*\(\s*\(\s*'(.*?)'\s*\)\.replace\("\{ \|",\s*"\{\|"\)\s*;/, scriptText);
    }

    let printColumn = findJsVariable(/var printColumn\s*=\s*paramsFormmatter\(\s*"(.*?)",\s*"\|\?"\s*\)\s*;/, scriptText);
    let parameters = findJsVariable(/var parameters\s*=\s*paramsFormmatter\(\(\s*"(.*?)"\s*\)\.replace\(.*?\),\s*"\|"\s*\)\s*;/, scriptText);

    let limit = DEFAULT_LIMIT;
    const limitMatch = scriptText.match(/var limit\s*=\s*(\d+)\s*;/);
    if (limitMatch && limitMatch[1]) {
        limit = parseInt(limitMatch[1], 10);
    }

    if (printColumn) {
        printColumn = "|?" + printColumn.replace(/,/g, "|?");
    } else {
        printColumn =
            "|?统一编号|?最新形态|?角色名称|?属性|?评分|?" +
            "入手方式|?统一ID|?另外编号|?最新形态2|?" +
            "统一星数|?弹珠类型|?统一属性";
    }

    if (parameters) {
        parameters = "|" + parameters.replace(/:/g, "=").replace(/,/g, "|");
    } else {
        parameters =
            "|sort=统一ID|template=角色筛选图鉴新/行|" +
            "headers=hide|format=template|link=none|order=desc";
    }

    if (tableHeader && tableHeader.startsWith("{ |")) {
        tableHeader = tableHeader.replace("{ |", "{|");
    }

    return {
        tableHeader,
        printColumn,
        parameters,
        tableFooter: DEFAULT_TABLE_FOOTER,
        limit,
    };
}

export function buildConditions(html: string): string {
    const $ = load(html);
    const conditions: Record<string, string[]> = {};
    let suffix = "";

    $(".btn.queryParams.selected").each((_, el) => {
        const cond = String($(el).data("conditions") || "").trim();
        if (!cond) {
            return;
        }

        const parent = $(el).closest("tr");
        const keyRaw = parent.data("ask-key");
        const key = keyRaw ? String(keyRaw) : "";

        if (!key) {
            suffix += cond;
            return;
        }

        if (!conditions[key]) {
            conditions[key] = [];
        }
        conditions[key].push(cond);
    });

    let result = "";
    for (const [key, vals] of Object.entries(conditions)) {
        result += `[[${key}${vals.join("||")}]]`;
    }

    if (!result && !suffix) {
        result = "[[分类:角色名称]]";
    }

    return result + suffix;
}

export function parseMonsters(html: string): MonsterRawData[] {
    const $ = load(html);
    const monsters: MonsterRawData[] = [];

    const rows = $("tr[data-param1]").toArray();
    const legacyRows = rows.length > 0 ? rows : $("div.mw-parser-output > p").toArray();

    legacyRows.forEach((row) => {
        const $row = $(row);
        const text = $row.text();

        if ($row.is("p") && !text.startsWith('|-class="divsort"')) {
            return;
        }

        let element: string | null = null;
        const elementMatch = text.match(/data-param1="([^"]*)"/);
        if (elementMatch && elementMatch[1]) {
            element = elementMatch[1];
        }

        let number: string | null = null;
        const numberMatch = text.match(/NO\.(\d+)/);
        if (numberMatch && numberMatch[1]) {
            number = numberMatch[1];
        }

        let image_url: string | null = null;
        const img = $row.find("img").first();
        if (img.length) {
            const src = img.attr("src");
            if (src) {
                image_url = new URL(src, BASE_URL).href;

                let imgMatch = src.match(/70px-(\d+)\.jpg/);
                if (!imgMatch) {
                    imgMatch = src.match(/(\d+)(?=\.jpg|$)/);
                }
                if (imgMatch && imgMatch[1]) {
                    number = imgMatch[1];
                }
            }
        }

        const links = $row
            .find("a[href]")
            .filter((_, a) => {
                const href = $(a).attr("href") || "";
                return href.startsWith("/gwdz/") && !href.includes("index.php?title=");
            })
            .toArray();

        let name: string | null = null;
        let source_url: string | null = null;

        if (links.length > 0) {
            const lastLink = links[links.length - 1];
            const href = $(lastLink).attr("href");
            if (href) {
                source_url = new URL(href, BASE_URL).href;
            }
            name = $(lastLink).text().trim();
        }

        if (!number) {
            return;
        }

        monsters.push({
            number,
            name,
            element,
            image_url,
            source_url,
        });
    });

    return monsters;
}

export function parseCount(html: string): number {
    const $ = load(html);
    const text = $.root().text();
    const match = text.match(/(\d[\d,]*)/);
    if (!match || !match[1]) {
        throw new Error("無法解析計數結果");
    }

    return parseInt(match[1].replace(/,/g, ""), 10);
}

