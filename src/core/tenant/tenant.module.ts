import { forwardRef, Module } from "@nestjs/common";

import { AuthorizationModule } from "@/core/authorization/authorization.module";

import { TenantApi, TenantApiImpl } from "./api";
import { SlugGenerator } from "./application/slug-generator";
import {
    CreateInvitationUseCase,
    CreateTenantUseCase,
    GetTenantUseCase,
    ListInvitationsByTenantUseCase,
    ListTenantsUseCase,
    ReactivateTenantUseCase,
    RevokeInvitationUseCase,
    SuspendTenantUseCase,
    UpdateTenantUseCase,
    ValidateInvitationUseCase,
} from "./application/use-cases";
import { ConsumeInvitationOhsUseCase, GetTenantOhsUseCase } from "./application/use-cases-ohs";
import { InvitationRepository, TenantRepository } from "./domain/interfaces";
import { PrismaInvitationRepository, PrismaTenantRepository } from "./infrastructure/repositories";
import {
    InvitationDeliveryStrategyFactory,
    MagicLinkGeneratorService,
    ManualStrategy,
} from "./infrastructure/strategies";
import { InvitationController, TenantController } from "./presentation/controllers";

@Module({
    controllers: [InvitationController, TenantController],
    providers: [
        CreateInvitationUseCase,
        CreateTenantUseCase,
        GetTenantUseCase,
        ListInvitationsByTenantUseCase,
        ListTenantsUseCase,
        ReactivateTenantUseCase,
        RevokeInvitationUseCase,
        SuspendTenantUseCase,
        UpdateTenantUseCase,
        ValidateInvitationUseCase,
        ConsumeInvitationOhsUseCase,
        GetTenantOhsUseCase,
        SlugGenerator,
        InvitationDeliveryStrategyFactory,
        MagicLinkGeneratorService,
        ManualStrategy,
        {
            provide: TenantApi,
            useClass: TenantApiImpl,
        },
        {
            provide: InvitationRepository,
            useClass: PrismaInvitationRepository,
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
