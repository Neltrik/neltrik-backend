import { HttpStatus, Module, OnModuleInit } from "@nestjs/common";

import { TenantModule } from "@/core/tenant/tenant.module";
import { DomainStatusRegistry } from "@/shared/http";

import {
    CreateCompanyUseCase,
    GetCompanyUseCase,
    ListCompaniesUseCase,
    ReactivateCompanyUseCase,
    SuspendCompanyUseCase,
    UpdateCompanyUseCase,
} from "./application/use-cases";
import { CreateCompanyOhsUseCase } from "./application/use-cases-ohs";
import { DOMAIN_ERROR_CODES } from "./domain/errors";
import { CompanyRepository, MembershipRepository } from "./domain/interfaces";
import { PrismaCompanyRepository, PrismaMembershipRepository } from "./infrastructure/repositories";
import { CompanyController } from "./presentation/controllers";

@Module({
    controllers: [CompanyController],
    providers: [
        CreateCompanyUseCase,
        GetCompanyUseCase,
        ListCompaniesUseCase,
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
    imports: [TenantModule],
})
export class CompanyModule implements OnModuleInit {
    public onModuleInit(): void {
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.COMPANY_SLUG_ALREADY_EXISTS, HttpStatus.CONFLICT);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.COMPANY_ALREADY_SUSPENDED, HttpStatus.CONFLICT);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.COMPANY_ALREADY_ACTIVE, HttpStatus.CONFLICT);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.COMPANY_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
}
