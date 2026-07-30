import { Module } from "@nestjs/common";

import { SlugGenerator } from "./application/slug-generator";
import {
    CreateTenantUseCase,
    GetTenantUseCase,
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
        ReactivateTenantUseCase,
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
