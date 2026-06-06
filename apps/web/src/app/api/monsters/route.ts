import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

export const getMonsters = unstable_cache(
    async () => {
        return prisma.monsters.findMany(
            {
                orderBy: {
                    number: "desc",
                },
            }
        );
    },
    ["monsters"],
    {
        revalidate: 86400,
    }
);

export async function GET() {
    try {
        const monsters = await getMonsters();

        return NextResponse.json(monsters);
    } catch (error) {
        return NextResponse.json(
            { message: "Failed to fetch monsters." + error },
            { status: 500 }
        );
    }
}