import { Injectable } from "@nestjs/common";

import { TenantNotFoundError } from "../../../../domain/errors";
import { TenantRepository } from "../../../../domain/interfaces";
import { type UpdateTenantInput } from "./input";
import { type UpdateTenantOutput } from "./output";

@Injectable()
export class UpdateTenantUseCase {
    constructor(private readonly tenantRepository: TenantRepository) {}

    public async execute(input: UpdateTenantInput): Promise<UpdateTenantOutput> {
        const tenant = await this.tenantRepository.get(input.id);
        if (!tenant) {
            throw new TenantNotFoundError();
        }
        tenant.update(input.name);
        await this.tenantRepository.update(tenant);
        return { id: tenant.id };
    }
}

export { UpdateTenantInput };
