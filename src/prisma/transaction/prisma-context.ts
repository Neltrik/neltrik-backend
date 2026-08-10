import type { Prisma } from "@prisma/client";

import { TransactionContext } from "@/shared/transaction";

export class PrismaTransactionContext extends TransactionContext {
    constructor(public readonly client: Prisma.TransactionClient) {
        super();
    }

    public get<T>(): T {
        return this.client as T;
    }
}
