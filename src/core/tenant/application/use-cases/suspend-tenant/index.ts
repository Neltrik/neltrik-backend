import { Injectable } from "@nestjs/common";

import { TenantNotFoundError } from "../../../domain/errors";
import { TenantRepository } from "../../../domain/interfaces";

@Injectable()
export class SuspendTenantUseCase {
    constructor(private readonly tenantRepository: TenantRepository) {}

    public async execute(id: string): Promise<void> {
        const tenant = await this.tenantRepository.get(id);
        if (!tenant) {
            throw new TenantNotFoundError();
        }
        tenant.suspend();
        await this.tenantRepository.update(tenant);
    }
}
