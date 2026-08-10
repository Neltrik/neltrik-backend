import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { TransactionManager } from "@/shared/transaction";

import { PrismaService } from "../prisma.service";
import { PrismaTransactionContext } from "./prisma-context";

@Injectable()
export class PrismaTransactionManager extends TransactionManager {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async execute<T>(operation: (context: PrismaTransactionContext) => Promise<T>): Promise<T> {
        return this.prisma.$transaction(async (client: Prisma.TransactionClient) => {
            const context = new PrismaTransactionContext(client);
            return operation(context);
        });
    }
}
