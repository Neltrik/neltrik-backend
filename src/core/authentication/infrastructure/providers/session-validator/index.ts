import { Injectable } from "@nestjs/common";

import { SessionResolution, SessionValidator } from "@/shared/auth";

import { AuthenticationSessionRepository } from "../../../domain/interfaces";

@Injectable()
export class SessionValidatorProvider implements SessionValidator {
    constructor(private readonly sessionRepository: AuthenticationSessionRepository) {}

    public async resolve(sessionId: string): Promise<SessionResolution> {
        const result = await this.sessionRepository.findByIdWithOwnerState(sessionId);
        if (!result || result.session.isRevoked()) {
            return {
                isValid: false,
                userState: { status: "SUSPENDED" },
                accountState: { emailVerified: false },
            };
        }
        return {
            isValid: true,
            userState: { status: result.userStatus },
            accountState: { emailVerified: result.emailVerified },
        };
    }
}
