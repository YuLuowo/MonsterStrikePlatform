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
    ss: string | null;
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

const abilityMap: Record<string, string> = {
    "反重力护罩": "反重力護罩",

    "反伤害壁": "反傷害壁",

    "反传送": "反傳送",

    "扫雷者": "掃雷者",
    "飞行": "飛行",

    "反板块": "反板塊",

    "反风": "反風",

    "魔法阵": "反魔法陣/增幅",

    "反减速壁": "反減速壁",

    "反转移壁": "反移轉壁",

    "反减速板": "反減速板",
};

function extractAbilities(passive: string[]): string[] {
    const abilities = new Set<string>();

    for (const skill of passive) {
        for (const [keyword, gimmick] of Object.entries(abilityMap)) {
            if (skill.includes(keyword)) {
                abilities.add(gimmick);
            }
        }
    }

    return [...abilities];
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

        let evolution: string | null = null;
        const evolutionMatch = text.match(/data-param2="([^"]*)"/);
        if (evolutionMatch && evolutionMatch[1]) {
            evolution = evolutionMatch[1];
        }

        let obtain_method: string | null = null;
        const obtain_methodMatch = text.match(/data-param3="([^"]*)"/);
        if (obtain_methodMatch && obtain_methodMatch[1]) {
            obtain_method = obtain_methodMatch[1];
        }

        let star: number | null = null;
        const starMatch = text.match(/data-param4="([^"]*)"/);
        if (starMatch && starMatch[1]) {
            star = Number(starMatch[1]);
        }

        let category: string | null = null;
        const categoryMatch = text.match(/data-param5="([^"]*)"/);
        if (categoryMatch && categoryMatch[1]) {
            category = categoryMatch[1];
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

        let info: string[] = [];
        let passive: string[] = [];
        let abilities: string[] = [];
        let ss: string | null = null;

        let next = $row.next();

        while (next.length && !next.is("p")) {
            const infoText = next.find("th.juse-xx").text().trim();
            if (infoText) {
                info = infoText
                    .split("/")
                    .map((s) => s.trim())
                    .filter(Boolean);
            }

            const passiveText = next.find("th.juse-bd").text().trim();
            if (passiveText) {
                passive = passiveText
                    .replace(/\+/g, "/")
                    .split("/")
                    .map((s) => s.trim())
                    .filter(Boolean);

                abilities = extractAbilities(passive);
            }

            const ssText = next.find("th.juse-ss").text().trim();
            if (ssText) {
                ss = ssText;
            }

            next = next.next();
        }

        const type = info[0]?.slice(0, 2) ?? "";

        if (!number) {
            return;
        }

        monsters.push({
            number,
            name,
            element,
            type,
            image_url,
            source_url,

            evolution,
            obtain_method,
            star,
            category,

            info,
            passive,
            abilities,
            ss,
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

