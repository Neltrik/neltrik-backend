import { Injectable } from "@nestjs/common";

import { TransactionManager } from "@/shared/transaction";

import { PermissionNotFoundError, RoleNotFoundError } from "../../../../domain/errors";
import { PermissionRepository, RoleRepository } from "../../../../domain/interfaces";
import { AssignPermissionsToRoleInput } from "./input";
import { AssignPermissionsToRoleOutput } from "./output";

@Injectable()
export class AssignPermissionsToRoleUseCase {
    constructor(
        private readonly roleRepository: RoleRepository,
        private readonly permissionRepository: PermissionRepository,
        private readonly transactionManager: TransactionManager,
    ) {}

    public async execute(input: AssignPermissionsToRoleInput): Promise<AssignPermissionsToRoleOutput> {
        const permissionIds = [...new Set(input.permissionIds)];
        return this.transactionManager.execute(async (context) => {
            const role = await this.roleRepository.get(input.roleId);
            if (!role) {
                throw new RoleNotFoundError();
            }
            const permissions = await this.permissionRepository.getByIds(permissionIds);
            if (permissions.length !== permissionIds.length) {
                throw new PermissionNotFoundError();
            }
            role.assignPermissions(permissionIds);
            await this.roleRepository.assignPermissions(input.roleId, permissionIds, context);
            return { id: role.id };
        });
    }
}

export type { AssignPermissionsToRoleInput };
