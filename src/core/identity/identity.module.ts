import { Module } from "@nestjs/common";

import { AuthorizationModule } from "@/core/authorization/authorization.module";
import { TenantModule } from "@/core/tenant/tenant.module";

import { UserApi, UserApiImpl } from "./api";
import {
    GetUsersUseCase,
    ReactivateUserUseCase,
    RegisterUserUseCase,
    SuspendUserUseCase,
    UpdateUserUseCase,
} from "./application/use-cases";
import { GetUserByIdOhsUseCase, ValidateUserByEmailOhsUseCase } from "./application/use-cases-ohs";
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
        GetUserByIdOhsUseCase,
        ValidateUserByEmailOhsUseCase,
        {
            provide: UserApi,
            useClass: UserApiImpl,
        },
        {
            provide: UserRepository,
            useClass: PrismaUserRepository,
        },
    ],
    imports: [TenantModule, AuthorizationModule],
    exports: [UserApi],
})
export class IdentityModule {}
