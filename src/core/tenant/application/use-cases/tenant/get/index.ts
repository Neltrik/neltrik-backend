import { Injectable } from "@nestjs/common";

import { AuthorizationRoleApi } from "@/core/authorization/api";

import { TenantNotFoundError } from "../../../../domain/errors";
import { TenantRepository } from "../../../../domain/interfaces";
import { GetTenantOutput } from "./output";

@Injectable()
export class GetTenantUseCase {
    constructor(
        private readonly tenantRepository: TenantRepository,
        private readonly authorizationRoleApi: AuthorizationRoleApi,
    ) {}

    public async execute(id: string): Promise<GetTenantOutput> {
        const tenant = await this.tenantRepository.get(id);
        if (!tenant) {
            throw new TenantNotFoundError();
        }
        const roles = await this.authorizationRoleApi.getRolesByTenantId(id);
        return { tenant, roles };
    }
}
