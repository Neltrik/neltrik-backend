import { Injectable } from "@nestjs/common";

import type { Role } from "../../../../domain/entities";
import { RoleRepository } from "../../../../domain/interfaces";

@Injectable()
export class ListRolesUseCase {
    constructor(private readonly roleRepository: RoleRepository) {}

    public execute(): Promise<Role[]> {
        return this.roleRepository.list();
    }
}
