import { Global, Module } from "@nestjs/common";

import { TransactionManager } from "@/shared/transaction";

import { PrismaService } from "./prisma.service";
import { PrismaTransactionManager } from "./transaction";

@Global()
@Module({
    providers: [
        PrismaService,
        PrismaTransactionManager,
        {
            provide: TransactionManager,
            useClass: PrismaTransactionManager,
        },
    ],
    exports: [PrismaService, TransactionManager],
})
export class PrismaModule {}
