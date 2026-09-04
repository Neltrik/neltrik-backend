import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "@/prisma/index";
import { TransactionContext } from "@/shared/transaction";

import { AuthenticationSession } from "../../../domain/entities";
import { AuthenticationSessionRepository } from "../../../domain/interfaces";
import { AuthenticationSessionMapper } from "../../mappers";

@Injectable()
export class PrismaAuthenticationSessionRepository extends AuthenticationSessionRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(session: AuthenticationSession): Promise<void> {
        await this.prisma.authenticationSession.create({
            data: AuthenticationSessionMapper.toPersistence(session),
        });
    }

    public async update(session: AuthenticationSession): Promise<void> {
        await this.prisma.authenticationSession.update({
            where: { id: session.id },
            data: AuthenticationSessionMapper.toPersistence(session),
        });
    }

    public async findById(id: string): Promise<AuthenticationSession | null> {
        const session = await this.prisma.authenticationSession.findUnique({ where: { id } });
        if (!session) {
            return null;
        }
        return AuthenticationSessionMapper.toDomain(session);
    }

    public async findByRefreshTokenHash(refreshTokenHash: string): Promise<AuthenticationSession | null> {
        const session = await this.prisma.authenticationSession.findFirst({ where: { refreshTokenHash } });
        if (!session) {
            return null;
        }
        return AuthenticationSessionMapper.toDomain(session);
    }

    public async findByAuthenticationAccountId(authenticationAccountId: string): Promise<AuthenticationSession[]> {
        const sessions = await this.prisma.authenticationSession.findMany({
            where: { authenticationAccountId },
        });
        return sessions.map((session) => AuthenticationSessionMapper.toDomain(session));
    }

    public async invalidateByAccount(accountId: string, context: TransactionContext): Promise<void> {
        const prisma = context.get<Prisma.TransactionClient>();
        await prisma.authenticationSession.updateMany({
            where: { authenticationAccountId: accountId, revokedAt: null },
            data: { revokedAt: new Date(), updatedAt: new Date() },
        });
    }
}
