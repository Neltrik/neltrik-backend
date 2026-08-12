import { Injectable } from "@nestjs/common";

import { GetTenantUseCase } from "../../application/use-cases";
import { TENANT_TYPE } from "../../domain/types";
import { TenantApi } from "./contract";

@Injectable()
export class TenantApiImpl extends TenantApi {
    constructor(private readonly getTenantUseCase: GetTenantUseCase) {
        super();
    }

    public async validate(id: string): Promise<void> {
        await this.getTenantUseCase.execute(id);
    }

    public async isPlatformTenant(id: string): Promise<boolean> {
        const tenant = await this.getTenantUseCase.execute(id);
        return tenant.type === TENANT_TYPE.PLATFORM;
    }
}
