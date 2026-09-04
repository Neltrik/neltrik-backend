import { HttpStatus, Module, OnModuleInit } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { env } from "@/config/index";
import { AuthorizationModule } from "@/core/authorization/authorization.module";
import { IdentityModule } from "@/core/identity/identity.module";
import { TenantModule } from "@/core/tenant/tenant.module";
import { DomainStatusRegistry } from "@/shared/http";

import {
    GetAccountByEmailUseCase,
    GetAccountByUserIdUseCase,
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,
    RegisterUseCase,
    RequestEmailVerificationUseCase,
    RevokeSessionUseCase,
    ValidateEmailVerificationUseCase,
    ValidateSessionUseCase,
} from "./application/use-cases";
import { DOMAIN_ERROR_CODES } from "./domain/errors";
import {
    AuthenticationAccountRepository,
    AuthenticationSessionRepository,
    EmailVerificationRepository,
    PasswordResetRepository,
} from "./domain/interfaces";
import { EmailSender, NodemailerEmailSender, Sha256Hasher, TokenProvider } from "./infrastructure/providers";
import {
    PrismaAuthenticationAccountRepository,
    PrismaAuthenticationSessionRepository,
    PrismaEmailVerificationRepository,
    PrismaPasswordResetRepository,
} from "./infrastructure/repositories";
import { EmailPasswordProviderStrategy, ProviderAuthenticationStrategyFactory } from "./infrastructure/strategies";
import { AccountController, AuthController, EmailVerificationController } from "./presentation/controllers";

@Module({
    controllers: [AccountController, AuthController, EmailVerificationController],
    providers: [
        GetAccountByEmailUseCase,
        GetAccountByUserIdUseCase,
        LoginUseCase,
        LogoutUseCase,
        RefreshTokenUseCase,
        RegisterUseCase,
        RequestEmailVerificationUseCase,
        RevokeSessionUseCase,
        ValidateEmailVerificationUseCase,
        ValidateSessionUseCase,
        EmailPasswordProviderStrategy,
        ProviderAuthenticationStrategyFactory,
        Sha256Hasher,
        TokenProvider,
        {
            provide: AuthenticationAccountRepository,
            useClass: PrismaAuthenticationAccountRepository,
        },
        {
            provide: AuthenticationSessionRepository,
            useClass: PrismaAuthenticationSessionRepository,
        },
        {
            provide: EmailVerificationRepository,
            useClass: PrismaEmailVerificationRepository,
        },
        {
            provide: PasswordResetRepository,
            useClass: PrismaPasswordResetRepository,
        },
        {
            provide: EmailSender,
            useClass: NodemailerEmailSender,
        },
    ],
    imports: [JwtModule.register({ secret: env.JWT_SECRET }), AuthorizationModule, IdentityModule, TenantModule],
})
export class AuthenticationModule implements OnModuleInit {
    public onModuleInit(): void {
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.INVALID_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.SESSION_EXPIRED, HttpStatus.UNAUTHORIZED);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.SESSION_REVOKED, HttpStatus.UNAUTHORIZED);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.AUTHENTICATION_ACCOUNT_NOT_FOUND, HttpStatus.NOT_FOUND);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.UNAUTHORIZED_SESSION, HttpStatus.UNAUTHORIZED);
    }
}
