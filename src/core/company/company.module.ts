import { Module } from "@nestjs/common";

import { CompanyRepository } from "./domain/interfaces";
import { PrismaCompanyRepository } from "./infrastructure/repositories";

@Module({
    providers: [
        {
            provide: CompanyRepository,
            useClass: PrismaCompanyRepository,
        },
    ],
})
export class CompanyModule {}
