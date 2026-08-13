import { Injectable } from "@nestjs/common";

import { GetTenantOhsUseCase } from "../../application/use-cases-ohs";
import { TENANT_TYPE } from "../../domain/types";
import { TenantApi } from "./contract";

@Injectable()
export class TenantApiImpl extends TenantApi {
    constructor(private readonly getTenantOhsUseCase: GetTenantOhsUseCase) {
        super();
    }

    public async validate(id: string): Promise<void> {
        await this.getTenantOhsUseCase.execute(id);
    }

    public async isPlatformTenant(id: string): Promise<boolean> {
        const tenant = await this.getTenantOhsUseCase.execute(id);
        return tenant.type === TENANT_TYPE.PLATFORM;
    }
}
