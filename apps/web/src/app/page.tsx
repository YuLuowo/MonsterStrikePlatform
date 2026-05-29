import { prisma } from "@repo/db";

export default async function HomePage() {
    const monster = await prisma.monsters.findFirst();

    return (
        <>
            { monster?.name ?? "No monster found" }
        </>
    );
}