import { forwardRef, HttpStatus, Module, OnModuleInit } from "@nestjs/common";

import { AuthorizationModule } from "@/core/authorization/authorization.module";
import { TenantModule } from "@/core/tenant/tenant.module";
import { DomainStatusRegistry } from "@/shared/http";

import { UserApi, UserApiImpl } from "./api";
import {
    GetUsersUseCase,
    ReactivateUserUseCase,
    RegisterUserUseCase,
    SuspendUserUseCase,
    UpdateUserUseCase,
} from "./application/use-cases";
import { DeleteUserOhsUseCase, GetUserByIdOhsUseCase, RegisterUserOhsUseCase } from "./application/use-cases-ohs";
import { DOMAIN_ERROR_CODES } from "./domain/errors";
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
        DeleteUserOhsUseCase,
        GetUserByIdOhsUseCase,
        RegisterUserOhsUseCase,
        {
            provide: UserApi,
            useClass: UserApiImpl,
        },
        {
            provide: UserRepository,
            useClass: PrismaUserRepository,
        },
    ],
    imports: [TenantModule, forwardRef(() => AuthorizationModule)],
    exports: [UserApi],
})
export class IdentityModule implements OnModuleInit {
    public onModuleInit(): void {
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
}
