import { type Prisma } from "@prisma/client";

import { type PrismaService } from "../prisma.service";

type TransactionClient = Prisma.TransactionClient;
type TransactionCallback<T> = (tx: TransactionClient) => Promise<T>;

export async function withTenantTransaction<T>(
    prisma: PrismaService,
    tenantId: string | null,
    fn: TransactionCallback<T>,
): Promise<T> {
    if (!tenantId) {
        return prisma.$transaction(fn);
    }
    return prisma.$transaction(async (tx: TransactionClient) => {
        await tx.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, true)`;
        return fn(tx);
    });
}
