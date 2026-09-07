import { Injectable } from "@nestjs/common";

import {
    AuthenticationAccountNotFoundError,
    SessionNotFoundError,
    SessionRevokedError,
    UnauthorizedSessionError,
} from "../../../../domain/errors";
import { AuthenticationAccountRepository, AuthenticationSessionRepository } from "../../../../domain/interfaces";
import { type RevokeSessionInput } from "./input";

@Injectable()
export class RevokeSessionUseCase {
    constructor(
        private readonly sessionRepository: AuthenticationSessionRepository,
        private readonly accountRepository: AuthenticationAccountRepository,
    ) {}

    public async execute(input: RevokeSessionInput): Promise<void> {
        if (!input.userId) {
            throw new UnauthorizedSessionError();
        }
        const session = await this.sessionRepository.findById(input.sessionId);
        if (!session) {
            throw new SessionNotFoundError();
        }
        const account = await this.accountRepository.findById(session.authenticationAccountId);
        if (!account) {
            throw new AuthenticationAccountNotFoundError();
        }
        if (account.userId !== input.userId) {
            throw new UnauthorizedSessionError();
        }
        if (session.isRevoked()) {
            throw new SessionRevokedError();
        }
        session.revoke();
        await this.sessionRepository.update(session);
    }
}
