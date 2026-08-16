import { Injectable } from "@nestjs/common";

import { AuthorizationRoleApi } from "@/core/authorization/api";

import { UserRepository } from "../../../domain/interfaces";
import type { GetUsersInput } from "./input";
import { GetUsersOutput } from "./output";

@Injectable()
export class GetUsersUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly authorizationRoleApi: AuthorizationRoleApi,
    ) {}

    public async execute(input: GetUsersInput): Promise<GetUsersOutput[]> {
        const users = await this.userRepository.list(input.tenantId);
        return Promise.all(
            users.map(async (user) => {
                const role = await this.authorizationRoleApi.getRoleById(user.roleId);
                return {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    tenantId: user.tenantId,
                    role,
                    status: user.status,
                    suspendedAt: user.suspendedAt,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                };
            }),
        );
    }
}

export type { GetUsersInput };
