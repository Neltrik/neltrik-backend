import { Injectable } from "@nestjs/common";

import { TransactionManager } from "@/shared/transaction";

import { PermissionNotFoundError, RoleNotFoundError } from "../../../../domain/errors";
import { PermissionRepository, RoleRepository } from "../../../../domain/interfaces";
import { RemovePermissionsFromRoleInput } from "./input";
import { RemovePermissionsFromRoleOutput } from "./output";

@Injectable()
export class RemovePermissionsFromRoleUseCase {
    constructor(
        private readonly roleRepository: RoleRepository,
        private readonly permissionRepository: PermissionRepository,
        private readonly transactionManager: TransactionManager,
    ) {}

    public async execute(input: RemovePermissionsFromRoleInput): Promise<RemovePermissionsFromRoleOutput> {
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
            role.removePermissions(permissionIds);
            await this.roleRepository.removePermissions(input.roleId, permissionIds, context);
            return { id: role.id };
        });
    }
}

export type { RemovePermissionsFromRoleInput };
