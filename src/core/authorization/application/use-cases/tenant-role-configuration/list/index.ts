import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";

import { TenantRoleConfigurationRepository } from "../../../../domain/interfaces";

@Injectable()
export class ListTenantRoleConfigurationUseCase {
    constructor(
        private readonly tenantRoleConfigurationRepository: TenantRoleConfigurationRepository,
        private readonly tenantApi: TenantApi,
    ) {}

    public async execute(tenantId: string) {
        await this.tenantApi.validate(tenantId);
        return this.tenantRoleConfigurationRepository.list(tenantId);
    }
}
