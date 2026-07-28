import { Module } from "@nestjs/common";

import { IdGenerator } from "@/shared/id-generator";

import { SlugGenerator } from "./application/slug-generator";
import { CreateTenantUseCase } from "./application/use-cases/create-tenant";
import { TenantRepository } from "./domain/interfaces/tenant-repository";
import { PrismaTenantRepository } from "./infrastructure/repositories/prisma-tenant.repository";

@Module({
    providers: [
        CreateTenantUseCase,
        SlugGenerator,
        {
            provide: TenantRepository,
            useClass: PrismaTenantRepository,
        },
        {
            provide: IdGenerator,
            useExisting: IdGenerator,
        },
    ],
})
export class TenantModule {}
