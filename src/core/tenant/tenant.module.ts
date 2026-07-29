import { Module } from "@nestjs/common";

import { SlugGenerator } from "./application/slug-generator";
import {
    CreateTenantUseCase,
    GetTenantUseCase,
    SuspendTenantUseCase,
    UpdateTenantUseCase,
} from "./application/use-cases";
import { TenantRepository } from "./domain/interfaces/tenant-repository";
import { PrismaTenantRepository } from "./infrastructure/repositories/prisma-tenant.repository";
import { TenantController } from "./presentation/controllers/tenant";

@Module({
    controllers: [TenantController],
    providers: [
        CreateTenantUseCase,
        GetTenantUseCase,
        SuspendTenantUseCase,
        UpdateTenantUseCase,
        SlugGenerator,
        {
            provide: TenantRepository,
            useClass: PrismaTenantRepository,
        },
    ],
})
export class TenantModule {}
