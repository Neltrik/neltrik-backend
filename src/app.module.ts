import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";
import Redis from "ioredis";

import { AuditModule } from "./core/audit/audit.module";
import { AuthenticationModule } from "./core/authentication/authentication.module";
import { AuthorizationModule } from "./core/authorization/authorization.module";
import { IdentityModule } from "./core/identity/identity.module";
import { TenantModule } from "./core/tenant/tenant.module";
import { AtsModule } from "./modules/ats/ats.module";
import { PrismaModule, TenantInterceptor } from "./prisma";
import { AuthenticationGuard, EmailVerifiedGuard, UserStateGuard } from "./shared/auth";
import { AuthModule } from "./shared/auth/auth.module";
import { PermissionsGuard } from "./shared/authorization";
import { ErrorsModule } from "./shared/errors/errors.module";
import { HttpModule } from "./shared/http";
import { IdGeneratorModule } from "./shared/id-generator";
import { SanitizationModule } from "./shared/sanitization";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                throttlers: [
                    {
                        name: "default",
                        ttl: 900000,
                        limit: 100,
                    },
                ],
                storage: new ThrottlerStorageRedisService(new Redis(config.getOrThrow<string>("REDIS_URL"))),
            }),
        }),
        PrismaModule,
        HttpModule,
        ErrorsModule,
        AuthModule,
        IdGeneratorModule,
        SanitizationModule,
        AuditModule,
        AuthenticationModule,
        AuthorizationModule,
        IdentityModule,
        TenantModule,
        AtsModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        {
            provide: APP_GUARD,
            useClass: AuthenticationGuard,
        },
        {
            provide: APP_GUARD,
            useClass: EmailVerifiedGuard,
        },
        {
            provide: APP_GUARD,
            useClass: PermissionsGuard,
        },
        {
            provide: APP_GUARD,
            useClass: UserStateGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TenantInterceptor,
        },
    ],
})
export class AppModule {}
