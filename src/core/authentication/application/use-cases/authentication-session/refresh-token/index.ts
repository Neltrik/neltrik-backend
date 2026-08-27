import { Injectable } from "@nestjs/common";

import { AuthorizationRoleApi } from "@/core/authorization/api";
import { UserApi } from "@/core/identity/api";

import {
    AuthenticationAccountNotFoundError,
    InvalidRefreshTokenError,
    SessionExpiredError,
    SessionRevokedError,
} from "../../../../domain/errors";
import { AuthenticationAccountRepository, AuthenticationSessionRepository } from "../../../../domain/interfaces";
import { ExpirationDate } from "../../../../domain/value-objects";
import { TokenProvider } from "../../../../infrastructure/providers";
import { type RefreshTokenOutput } from "./output";

@Injectable()
export class RefreshTokenUseCase {
    constructor(
        private readonly authorizationRoleApi: AuthorizationRoleApi,
        private readonly userApi: UserApi,
        private readonly accountRepository: AuthenticationAccountRepository,
        private readonly sessionRepository: AuthenticationSessionRepository,
        private readonly tokenProvider: TokenProvider,
    ) {}

    public async execute(refreshToken: string): Promise<RefreshTokenOutput> {
        const refreshTokenHash = await this.tokenProvider.hashRefreshToken(refreshToken);
        const session = await this.sessionRepository.findByRefreshTokenHash(refreshTokenHash);
        if (!session) {
            throw new InvalidRefreshTokenError();
        }
        if (session.isExpired()) {
            throw new SessionExpiredError();
        }
        if (session.isRevoked()) {
            throw new SessionRevokedError();
        }
        if (session.isRefreshTokenExpired()) {
            throw new InvalidRefreshTokenError();
        }
        const account = await this.accountRepository.findById(session.authenticationAccountId);
        if (!account) {
            throw new AuthenticationAccountNotFoundError();
        }
        const identityUser = await this.userApi.getUserById(account.userId);
        const role = await this.authorizationRoleApi.getRoleById(identityUser.roleId);
        const accessToken = await this.tokenProvider.generateAccessToken({
            userId: account.userId,
            email: account.email,
            tenantId: identityUser.tenantId,
            roleCode: role.code,
        });
        const newRefreshToken = this.tokenProvider.generateRefreshToken();
        const newRefreshTokenHash = await this.tokenProvider.hashRefreshToken(newRefreshToken);
        const newRefreshTokenExpiresAt = this.tokenProvider.calculateRefreshTokenExpiration();
        session.renew(newRefreshTokenHash, session.expiresAt, ExpirationDate.create(newRefreshTokenExpiresAt));
        await this.sessionRepository.update(session);
        return { accessToken, refreshToken: newRefreshToken };
    }
}
