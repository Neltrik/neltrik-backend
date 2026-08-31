import { Injectable } from "@nestjs/common";

import { UserApi } from "@/core/identity/api";

import type { Permission } from "../../../../domain/entities";
import { RoleRepository } from "../../../../domain/interfaces";

@Injectable()
export class GetUserEffectivePermissionsUseCase {
    constructor(
        private readonly userApi: UserApi,
        private readonly roleRepository: RoleRepository,
    ) {}

    public async execute(userId: string): Promise<Permission[]> {
        const user = await this.userApi.getUserById(userId);
        const permissions = await this.roleRepository.getPermissionsByRole(user.roleId);
        return permissions;
    }
}
