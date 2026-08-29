import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuthenticationModule } from "./core/authentication/authentication.module";
import { AuthorizationModule } from "./core/authorization/authorization.module";
import { IdentityModule } from "./core/identity/identity.module";
import { TenantModule } from "./core/tenant/tenant.module";
import { AtsModule } from "./modules/ats/ats.module";
import { PrismaModule } from "./prisma";
import { AuthModule } from "./shared/auth/auth.module";
import { ErrorsModule } from "./shared/errors";
import { HttpModule } from "./shared/http";
import { IdGeneratorModule } from "./shared/id-generator";
import { SanitizationModule } from "./shared/sanitization";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        HttpModule,
        AuthModule,
        ErrorsModule,
        IdGeneratorModule,
        SanitizationModule,
        AuthenticationModule,
        AuthorizationModule,
        IdentityModule,
        TenantModule,
        AtsModule,
    ],
})
export class AppModule {}
