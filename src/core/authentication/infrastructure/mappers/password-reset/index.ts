import type { PasswordReset as PrismaPasswordReset } from "@prisma/client";

import { PasswordReset } from "../../../domain/entities";
import { ExpirationDate, TokenHash } from "../../../domain/value-objects";

export class PasswordResetMapper {
    public static toPersistence(reset: PasswordReset) {
        return {
            id: reset.id,
            authenticationAccountId: reset.authenticationAccountId,
            tokenHash: reset.tokenHash.value,
            expiresAt: reset.expiresAt.value,
            usedAt: reset.usedAt,
            createdAt: reset.createdAt,
            updatedAt: reset.updatedAt,
        };
    }

    public static toDomain(prismaReset: PrismaPasswordReset): PasswordReset {
        return PasswordReset.restore({
            id: prismaReset.id,
            authenticationAccountId: prismaReset.authenticationAccountId,
            tokenHash: TokenHash.create(prismaReset.tokenHash),
            expiresAt: ExpirationDate.restore(prismaReset.expiresAt),
            usedAt: prismaReset.usedAt,
            createdAt: prismaReset.createdAt,
            updatedAt: prismaReset.updatedAt,
        });
    }
}
