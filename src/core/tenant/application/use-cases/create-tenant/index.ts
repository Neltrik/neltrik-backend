import { Injectable } from "@nestjs/common";

import { IdGenerator } from "@/shared/id-generator";

import { Tenant } from "../../../domain/entities";
import { TenantRepository } from "../../../domain/interfaces";
import { SlugGenerator } from "../../slug-generator";
import { type CreateTenantInput } from "./input";
import { CreateTenantOutput } from "./output";

@Injectable()
export class CreateTenantUseCase {
    constructor(
        private readonly tenantRepository: TenantRepository,
        private readonly idGenerator: IdGenerator,
        private readonly slugGenerator: SlugGenerator,
    ) {}

    public async execute(input: CreateTenantInput): Promise<CreateTenantOutput> {
        const id = this.idGenerator.generate();
        const slug = this.slugGenerator.generate(input.name, id);
        const now = new Date();
        const tenant = Tenant.create({
            id,
            name: input.name,
            slug,
            createdAt: now,
            updatedAt: now,
            suspendedAt: null,
        });
        await this.tenantRepository.create(tenant);
        return { id: tenant.id };
    }
}

export { CreateTenantInput };
