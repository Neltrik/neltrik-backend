import { type ResourceStatus } from "@/types/index";

import { type AuthenticationSession } from "../../entities";
import type { ExpirationDate } from "../../value-objects";

export type AuthenticationSessionProps = {
    id: string;
    authenticationAccountId: string;
    ownerId: string | null;
    refreshTokenHash: string;
    expiresAt: ExpirationDate;
    refreshTokenExpiresAt: ExpirationDate;
    revokedAt: Date | null;
    lastUsedAt: Date | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type SessionWithOwnerState = {
    session: AuthenticationSession;
    userStatus: ResourceStatus;
    emailVerified: boolean;
};
