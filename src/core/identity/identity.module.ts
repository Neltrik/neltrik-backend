import { Module } from "@nestjs/common";

import { TenantModule } from "@/core/tenant/tenant.module";

import { RegisterUserUseCase } from "./application/use-cases";
import { UserRepository } from "./domain/interfaces";
import { PrismaUserRepository } from "./infrastructure/repositories";

@Module({
    providers: [
        RegisterUserUseCase,
        {
            provide: UserRepository,
            useClass: PrismaUserRepository,
        },
    ],
    imports: [TenantModule],
})
export class IdentityModule {}
