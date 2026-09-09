import { Global, Module } from "@nestjs/common";

import { TransactionManager } from "@/shared/transaction";

import { PrismaService } from "./prisma.service";
import { TenantContextService } from "./tenant-isolation";
import { PrismaTransactionManager } from "./transaction";

@Global()
@Module({
    providers: [
        PrismaService,
        TenantContextService,
        PrismaTransactionManager,
        {
            provide: TransactionManager,
            useClass: PrismaTransactionManager,
        },
    ],
    exports: [PrismaService, TenantContextService, TransactionManager],
})
export class PrismaModule {}
