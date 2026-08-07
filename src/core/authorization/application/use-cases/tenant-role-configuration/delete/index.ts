import { Injectable } from "@nestjs/common";

import { TenantRoleConfigurationNotFoundError } from "../../../../domain/errors";
import { TenantRoleConfigurationRepository } from "../../../../domain/interfaces";
import { DeleteTenantRoleConfigurationInput } from "./input";

@Injectable()
export class DeleteTenantRoleConfigurationUseCase {
    constructor(private readonly tenantRoleConfigurationRepository: TenantRoleConfigurationRepository) {}

    public async execute(input: DeleteTenantRoleConfigurationInput): Promise<void> {
        const configuration = await this.tenantRoleConfigurationRepository.get(input.id);
        if (!configuration) {
            throw new TenantRoleConfigurationNotFoundError();
        }
        await this.tenantRoleConfigurationRepository.delete(configuration.id);
    }
}

export type { DeleteTenantRoleConfigurationInput };
