import { Injectable } from "@nestjs/common";

import { GetTenantOhsUseCase, ListTenantsOhsUseCase } from "../../application/use-cases-ohs";
import { TENANT_TYPE } from "../../domain/types";
import { TenantApi } from "./contract";
import { TenantResultDto } from "./result.dto";

@Injectable()
export class TenantApiImpl extends TenantApi {
    constructor(
        private readonly getTenantOhsUseCase: GetTenantOhsUseCase,
        private readonly listTenantsOhsUseCase: ListTenantsOhsUseCase,
    ) {
        super();
    }

    public async validate(id: string): Promise<void> {
        await this.getTenantOhsUseCase.execute(id);
    }

    public async isPlatformTenant(id: string): Promise<boolean> {
        const tenant = await this.getTenantOhsUseCase.execute(id);
        return tenant.type === TENANT_TYPE.PLATFORM;
    }

    public async list(): Promise<TenantResultDto[]> {
        const tenants = await this.listTenantsOhsUseCase.execute();
        return tenants.map((t) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            type: t.type,
            status: t.status,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            suspendedAt: t.suspendedAt,
        }));
    }
}
