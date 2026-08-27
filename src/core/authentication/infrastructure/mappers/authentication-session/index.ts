import type { AuthenticationSession as PrismaAuthenticationSession } from "@prisma/client";

import { AuthenticationSession } from "../../../domain/entities";
import { ExpirationDate } from "../../../domain/value-objects";

export class AuthenticationSessionMapper {
    public static toPersistence(session: AuthenticationSession) {
        return {
            id: session.id,
            authenticationAccountId: session.authenticationAccountId,
            refreshTokenHash: session.refreshTokenHash,
            expiresAt: session.expiresAt.value,
            refreshTokenExpiresAt: session.refreshTokenExpiresAt.value,
            revokedAt: session.revokedAt,
            lastUsedAt: session.lastUsedAt,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
        };
    }

    public static toDomain(prismaSession: PrismaAuthenticationSession): AuthenticationSession {
        return AuthenticationSession.restore({
            id: prismaSession.id,
            authenticationAccountId: prismaSession.authenticationAccountId,
            refreshTokenHash: prismaSession.refreshTokenHash,
            expiresAt: ExpirationDate.create(prismaSession.expiresAt),
            refreshTokenExpiresAt: ExpirationDate.create(prismaSession.refreshTokenExpiresAt),
            revokedAt: prismaSession.revokedAt,
            lastUsedAt: prismaSession.lastUsedAt,
            ipAddress: prismaSession.ipAddress,
            userAgent: prismaSession.userAgent,
            createdAt: prismaSession.createdAt,
            updatedAt: prismaSession.updatedAt,
        });
    }
}
