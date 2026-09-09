import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { TransactionManager } from "@/shared/transaction";

import { PrismaService } from "../prisma.service";
import { TenantContextService } from "../tenant-isolation";
import { withTenantTransaction } from "./helper";
import { PrismaTransactionContext } from "./prisma-context";

@Injectable()
export class PrismaTransactionManager extends TransactionManager {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantContext: TenantContextService,
    ) {
        super();
    }

    public async execute<T>(operation: (context: PrismaTransactionContext) => Promise<T>): Promise<T> {
        const tenantId = this.tenantContext.getCurrentTenant();
        return withTenantTransaction(this.prisma, tenantId, async (client: Prisma.TransactionClient) => {
            const context = new PrismaTransactionContext(client);
            return operation(context);
        });
    }
}
