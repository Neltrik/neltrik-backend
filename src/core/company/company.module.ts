import { Module } from "@nestjs/common";

import { TenantModule } from "@/core/tenant/tenant.module";

import { CreateCompanyUseCase } from "./application/use-cases";
import { CompanyRepository } from "./domain/interfaces";
import { PrismaCompanyRepository } from "./infrastructure/repositories";

@Module({
    providers: [
        CreateCompanyUseCase,
        {
            provide: CompanyRepository,
            useClass: PrismaCompanyRepository,
        },
    ],
    imports: [TenantModule],
})
export class CompanyModule {}
