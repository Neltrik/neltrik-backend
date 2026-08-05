import { Injectable } from "@nestjs/common";

import { IdGenerator } from "@/shared/id-generator";

import { Role } from "../../../../domain/entities";
import { CodeAlreadyExistsError } from "../../../../domain/errors";
import { RoleRepository } from "../../../../domain/interfaces";
import { CreateRoleInput } from "./input";
import { CreateRoleOutput } from "./output";

@Injectable()
export class CreateRoleUseCase {
    constructor(
        private readonly roleRepository: RoleRepository,
        private readonly idGenerator: IdGenerator,
    ) {}

    public async execute(input: CreateRoleInput): Promise<CreateRoleOutput> {
        const exists = await this.roleRepository.existsByCode(input.code);
        if (exists) {
            throw new CodeAlreadyExistsError();
        }
        const now = new Date();
        const role = Role.create({
            id: this.idGenerator.generate(),
            code: input.code,
            defaultDisplayName: input.defaultDisplayName,
            description: input.description,
            createdAt: now,
            updatedAt: now,
        });
        await this.roleRepository.create(role);
        return { id: role.id };
    }
}

export type { CreateRoleInput };
