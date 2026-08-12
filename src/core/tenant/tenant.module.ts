import { Module } from "@nestjs/common";

import { TenantApi, TenantApiImpl } from "./api";
import { SlugGenerator } from "./application/slug-generator";
import {
    CreateTenantUseCase,
    GetTenantUseCase,
    ListTenantsUseCase,
    ReactivateTenantUseCase,
    SuspendTenantUseCase,
    UpdateTenantUseCase,
} from "./application/use-cases";
import { TenantRepository } from "./domain/interfaces";
import { PrismaTenantRepository } from "./infrastructure/repositories";
import { TenantController } from "./presentation/controllers/tenant";

@Module({
    controllers: [TenantController],
    providers: [
        CreateTenantUseCase,
        GetTenantUseCase,
        ListTenantsUseCase,
        ReactivateTenantUseCase,
        SuspendTenantUseCase,
        UpdateTenantUseCase,
        SlugGenerator,
        {
            provide: TenantApi,
            useClass: TenantApiImpl,
        },
        {
            provide: TenantRepository,
            useClass: PrismaTenantRepository,
        },
    ],
    exports: [TenantApi],
})
export class TenantModule {}
