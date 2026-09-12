import { Injectable } from "@nestjs/common";

import { SessionNotFoundError, SessionRevokedError } from "../../../../domain/errors";
import { AuthenticationSessionRepository } from "../../../../domain/interfaces";
import { type RevokeSessionInput } from "./input";

@Injectable()
export class RevokeSessionUseCase {
    constructor(private readonly sessionRepository: AuthenticationSessionRepository) {}

    public async execute(input: RevokeSessionInput): Promise<void> {
        const session = await this.sessionRepository.findById(input.sessionId);
        if (!session) {
            throw new SessionNotFoundError();
        }
        if (session.isRevoked()) {
            throw new SessionRevokedError();
        }
        session.revoke();
        await this.sessionRepository.update(session);
    }
}
