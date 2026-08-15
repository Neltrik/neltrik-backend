import { Module } from "@nestjs/common";

import { AuthorizationModule } from "@/core/authorization/authorization.module";
import { TenantModule } from "@/core/tenant/tenant.module";

import {
    GetUsersUseCase,
    ReactivateUserUseCase,
    RegisterUserUseCase,
    SuspendUserUseCase,
    UpdateUserUseCase,
} from "./application/use-cases";
import { UserRepository } from "./domain/interfaces";
import { PrismaUserRepository } from "./infrastructure/repositories";
import { UserController } from "./presentation/controllers/user";

@Module({
    controllers: [UserController],
    providers: [
        GetUsersUseCase,
        ReactivateUserUseCase,
        RegisterUserUseCase,
        SuspendUserUseCase,
        UpdateUserUseCase,
        {
            provide: UserRepository,
            useClass: PrismaUserRepository,
        },
    ],
    imports: [TenantModule, AuthorizationModule],
})
export class IdentityModule {}
