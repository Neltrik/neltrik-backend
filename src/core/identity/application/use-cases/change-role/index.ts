import { Injectable } from "@nestjs/common";

import { AuthorizationRoleApi } from "@/core/authorization/api";

import { UserNotFoundError } from "../../../domain/errors";
import { UserRepository } from "../../../domain/interfaces";
import { ChangeRoleUserInput } from "./input";
import { ChangeRoleUserOutput } from "./output";

@Injectable()
export class ChangeRoleUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly authorizationRoleApi: AuthorizationRoleApi,
    ) {}

    public async execute(input: ChangeRoleUserInput): Promise<ChangeRoleUserOutput> {
        const user = await this.userRepository.get(input.id);
        if (!user) {
            throw new UserNotFoundError();
        }
        await this.authorizationRoleApi.validate(input.roleId);
        await this.authorizationRoleApi.validateForTenant({ roleId: input.roleId, tenantId: user.tenantId });
        user.update({ roleId: input.roleId });
        await this.userRepository.update(user);
        return { id: user.id };
    }
}

export type { ChangeRoleUserInput };
