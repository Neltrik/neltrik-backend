import { Injectable } from "@nestjs/common";

import { AuthorizationRoleApi } from "@/core/authorization/api";

import { UserNotFoundError } from "../../../domain/errors";
import { UserRepository } from "../../../domain/interfaces";
import { UpdateUserInput } from "./input";
import { UpdateUserOutput } from "./output";

@Injectable()
export class UpdateUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly authorizationRoleApi: AuthorizationRoleApi,
    ) {}

    public async execute(input: UpdateUserInput): Promise<UpdateUserOutput> {
        const user = await this.userRepository.get(input.id);
        const update: {
            firstName?: string;
            lastName?: string;
            roleId?: string;
        } = {};
        if (!user) {
            throw new UserNotFoundError();
        }
        if (input.firstName !== undefined) {
            update.firstName = input.firstName;
        }
        if (input.lastName !== undefined) {
            update.lastName = input.lastName;
        }
        if (input.roleId !== undefined) {
            await this.authorizationRoleApi.validate(input.roleId);
            await this.authorizationRoleApi.validateForTenant({ roleId: input.roleId, tenantId: user.tenantId });
            update.roleId = input.roleId;
        }
        user.update(update);
        await this.userRepository.update(user);
        return { id: user.id };
    }
}

export type { UpdateUserInput };
