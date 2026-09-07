import { Injectable } from "@nestjs/common";

import { AuthenticationAccountNotFoundError } from "../../../../domain/errors";
import { AuthenticationAccountRepository, AuthenticationSessionRepository } from "../../../../domain/interfaces";
import { ListSessionsOutput } from "./output";

@Injectable()
export class ListSessionsUseCase {
    constructor(
        private readonly accountRepository: AuthenticationAccountRepository,
        private readonly sessionRepository: AuthenticationSessionRepository,
    ) {}

    public async execute(userId: string): Promise<ListSessionsOutput> {
        const account = await this.accountRepository.findByUserId(userId);
        if (!account) {
            throw new AuthenticationAccountNotFoundError();
        }
        const sessions = await this.sessionRepository.findByAuthenticationAccountId(account.id);
        return {
            sessions: sessions.map((session) => ({
                id: session.id,
                ipAddress: session.ipAddress,
                userAgent: session.userAgent,
                lastUsedAt: session.lastUsedAt,
                createdAt: session.createdAt,
                expiresAt: session.expiresAt.value,
                isRevoked: session.isRevoked(),
            })),
        };
    }
}
