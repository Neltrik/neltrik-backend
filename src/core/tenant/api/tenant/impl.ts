import { Injectable } from "@nestjs/common";

import { GetTenantUseCase } from "../../application/use-cases";
import { TenantApi } from "./contract";

@Injectable()
export class TenantApiImpl extends TenantApi {
    constructor(private readonly getTenantUseCase: GetTenantUseCase) {
        super();
    }

    public async validate(id: string): Promise<void> {
        await this.getTenantUseCase.execute(id);
    }
}
