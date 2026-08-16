import { Injectable } from "@nestjs/common";

import { AuthorizationRoleApi } from "@/core/authorization/api";
import { TenantApi } from "@/core/tenant/api";
import { IdGenerator } from "@/shared/id-generator";

import { User } from "../../../domain/entities";
import { EmailAlreadyExistsError } from "../../../domain/errors";
import { UserRepository } from "../../../domain/interfaces";
import { Email } from "../../../domain/value-objects/email";
import { RegisterUserInput } from "./input";
import { RegisterUserOutput } from "./output";

@Injectable()
export class RegisterUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly authorizationRoleApi: AuthorizationRoleApi,
        private readonly tenantApi: TenantApi,
        private readonly idGenerator: IdGenerator,
    ) {}

    public async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
        await this.tenantApi.validate(input.tenantId);
        await this.authorizationRoleApi.validate(input.roleId);
        await this.authorizationRoleApi.validateForTenant({ roleId: input.roleId, tenantId: input.tenantId });
        const email = Email.create(input.email);
        const exists = await this.userRepository.existsByEmail(email);
        if (exists) {
            throw new EmailAlreadyExistsError();
        }
        const now = new Date();
        const user = User.create({
            id: this.idGenerator.generate(),
            firstName: input.firstName,
            lastName: input.lastName,
            email,
            tenantId: input.tenantId,
            roleId: input.roleId,
            createdAt: now,
            updatedAt: now,
            suspendedAt: null,
        });
        await this.userRepository.create(user);
        return { id: user.id };
    }
}

export type { RegisterUserInput };
