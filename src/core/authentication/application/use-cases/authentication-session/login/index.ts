import { Injectable } from "@nestjs/common";

import { AuthorizationRoleApi } from "@/core/authorization/api";
import { UserApi } from "@/core/identity/api";
import { IdGenerator } from "@/shared/id-generator";

import { AuthenticationSession } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError, InvalidCredentialsError } from "../../../../domain/errors";
import { AuthenticationAccountRepository, AuthenticationSessionRepository } from "../../../../domain/interfaces";
import { ExpirationDate } from "../../../../domain/value-objects";
import { TokenProvider } from "../../../../infrastructure/providers";
import { ProviderAuthenticationStrategyFactory } from "../../../../infrastructure/strategies";
import { type LoginInput } from "./input";
import { type LoginOutput } from "./output";

@Injectable()
export class LoginUseCase {
    constructor(
        private readonly authorizationRoleApi: AuthorizationRoleApi,
        private readonly userApi: UserApi,
        private readonly idGenerator: IdGenerator,
        private readonly accountRepository: AuthenticationAccountRepository,
        private readonly sessionRepository: AuthenticationSessionRepository,
        private readonly strategyFactory: ProviderAuthenticationStrategyFactory,
        private readonly tokenProvider: TokenProvider,
    ) {}

    public async execute(input: LoginInput): Promise<LoginOutput> {
        const account = await this.accountRepository.findByEmail(input.email);
        if (!account) {
            throw new AuthenticationAccountNotFoundError();
        }
        const strategy = this.strategyFactory.create(account.provider);
        const userProfile = await strategy.authenticate(account, { password: input.password });
        if (!userProfile) {
            throw new InvalidCredentialsError();
        }
        const identityUser = await this.userApi.getUserById(account.userId);
        const role = await this.authorizationRoleApi.getRoleById(identityUser.roleId);
        const accessToken = await this.tokenProvider.generateAccessToken({
            userId: account.userId,
            email: account.email,
            roleCode: role.code,
            tenantId: identityUser.tenantId,
        });
        const refreshToken = this.tokenProvider.generateRefreshToken();
        const refreshTokenHash = await this.tokenProvider.hashRefreshToken(refreshToken);
        const now = new Date();
        const refreshTokenExpiresAt = this.tokenProvider.calculateRefreshTokenExpiration();
        const session = AuthenticationSession.create({
            id: this.idGenerator.generate(),
            authenticationAccountId: account.id,
            refreshTokenHash,
            expiresAt: ExpirationDate.create(this.tokenProvider.calculateAccessTokenExpiration()),
            refreshTokenExpiresAt: ExpirationDate.create(refreshTokenExpiresAt),
            ipAddress: input.ipAddress ?? null,
            userAgent: input.userAgent ?? null,
            createdAt: now,
            updatedAt: now,
        });
        await this.sessionRepository.create(session);
        return { sessionId: session.id, accessToken, refreshToken };
    }
}
