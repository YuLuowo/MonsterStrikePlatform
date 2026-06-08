import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

const getMonster = (number: number) => unstable_cache(
    async () => {
        return prisma.monsters.findUnique({
            where: {
                number,
            },
        });
    },
    [`monster-${number}`],
    {
        revalidate: 86400,
    }
)();

export async function GET(request: Request, context: { params: Promise<{ number: string }> }) {
    try {
        const { number } = await context.params;
        const monster = await getMonster(Number(number));

        if (!monster) {
            return NextResponse.json(
                {
                    message: "Monster not found",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json(monster);
    } catch (error) {
        return NextResponse.json(
            {
                message: `Failed to fetch monster. ${error}`,
            },
            {
                status: 500,
            }
        );
    }
}