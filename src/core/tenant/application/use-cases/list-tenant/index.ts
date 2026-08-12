import { Injectable } from "@nestjs/common";

import { Tenant } from "../../../domain/entities";
import { TenantRepository } from "../../../domain/interfaces";

@Injectable()
export class ListTenantsUseCase {
    constructor(private readonly tenantRepository: TenantRepository) {}

    public async execute(): Promise<Tenant[]> {
        const tenants = await this.tenantRepository.list();
        return tenants;
    }
}
