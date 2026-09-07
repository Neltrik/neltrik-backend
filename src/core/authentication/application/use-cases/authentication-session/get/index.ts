import { Injectable } from "@nestjs/common";

import { AuthenticationAccountNotFoundError, SessionNotFoundError } from "../../../../domain/errors";
import { AuthenticationAccountRepository, AuthenticationSessionRepository } from "../../../../domain/interfaces";
import { GetSessionInput } from "./input";
import { GetSessionOutput } from "./output";

@Injectable()
export class GetSessionUseCase {
    constructor(
        private readonly accountRepository: AuthenticationAccountRepository,
        private readonly sessionRepository: AuthenticationSessionRepository,
    ) {}

    public async execute(input: GetSessionInput): Promise<GetSessionOutput> {
        const account = await this.accountRepository.findByUserId(input.userId);
        if (!account) {
            throw new AuthenticationAccountNotFoundError();
        }
        const session = await this.sessionRepository.findById(input.sessionId);
        if (!session) {
            throw new SessionNotFoundError();
        }
        if (session.authenticationAccountId !== account.id) {
            throw new SessionNotFoundError();
        }
        return {
            id: session.id,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            lastUsedAt: session.lastUsedAt,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt.value,
            isRevoked: session.isRevoked(),
        };
    }
}
