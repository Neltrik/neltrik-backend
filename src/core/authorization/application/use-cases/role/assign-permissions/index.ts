import { Injectable } from "@nestjs/common";

import { TransactionManager } from "@/shared/transaction";

import {
    IncompatiblePermissionScopeError,
    PermissionNotFoundError,
    RoleNotFoundError,
} from "../../../../domain/errors";
import { PermissionRepository, RoleRepository } from "../../../../domain/interfaces";
import { PERMISSION_SCOPE, ROLE_SCOPE } from "../../../../domain/types";
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
            const hasIncompatibleScope = permissions.some(
                (permission) => permission.scope === PERMISSION_SCOPE.PLATFORM && role.scope !== ROLE_SCOPE.PLATFORM,
            );
            if (hasIncompatibleScope) {
                throw new IncompatiblePermissionScopeError();
            }
            role.assignPermissions(permissionIds);
            await this.roleRepository.assignPermissions(input.roleId, permissionIds, context);
            return { id: role.id };
        });
    }
}

export type { AssignPermissionsToRoleInput };
