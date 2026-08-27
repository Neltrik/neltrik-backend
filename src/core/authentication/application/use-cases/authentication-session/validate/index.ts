import { Injectable } from "@nestjs/common";

import { AuthorizationRoleApi } from "@/core/authorization/api";
import { UserApi } from "@/core/identity/api";

import {
    AuthenticationAccountNotFoundError,
    SessionExpiredError,
    SessionNotFoundError,
    SessionRevokedError,
} from "../../../../domain/errors";
import { AuthenticationAccountRepository, AuthenticationSessionRepository } from "../../../../domain/interfaces";
import { type ValidateSessionOutput } from "./output";

@Injectable()
export class ValidateSessionUseCase {
    constructor(
        private readonly authorizationRoleApi: AuthorizationRoleApi,
        private readonly userApi: UserApi,
        private readonly accountRepository: AuthenticationAccountRepository,
        private readonly sessionRepository: AuthenticationSessionRepository,
    ) {}

    public async execute(sessionId: string): Promise<ValidateSessionOutput> {
        const session = await this.sessionRepository.findById(sessionId);
        if (!session) {
            throw new SessionNotFoundError();
        }
        if (session.isExpired()) {
            throw new SessionExpiredError();
        }
        if (session.isRevoked()) {
            throw new SessionRevokedError();
        }
        const account = await this.accountRepository.findById(session.authenticationAccountId);
        if (!account) {
            throw new AuthenticationAccountNotFoundError();
        }
        const identityUser = await this.userApi.getUserById(account.userId);
        const role = await this.authorizationRoleApi.getRoleById(identityUser.roleId);
        return {
            authenticationAccountId: account.id,
            userId: account.userId,
            email: account.email,
            tenantId: identityUser.tenantId,
            roleCode: role.code,
        };
    }
}
