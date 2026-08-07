import { Injectable } from "@nestjs/common";

import { TenantRoleConfigurationRepository } from "../../../../domain/interfaces";

@Injectable()
export class ListTenantRoleConfigurationUseCase {
    constructor(private readonly tenantRoleConfigurationRepository: TenantRoleConfigurationRepository) {}

    public async execute(id: string) {
        return this.tenantRoleConfigurationRepository.list(id);
    }
}
