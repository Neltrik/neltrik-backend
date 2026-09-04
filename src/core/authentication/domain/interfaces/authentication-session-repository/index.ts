import { type TransactionContext } from "@/shared/transaction";

import type { AuthenticationSession } from "../../entities";

export abstract class AuthenticationSessionRepository {
    abstract create(session: AuthenticationSession): Promise<void>;
    abstract update(session: AuthenticationSession): Promise<void>;
    abstract findById(id: string): Promise<AuthenticationSession | null>;
    abstract findByRefreshTokenHash(refreshTokenHash: string): Promise<AuthenticationSession | null>;
    abstract findByAuthenticationAccountId(authenticationAccountId: string): Promise<AuthenticationSession[]>;
    abstract invalidateByAccount(accountId: string, context: TransactionContext): Promise<void>;
}
