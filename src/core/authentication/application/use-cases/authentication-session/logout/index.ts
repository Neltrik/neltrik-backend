import { Injectable } from "@nestjs/common";

import { InvalidRefreshTokenError } from "../../../../domain/errors";
import { AuthenticationSessionRepository } from "../../../../domain/interfaces";
import { Sha256Hasher } from "../../../../infrastructure/providers";

@Injectable()
export class LogoutUseCase {
    constructor(
        private readonly sessionRepository: AuthenticationSessionRepository,
        private readonly sha256Hasher: Sha256Hasher,
    ) {}

    public async execute(refreshToken: string): Promise<void> {
        const refreshTokenHash = this.sha256Hasher.hash(refreshToken);
        const session = await this.sessionRepository.findByRefreshTokenHash(refreshTokenHash);
        if (!session) {
            throw new InvalidRefreshTokenError();
        }
        session.revoke();
        await this.sessionRepository.update(session);
    }
}
