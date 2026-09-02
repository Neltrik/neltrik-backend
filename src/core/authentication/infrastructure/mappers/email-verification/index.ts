import type { EmailVerification as PrismaEmailVerification } from "@prisma/client";

import { EmailVerification } from "../../../domain/entities";
import { ExpirationDate, TokenHash } from "../../../domain/value-objects";

export class EmailVerificationMapper {
    public static toPersistence(verification: EmailVerification) {
        return {
            id: verification.id,
            authenticationAccountId: verification.authenticationAccountId,
            email: verification.email,
            tokenHash: verification.tokenHash.value,
            expiresAt: verification.expiresAt.value,
            verifiedAt: verification.verifiedAt,
            createdAt: verification.createdAt,
            updatedAt: verification.updatedAt,
        };
    }

    public static toDomain(prismaVerification: PrismaEmailVerification): EmailVerification {
        return EmailVerification.restore({
            id: prismaVerification.id,
            authenticationAccountId: prismaVerification.authenticationAccountId,
            email: prismaVerification.email,
            tokenHash: TokenHash.create(prismaVerification.tokenHash),
            expiresAt: ExpirationDate.restore(prismaVerification.expiresAt),
            verifiedAt: prismaVerification.verifiedAt,
            createdAt: prismaVerification.createdAt,
            updatedAt: prismaVerification.updatedAt,
        });
    }
}
