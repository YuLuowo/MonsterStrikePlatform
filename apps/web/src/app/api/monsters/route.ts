import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

// Type for Prisma where clause
interface MonsterWhereInput {
    element?: string | { in: string[] };
    type?: string;
    abilities?: { hasEvery: string[] };
}

export const getMonsters = (
    page: number,
    limit: number,
    filters?: { element?: string | string[]; type?: string; abilities?: string[] }
) =>
    unstable_cache(
        async () => {
            const where: MonsterWhereInput = {};

            if (filters?.element) {
                if (Array.isArray(filters.element)) {
                    where.element = {in: filters.element};
                } else if (typeof filters.element === "string" && filters.element.includes(",")) {
                    const parts = filters.element.split(",").map((s) => s.trim()).filter(Boolean);
                    if (parts.length > 0) where.element = {in: parts};
                } else {
                    where.element = filters.element;
                }
            }

            if (filters?.type) {
                where.type = filters.type;
            }

            if (filters?.abilities && filters.abilities.length > 0) {
                where.abilities = {hasEvery: filters.abilities};
            }

            const [monsters, total] = await Promise.all([
                prisma.monsters.findMany({
                    select: {
                        number: true,
                        name: true,
                        image_url: true,
                        element: true,
                        type: true,
                        abilities: true,
                    },
                    where,
                    orderBy: {
                        number: "desc",
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                }),
                prisma.monsters.count({where}),
            ]);

            return {
                data: monsters,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        },
        [
            `monsters-${page}-${limit}`,
            Array.isArray(filters?.element) ? (filters?.element || []).join(",") : filters?.element ?? "",
            filters?.type ?? "",
            (filters?.abilities ?? []).join(","),
        ],
        {
            revalidate: 86400,
        }
    )();

export async function GET(request: NextRequest) {
    try {
        const {searchParams} = new URL(request.url);

        const page = Number(searchParams.get("page") ?? 1);
        const limit = Number(searchParams.get("limit") ?? 100);

        const element = searchParams.get("element") ?? undefined;
        const type = searchParams.get("type") ?? undefined;
        const abilitiesParam = searchParams.get("abilities") ?? undefined;
        const abilities = abilitiesParam ? abilitiesParam.split(",").map((s) => s.trim()).filter(Boolean) : undefined;

        const result = await getMonsters(page, limit, {element, type, abilities});

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            {
                message: `Failed to fetch monsters. ${error}`,
            },
            {
                status: 500,
            }
        );
    }
}