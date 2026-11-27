import { forwardRef, HttpStatus, Module, OnModuleInit } from "@nestjs/common";

import { AuthorizationModule } from "@/core/authorization/authorization.module";
import { CompanyModule } from "@/core/company/company.module";
import { IdentityModule } from "@/core/identity/identity.module";
import { DomainStatusRegistry } from "@/shared/http";

import { InvitationApi, InvitationApiImpl, TenantApi, TenantApiImpl } from "./api";
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
import {
    ConsumeInvitationOhsUseCase,
    GetTenantOhsUseCase,
    ListTenantsOhsUseCase,
    ValidateInvitationOhsUseCase,
} from "./application/use-cases-ohs";
import { DOMAIN_ERROR_CODES } from "./domain/errors/messages";
import { InvitationRepository, TenantRepository } from "./domain/interfaces";
import { PrismaInvitationRepository, PrismaTenantRepository } from "./infrastructure/repositories";
import {
    InvitationDeliveryStrategyFactory,
    MagicLinkGeneratorService,
    ManualStrategy,
} from "./infrastructure/strategies";
import { InvitationController, TenantController, TenantLifecycleController } from "./presentation/controllers";

@Module({
    controllers: [InvitationController, TenantController, TenantLifecycleController],
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
        ListTenantsOhsUseCase,
        ValidateInvitationOhsUseCase,
        SlugGenerator,
        InvitationDeliveryStrategyFactory,
        MagicLinkGeneratorService,
        ManualStrategy,
        {
            provide: InvitationApi,
            useClass: InvitationApiImpl,
        },
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
    imports: [forwardRef(() => AuthorizationModule), CompanyModule, forwardRef(() => IdentityModule)],
    exports: [TenantApi, InvitationApi],
})
export class TenantModule implements OnModuleInit {
    public onModuleInit(): void {
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.TENANT_ALREADY_SUSPENDED, HttpStatus.CONFLICT);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.TENANT_ALREADY_ACTIVE, HttpStatus.CONFLICT);
    }
}
