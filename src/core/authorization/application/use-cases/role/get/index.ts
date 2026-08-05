import { Injectable } from "@nestjs/common";

import type { Role } from "../../../../domain/entities";
import { RoleNotFoundError } from "../../../../domain/errors";
import { RoleRepository } from "../../../../domain/interfaces";

@Injectable()
export class GetRoleUseCase {
    constructor(private readonly roleRepository: RoleRepository) {}

    public async execute(id: string): Promise<Role> {
        const role = await this.roleRepository.get(id);
        if (!role) {
            throw new RoleNotFoundError();
        }
        return role;
    }
}
