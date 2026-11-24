import { HttpStatus, Module, OnModuleInit } from "@nestjs/common";

import { AuthorizationModule } from "@/core/authorization/authorization.module";
import { IdentityModule } from "@/core/identity/identity.module";
import { NotificationsModule } from "@/core/notifications/notifications.module";
import { TenantModule } from "@/core/tenant/tenant.module";
import { MembershipChecker } from "@/shared/authorization";
import { DomainStatusRegistry } from "@/shared/http";
import { HandlersRegistry } from "@/shared/outbox";
import { OutboxModule } from "@/shared/outbox/outbox.module";

import {
    AcceptInvitationUseCase,
    CreateCompanyUseCase,
    GetCompanyUseCase,
    GetMembershipUseCase,
    InviteMemberUseCase,
    ListCompaniesUseCase,
    ListMembersUseCase,
    ListMyMembershipsUseCase,
    ReactivateCompanyUseCase,
    ReactivateMemberUseCase,
    RevokeMemberUseCase,
    SuspendCompanyUseCase,
    SuspendMemberUseCase,
    UpdateCompanyUseCase,
    UpdateMemberRoleUseCase,
} from "./application/use-cases";
import { ValidateCompanyAccessInternalUseCase } from "./application/use-cases-internal";
import { CreateCompanyOhsUseCase, CreateMembershipOhsUseCase } from "./application/use-cases-ohs";
import { DOMAIN_ERROR_CODES } from "./domain/errors";
import { CompanyRepository, MembershipRepository } from "./domain/interfaces";
import { SendInvitationEmailOutboxHandler } from "./infrastructure/handlers";
import { MembershipCheckerProvider } from "./infrastructure/providers";
import { PrismaCompanyRepository, PrismaMembershipRepository } from "./infrastructure/repositories";
import {
    CompanyController,
    InvitationController,
    MemberController,
    MemberLifecycleController,
} from "./presentation/controllers";

@Module({
    controllers: [CompanyController, InvitationController, MemberController, MemberLifecycleController],
    providers: [
        AcceptInvitationUseCase,
        SendInvitationEmailOutboxHandler,
        CreateCompanyUseCase,
        GetCompanyUseCase,
        GetMembershipUseCase,
        InviteMemberUseCase,
        ListCompaniesUseCase,
        ListMembersUseCase,
        ListMyMembershipsUseCase,
        ReactivateCompanyUseCase,
        ReactivateMemberUseCase,
        RevokeMemberUseCase,
        SuspendCompanyUseCase,
        SuspendMemberUseCase,
        UpdateCompanyUseCase,
        UpdateMemberRoleUseCase,
        ValidateCompanyAccessInternalUseCase,
        CreateCompanyOhsUseCase,
        CreateMembershipOhsUseCase,
        {
            provide: CompanyRepository,
            useClass: PrismaCompanyRepository,
        },
        {
            provide: MembershipRepository,
            useClass: PrismaMembershipRepository,
        },
        {
            provide: MembershipChecker,
            useClass: MembershipCheckerProvider,
        },
    ],
    imports: [AuthorizationModule, IdentityModule, NotificationsModule, TenantModule, OutboxModule],
    exports: [MembershipChecker],
})
export class CompanyModule implements OnModuleInit {
    constructor(
        private readonly handlersRegistry: HandlersRegistry,
        private readonly sendInvitationEmailOutboxHandler: SendInvitationEmailOutboxHandler,
    ) {}

    public onModuleInit(): void {
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.COMPANY_SLUG_ALREADY_EXISTS, HttpStatus.CONFLICT);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.COMPANY_ALREADY_SUSPENDED, HttpStatus.CONFLICT);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.COMPANY_ALREADY_ACTIVE, HttpStatus.CONFLICT);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.MEMBERSHIP_EXPIRED, HttpStatus.CONFLICT);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.MEMBERSHIP_ALREADY_EXISTS, HttpStatus.CONFLICT);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.MEMBERSHIP_TRANSITION_INVALID, HttpStatus.CONFLICT);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.COMPANY_NOT_FOUND, HttpStatus.NOT_FOUND);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.MEMBERSHIP_NOT_FOUND, HttpStatus.NOT_FOUND);

        this.handlersRegistry.register(this.sendInvitationEmailOutboxHandler);
    }
}
