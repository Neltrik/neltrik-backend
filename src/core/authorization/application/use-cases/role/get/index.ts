import { Injectable } from "@nestjs/common";

import { RoleNotFoundError } from "../../../../domain/errors";
import { RoleRepository } from "../../../../domain/interfaces";
import { GetRoleOutput } from "./output";

@Injectable()
export class GetRoleUseCase {
    constructor(private readonly roleRepository: RoleRepository) {}

    public async execute(roleId: string): Promise<GetRoleOutput> {
        const role = await this.roleRepository.get(roleId);
        if (!role) {
            throw new RoleNotFoundError();
        }
        const permissions = await this.roleRepository.getPermissionsByRole(roleId);
        return {
            id: role.id,
            code: role.code,
            defaultDisplayName: role.defaultDisplayName,
            description: role.description,
            scope: role.scope,
            permissions,
        };
    }
}
