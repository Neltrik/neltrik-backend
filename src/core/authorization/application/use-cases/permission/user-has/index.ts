import { Injectable } from "@nestjs/common";

import { UserApi } from "@/core/identity/api";

import { RoleRepository } from "../../../../domain/interfaces";
import { UserHasPermissionInput } from "./input";

@Injectable()
export class UserHasPermissionUseCase {
    constructor(
        private readonly userApi: UserApi,
        private readonly roleRepository: RoleRepository,
    ) {}

    public async execute(input: UserHasPermissionInput): Promise<boolean> {
        const user = await this.userApi.getUserById(input.userId);
        const permissions = await this.roleRepository.getPermissionsByRole(user.roleId);
        const hasPermission = permissions.some((permission) => permission.code === input.code);
        return hasPermission;
    }
}
