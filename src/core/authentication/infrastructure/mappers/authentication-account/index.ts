import type { AuthenticationAccount as PrismaAuthenticationAccount } from "@prisma/client";

import { AuthenticationAccount } from "../../../domain/entities";
import { PasswordHash } from "../../../domain/value-objects";

export class AuthenticationAccountMapper {
    public static toPersistence(account: AuthenticationAccount) {
        return {
            id: account.id,
            userId: account.userId,
            provider: account.provider,
            email: account.email,
            emailVerified: account.emailVerified,
            passwordHash: account.passwordHash?.value ?? null,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
        };
    }

    public static toDomain(prismaAccount: PrismaAuthenticationAccount): AuthenticationAccount {
        return AuthenticationAccount.restore({
            id: prismaAccount.id,
            userId: prismaAccount.userId,
            provider: prismaAccount.provider,
            email: prismaAccount.email,
            emailVerified: prismaAccount.emailVerified,
            passwordHash: prismaAccount.passwordHash ? PasswordHash.create(prismaAccount.passwordHash) : null,
            createdAt: prismaAccount.createdAt,
            updatedAt: prismaAccount.updatedAt,
        });
    }
}
