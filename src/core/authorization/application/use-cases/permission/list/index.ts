import { Injectable } from "@nestjs/common";

import type { Permission } from "../../../../domain/entities";
import { PermissionRepository } from "../../../../domain/interfaces";

@Injectable()
export class ListPermissionsUseCase {
    constructor(private readonly permissionRepository: PermissionRepository) {}

    public execute(): Promise<Permission[]> {
        return this.permissionRepository.list();
    }
}
