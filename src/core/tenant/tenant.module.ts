import { forwardRef, Module } from "@nestjs/common";

import { AuthorizationModule } from "@/core/authorization/authorization.module";

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
import { GetTenantOhsUseCase } from "./application/use-cases-ohs";
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
        GetTenantOhsUseCase,
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
    imports: [forwardRef(() => AuthorizationModule)],
    exports: [TenantApi],
})
export class TenantModule {}
