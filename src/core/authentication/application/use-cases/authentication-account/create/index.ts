import { Injectable } from "@nestjs/common";

import { AuthorizationRoleApi } from "@/core/authorization/api";
import { UserApi } from "@/core/identity/api";
import { TenantApi } from "@/core/tenant/api";
import { IdGenerator } from "@/shared/id-generator";

import { AuthenticationAccount } from "../../../../domain/entities";
import { AuthenticationAccountRepository, PasswordHasher } from "../../../../domain/interfaces";
import { AuthenticationProvider } from "../../../../domain/value-objects";
import { CreateAuthenticationAccountInput } from "./input";
import { CreateAuthenticationAccountOutput } from "./output";

@Injectable()
export class CreateAuthenticationAccountUseCase {
    constructor(
        private readonly authorizationRoleApi: AuthorizationRoleApi,
        private readonly userApi: UserApi,
        private readonly tenantApi: TenantApi,
        private readonly idGenerator: IdGenerator,
        private readonly authenticationAccountRepository: AuthenticationAccountRepository,
        private readonly passwordHasher: PasswordHasher,
    ) {}

    public async execute(input: CreateAuthenticationAccountInput): Promise<CreateAuthenticationAccountOutput> {
        await this.authorizationRoleApi.validate(input.roleId);
        await this.tenantApi.validate(input.tenantId);
        const passwordHash = await this.passwordHasher.hash(input.password);
        const user = await this.userApi.create({
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            roleId: input.roleId,
            tenantId: input.tenantId,
        });
        const now = new Date();
        const account = AuthenticationAccount.create({
            id: this.idGenerator.generate(),
            userId: user.id,
            email: input.email,
            provider: AuthenticationProvider.create(input.provider),
            passwordHash,
            createdAt: now,
            updatedAt: now,
        });
        await this.authenticationAccountRepository.create(account);
        return { id: account.id };
    }
}

export type { CreateAuthenticationAccountInput };
