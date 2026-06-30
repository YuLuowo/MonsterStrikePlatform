"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ELEMENTS, TYPES, ABILITIES } from "@/lib/filter-maps";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

export default function MonsterFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const initElement = searchParams.get("element") ?? "";
    const initType = searchParams.get("type") ?? "";
    const initAbilities = searchParams.get("abilities")?.split(",").filter(Boolean) ?? [];

    const initElements = initElement.split(",").filter(Boolean);
    const [elements, setElements] = useState<string[]>(initElements);
    const [type, setType] = useState<string | "">(initType);
    const [abilities, setAbilities] = useState<string[]>(initAbilities);

    useEffect(() => {
        setElements(searchParams.get("element")?.split(",").filter(Boolean) ?? []);
        setType(searchParams.get("type") ?? "");
        setAbilities(searchParams.get("abilities")?.split(",").filter(Boolean) ?? []);
    }, [searchParams]);

    const toggleAbility = (ab: string) => {
        setAbilities((prev) => (prev.includes(ab) ? prev.filter((p) => p !== ab) : [...prev, ab]));
    };

    const toggleElement = (el: string) => {
        setElements((prev) => (prev.includes(el) ? prev.filter((p) => p !== el) : [...prev, el]));
    };

    const onSearch = () => {
        const newSearch = new URLSearchParams(searchParams);
        newSearch.set("page", "1");
        if (elements.length) newSearch.set("element", elements.join(",")); else newSearch.delete("element");
        if (type) newSearch.set("type", type); else newSearch.delete("type");
        if (abilities.length) newSearch.set("abilities", abilities.join(",")); else newSearch.delete("abilities");

        router.push(`?${newSearch.toString()}`);
        if (typeof window !== "undefined") window.scrollTo({top: 0, behavior: "smooth"});
    };

    const onClear = () => {
        const newSearch = new URLSearchParams(searchParams);
        newSearch.set("page", "1");
        newSearch.delete("element");
        newSearch.delete("type");
        newSearch.delete("abilities");
        setElements([]);
        setType("");
        setAbilities([]);
        router.push(`?${newSearch.toString()}`);
        if (typeof window !== "undefined") window.scrollTo({top: 0, behavior: "smooth"});
    };

    return (
        <div className="p-4 md:p-6 border border-border rounded-xl mx-3 mt-0 mb-6">
            <div className="flex flex-col items-start">
                <label className="text-lg md:text-xl font-semibold">屬性</label>
                <div className="mt-2 flex flex-wrap gap-2">
                    {ELEMENTS.map((el) => (
                        <label key={el.value} className="flex items-center gap-2 text-sm md:text-base cursor-pointer">
                            <Checkbox className="cursor-pointer" checked={elements.includes(el.value)}
                                      onCheckedChange={() => toggleElement(el.value)}/>
                            <span>{el.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex flex-col items-start gap-2 mt-2">
                <label className="text-lg md:text-xl font-semibold">擊種</label>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="cursor-pointer mb-2 md:mb-4 px-4">{type || "全部"}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuRadioGroup value={type} onValueChange={(v) => setType(v)}>
                            <DropdownMenuRadioItem value="">全部</DropdownMenuRadioItem>
                            {TYPES.map((t) => (
                                <DropdownMenuRadioItem key={t.value} value={t.value}>{t.label}</DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex flex-col item-start mb-4">
                <label className="text-lg md:text-xl font-semibold">被動</label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-5 sm:grid-cols-4 gap-2">
                    {ABILITIES.map((ab) => (
                        <label key={ab} className="flex items-center gap-2 text-sm md:text-base cursor-pointer">
                            <Checkbox className="cursor-pointer" checked={abilities.includes(ab)}
                                      onCheckedChange={() => toggleAbility(ab)}/>
                            <span>{ab}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button className="cursor-pointer" variant="default" onClick={onSearch}>搜尋</Button>
                <Button className="cursor-pointer" variant="outline" onClick={onClear}>清除</Button>
            </div>
        </div>
    );
}