import { Injectable } from "@nestjs/common";

import { TenantRoleConfigurationNotFoundError } from "../../../../domain/errors";
import { TenantRoleConfigurationRepository } from "../../../../domain/interfaces";
import { DisplayName } from "../../../../domain/value-objects";
import { UpdateTenantRoleConfigurationInput } from "./input";
import { UpdateTenantRoleConfigurationOutput } from "./output";

@Injectable()
export class UpdateTenantRoleConfigurationUseCase {
    constructor(private readonly tenantRoleConfigurationRepository: TenantRoleConfigurationRepository) {}

    public async execute(input: UpdateTenantRoleConfigurationInput): Promise<UpdateTenantRoleConfigurationOutput> {
        const configuration = await this.tenantRoleConfigurationRepository.get(input.id);
        if (!configuration) {
            throw new TenantRoleConfigurationNotFoundError();
        }
        configuration.update({ displayName: DisplayName.create(input.displayName) });
        await this.tenantRoleConfigurationRepository.update(configuration);
        return { id: configuration.id };
    }
}

export type { UpdateTenantRoleConfigurationInput };
