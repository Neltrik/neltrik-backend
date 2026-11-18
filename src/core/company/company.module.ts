import { HttpStatus, Module, OnModuleInit } from "@nestjs/common";

import { IdentityModule } from "@/core/identity/identity.module";
import { NotificationsModule } from "@/core/notifications/notifications.module";
import { TenantModule } from "@/core/tenant/tenant.module";
import { DomainStatusRegistry } from "@/shared/http";
import { HandlersRegistry } from "@/shared/outbox";
import { OutboxModule } from "@/shared/outbox/outbox.module";

import {
    AcceptInvitationUseCase,
    CreateCompanyUseCase,
    GetCompanyUseCase,
    InviteMemberUseCase,
    ListCompaniesUseCase,
    ListMembersUseCase,
    ReactivateCompanyUseCase,
    SuspendCompanyUseCase,
    UpdateCompanyUseCase,
} from "./application/use-cases";
import { CreateCompanyOhsUseCase } from "./application/use-cases-ohs";
import { DOMAIN_ERROR_CODES } from "./domain/errors";
import { CompanyRepository, MembershipRepository } from "./domain/interfaces";
import { SendInvitationEmailOutboxHandler } from "./infrastructure/handlers";
import { PrismaCompanyRepository, PrismaMembershipRepository } from "./infrastructure/repositories";
import { CompanyController } from "./presentation/controllers";

@Module({
    controllers: [CompanyController],
    providers: [
        AcceptInvitationUseCase,
        SendInvitationEmailOutboxHandler,
        CreateCompanyUseCase,
        GetCompanyUseCase,
        InviteMemberUseCase,
        ListCompaniesUseCase,
        ListMembersUseCase,
        ReactivateCompanyUseCase,
        SuspendCompanyUseCase,
        UpdateCompanyUseCase,
        CreateCompanyOhsUseCase,
        {
            provide: CompanyRepository,
            useClass: PrismaCompanyRepository,
        },
        {
            provide: MembershipRepository,
            useClass: PrismaMembershipRepository,
        },
    ],
    imports: [IdentityModule, NotificationsModule, TenantModule, OutboxModule],
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
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.COMPANY_NOT_FOUND, HttpStatus.NOT_FOUND);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.MEMBERSHIP_NOT_FOUND, HttpStatus.NOT_FOUND);

        this.handlersRegistry.register(this.sendInvitationEmailOutboxHandler);
    }
}
