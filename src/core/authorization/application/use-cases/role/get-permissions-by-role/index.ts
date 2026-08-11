import { Injectable } from "@nestjs/common";

import { Permission } from "../../../../domain/entities";
import { RoleNotFoundError } from "../../../../domain/errors";
import { RoleRepository } from "../../../../domain/interfaces";

@Injectable()
export class GetPermissionsByRoleUseCase {
    constructor(private readonly roleRepository: RoleRepository) {}

    public async execute(roleId: string): Promise<Permission[]> {
        const role = await this.roleRepository.get(roleId);
        if (!role) {
            throw new RoleNotFoundError();
        }
        const permissions = await this.roleRepository.getPermissionsByRole(roleId);
        return permissions;
    }
}
