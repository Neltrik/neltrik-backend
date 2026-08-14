import { Injectable } from "@nestjs/common";

import { IdGenerator } from "@/shared/id-generator";

import { Permission } from "../../../../domain/entities";
import { CodeAlreadyExistsError } from "../../../../domain/errors";
import { PermissionRepository } from "../../../../domain/interfaces";
import { CreatePermissionInput } from "./input";
import { CreatePermissionOutput } from "./output";

@Injectable()
export class CreatePermissionUseCase {
    constructor(
        private readonly permissionRepository: PermissionRepository,
        private readonly idGenerator: IdGenerator,
    ) {}

    public async execute(input: CreatePermissionInput): Promise<CreatePermissionOutput> {
        const exists = await this.permissionRepository.existsByCode(input.code);
        if (exists) {
            throw new CodeAlreadyExistsError();
        }
        const now = new Date();
        const permission = Permission.create({
            id: this.idGenerator.generate(),
            code: input.code,
            description: input.description,
            scope: input.scope,
            createdAt: now,
            updatedAt: now,
        });
        await this.permissionRepository.create(permission);
        return { id: permission.id };
    }
}

export type { CreatePermissionInput };
