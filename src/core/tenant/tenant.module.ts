import { Module } from "@nestjs/common";

import { SlugGenerator } from "./application/slug-generator";
import { CreateTenantUseCase } from "./application/use-cases/create-tenant";
import { TenantRepository } from "./domain/interfaces/tenant-repository";
import { PrismaTenantRepository } from "./infrastructure/repositories/prisma-tenant.repository";
import { TenantController } from "./presentation/controllers/tenant";

@Module({
    controllers: [TenantController],
    providers: [
        CreateTenantUseCase,
        SlugGenerator,
        {
            provide: TenantRepository,
            useClass: PrismaTenantRepository,
        },
    ],
})
export class TenantModule {}
