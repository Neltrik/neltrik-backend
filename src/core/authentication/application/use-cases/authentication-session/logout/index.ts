import { Injectable } from "@nestjs/common";

import { InvalidRefreshTokenError } from "../../../../domain/errors";
import { AuthenticationSessionRepository } from "../../../../domain/interfaces";
import { TokenProvider } from "../../../../infrastructure/providers";

@Injectable()
export class LogoutUseCase {
    constructor(
        private readonly sessionRepository: AuthenticationSessionRepository,
        private readonly tokenProvider: TokenProvider,
    ) {}

    public async execute(refreshToken: string): Promise<void> {
        const refreshTokenHash = await this.tokenProvider.hashRefreshToken(refreshToken);
        const session = await this.sessionRepository.findByRefreshTokenHash(refreshTokenHash);
        if (!session) {
            throw new InvalidRefreshTokenError();
        }
        session.revoke();
        await this.sessionRepository.update(session);
    }
}
