import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "@/prisma/index";
import type { TransactionContext } from "@/shared/transaction";

import { PasswordReset } from "../../../domain/entities";
import { PasswordResetRepository } from "../../../domain/interfaces";
import { PasswordResetMapper } from "../../mappers";

@Injectable()
export class PrismaPasswordResetRepository extends PasswordResetRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(reset: PasswordReset, context?: TransactionContext): Promise<void> {
        const prisma = context ? context.get<Prisma.TransactionClient>() : this.prisma;
        await prisma.passwordReset.create({
            data: PasswordResetMapper.toPersistence(reset),
        });
    }

    public async update(reset: PasswordReset, context?: TransactionContext): Promise<void> {
        const prisma = context ? context.get<Prisma.TransactionClient>() : this.prisma;
        await prisma.passwordReset.update({
            where: { id: reset.id },
            data: PasswordResetMapper.toPersistence(reset),
        });
    }

    public async findByTokenHash(tokenHash: string): Promise<PasswordReset | null> {
        const reset = await this.prisma.passwordReset.findFirst({
            where: { tokenHash },
        });
        if (!reset) {
            return null;
        }
        return PasswordResetMapper.toDomain(reset);
    }

    public async invalidatePendingByAccount(accountId: string, context: TransactionContext): Promise<void> {
        const prisma = context.get<Prisma.TransactionClient>();
        await prisma.passwordReset.updateMany({
            where: { authenticationAccountId: accountId, usedAt: null },
            data: { expiresAt: new Date(), updatedAt: new Date() },
        });
    }
}
