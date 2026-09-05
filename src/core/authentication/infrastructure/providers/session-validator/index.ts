import { Injectable } from "@nestjs/common";

import { SessionValidator } from "@/shared/auth";

import { AuthenticationSessionRepository } from "../../../domain/interfaces";

@Injectable()
export class SessionValidatorProvider implements SessionValidator {
    constructor(private readonly sessionRepository: AuthenticationSessionRepository) {}

    public async validate(sessionId: string): Promise<boolean> {
        const session = await this.sessionRepository.findById(sessionId);
        if (!session) {
            return false;
        }
        return !session.isRevoked();
    }
}
