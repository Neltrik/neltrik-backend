import { Injectable } from "@nestjs/common";

import { PermissionNotFoundError } from "../../../../domain/errors";
import { PermissionRepository } from "../../../../domain/interfaces";
import { UpdatePermissionInput } from "./input";
import { UpdatePermissionOutput } from "./output";

@Injectable()
export class UpdatePermissionUseCase {
    constructor(private readonly permissionRepository: PermissionRepository) {}

    public async execute(input: UpdatePermissionInput): Promise<UpdatePermissionOutput> {
        const permission = await this.permissionRepository.get(input.id);
        if (!permission) {
            throw new PermissionNotFoundError();
        }
        const update: {
            description?: string;
        } = {};
        if (input.description !== undefined) {
            update.description = input.description;
        }
        permission.update(update);
        await this.permissionRepository.update(permission);
        return { id: permission.id };
    }
}

export type { UpdatePermissionInput };
