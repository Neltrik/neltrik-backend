import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/index";

import { AuthenticationAccount } from "../../../domain/entities";
import { AuthenticationAccountRepository } from "../../../domain/interfaces";
import { AuthenticationAccountMapper } from "../../mappers";

@Injectable()
export class PrismaAuthenticationAccountRepository extends AuthenticationAccountRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(account: AuthenticationAccount): Promise<void> {
        await this.prisma.authenticationAccount.create({
            data: AuthenticationAccountMapper.toPersistence(account),
        });
    }

    public async update(account: AuthenticationAccount): Promise<void> {
        await this.prisma.authenticationAccount.update({
            where: { id: account.id },
            data: AuthenticationAccountMapper.toPersistence(account),
        });
    }

    public async findByUserId(userId: string): Promise<AuthenticationAccount | null> {
        const account = await this.prisma.authenticationAccount.findUnique({
            where: { userId },
        });
        if (!account) {
            return null;
        }
        return AuthenticationAccountMapper.toDomain(account);
    }

    public async findByEmail(email: string): Promise<AuthenticationAccount | null> {
        const account = await this.prisma.authenticationAccount.findFirst({
            where: { email },
        });
        if (!account) {
            return null;
        }
        return AuthenticationAccountMapper.toDomain(account);
    }
}
