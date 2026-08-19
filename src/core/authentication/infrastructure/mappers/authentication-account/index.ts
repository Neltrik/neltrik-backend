import type { AuthenticationAccount as PrismaAuthenticationAccount } from "@prisma/client";

import { AuthenticationAccount } from "../../../domain/entities";
import { AuthenticationProvider, PasswordHash } from "../../../domain/value-objects";

export class AuthenticationAccountMapper {
    public static toPersistence(account: AuthenticationAccount) {
        return {
            id: account.id,
            userId: account.userId,
            provider: account.provider.value,
            email: account.email,
            emailVerified: account.emailVerified,
            passwordHash: account.passwordHash.value,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
        };
    }

    public static toDomain(account: PrismaAuthenticationAccount): AuthenticationAccount {
        return AuthenticationAccount.restore({
            id: account.id,
            userId: account.userId,
            provider: AuthenticationProvider.create(account.provider),
            email: account.email,
            emailVerified: account.emailVerified,
            passwordHash: PasswordHash.create(account.passwordHash),
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
        });
    }
}
