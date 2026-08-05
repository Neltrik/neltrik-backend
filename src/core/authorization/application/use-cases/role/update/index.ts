import { Injectable } from "@nestjs/common";

import { RoleNotFoundError } from "../../../../domain/errors";
import { RoleRepository } from "../../../../domain/interfaces";
import { UpdateRoleInput } from "./input";
import { UpdateRoleOutput } from "./output";

@Injectable()
export class UpdateRoleUseCase {
    constructor(private readonly roleRepository: RoleRepository) {}

    public async execute(input: UpdateRoleInput): Promise<UpdateRoleOutput> {
        const role = await this.roleRepository.get(input.id);
        const update: {
            defaultDisplayName?: string;
            description?: string;
        } = {};
        if (!role) {
            throw new RoleNotFoundError();
        }
        if (input.defaultDisplayName !== undefined) {
            update.defaultDisplayName = input.defaultDisplayName;
        }
        if (input.description !== undefined) {
            update.description = input.description;
        }
        role.update(update);
        await this.roleRepository.update(role);
        return { id: role.id };
    }
}

export type { UpdateRoleInput };
