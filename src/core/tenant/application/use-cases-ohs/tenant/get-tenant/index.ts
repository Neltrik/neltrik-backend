import { Injectable } from "@nestjs/common";

import type { Tenant } from "../../../../domain/entities";
import { TenantNotFoundError } from "../../../../domain/errors";
import { TenantRepository } from "../../../../domain/interfaces";

@Injectable()
export class GetTenantOhsUseCase {
    constructor(private readonly tenantRepository: TenantRepository) {}

    public async execute(id: string): Promise<Tenant> {
        const tenant = await this.tenantRepository.get(id);
        if (!tenant) {
            throw new TenantNotFoundError();
        }
        return tenant;
    }
}
