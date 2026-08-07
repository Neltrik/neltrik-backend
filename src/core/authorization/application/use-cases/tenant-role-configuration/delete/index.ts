import { Injectable } from "@nestjs/common";

import { TenantRoleConfigurationNotFoundError } from "../../../../domain/errors";
import { TenantRoleConfigurationRepository } from "../../../../domain/interfaces";

@Injectable()
export class DeleteTenantRoleConfigurationUseCase {
    constructor(private readonly tenantRoleConfigurationRepository: TenantRoleConfigurationRepository) {}

    public async execute(id: string): Promise<void> {
        const configuration = await this.tenantRoleConfigurationRepository.get(id);
        if (!configuration) {
            throw new TenantRoleConfigurationNotFoundError();
        }
        await this.tenantRoleConfigurationRepository.delete(configuration.id);
    }
}
