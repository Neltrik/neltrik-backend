import { Prisma } from "@prisma/client";

export async function createOrGet<TPersistence, TDomain>(
    create: () => Promise<TPersistence>,
    find: () => Promise<TDomain | null>,
    toDomain: (persistence: TPersistence) => TDomain,
): Promise<TDomain> {
    try {
        const created = await create();
        return toDomain(created);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            const existing = await find();
            if (existing) {
                return existing;
            }
        }
        throw error;
    }
}
