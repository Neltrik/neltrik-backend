import { Injectable } from "@nestjs/common";

import { TenantRoleConfigurationRepository } from "../../../../domain/interfaces";
import { ListTenantRoleConfigurationsInput } from "./input";

@Injectable()
export class ListTenantRoleConfigurationsUseCase {
    constructor(private readonly tenantRoleConfigurationRepository: TenantRoleConfigurationRepository) {}

    public async execute(input: ListTenantRoleConfigurationsInput) {
        return this.tenantRoleConfigurationRepository.list(input.tenantId);
    }
}

export type { ListTenantRoleConfigurationsInput };
