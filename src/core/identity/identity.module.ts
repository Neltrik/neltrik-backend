import { Module } from "@nestjs/common";

import { TenantModule } from "@/core/tenant/tenant.module";

import { RegisterUserUseCase, UpdateUserUseCase } from "./application/use-cases";
import { UserRepository } from "./domain/interfaces";
import { PrismaUserRepository } from "./infrastructure/repositories";
import { UserController } from "./presentation/controllers/user";

@Module({
    controllers: [UserController],
    providers: [
        RegisterUserUseCase,
        UpdateUserUseCase,
        {
            provide: UserRepository,
            useClass: PrismaUserRepository,
        },
    ],
    imports: [TenantModule],
})
export class IdentityModule {}
