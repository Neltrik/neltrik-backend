import { Injectable } from "@nestjs/common";

import { IdGenerator } from "@/shared/id-generator";

import { TenantRoleConfiguration } from "../../../../domain/entities";
import { TenantRoleConfigurationAlreadyExistsError } from "../../../../domain/errors";
import { TenantRoleConfigurationRepository } from "../../../../domain/interfaces";
import { DisplayName } from "../../../../domain/value-objects";
import { CreateTenantRoleConfigurationInput } from "./input";
import { CreateTenantRoleConfigurationOutput } from "./output";

@Injectable()
export class CreateTenantRoleConfigurationUseCase {
    constructor(
        private readonly tenantRoleConfigurationRepository: TenantRoleConfigurationRepository,
        private readonly idGenerator: IdGenerator,
    ) {}

    public async execute(input: CreateTenantRoleConfigurationInput): Promise<CreateTenantRoleConfigurationOutput> {
        const exists = await this.tenantRoleConfigurationRepository.findByTenantAndRole(input.tenantId, input.roleId);
        if (exists) {
            throw new TenantRoleConfigurationAlreadyExistsError();
        }
        const now = new Date();
        const configuration = TenantRoleConfiguration.create({
            id: this.idGenerator.generate(),
            tenantId: input.tenantId,
            roleId: input.roleId,
            displayName: DisplayName.create(input.displayName),
            createdAt: now,
            updatedAt: now,
        });
        await this.tenantRoleConfigurationRepository.create(configuration);
        return { id: configuration.id };
    }
}

export type { CreateTenantRoleConfigurationInput };
