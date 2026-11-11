import { Module } from "@nestjs/common";

import { TenantModule } from "@/core/tenant/tenant.module";

import {
    CreateCompanyUseCase,
    GetCompanyUseCase,
    ListCompaniesUseCase,
    ReactivateCompanyUseCase,
    SuspendCompanyUseCase,
    UpdateCompanyUseCase,
} from "./application/use-cases";
import { CreateCompanyOhsUseCase } from "./application/use-cases-ohs";
import { CompanyRepository } from "./domain/interfaces";
import { PrismaCompanyRepository } from "./infrastructure/repositories";

@Module({
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
    ],
    imports: [TenantModule],
})
export class CompanyModule {}
