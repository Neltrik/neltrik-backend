import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { TenantModule } from "./core/tenant/tenant.module";
import { AtsModule } from "./modules/ats/ats.module";
import { PrismaModule } from "./prisma";
import { ErrorsModule } from "./shared/errors";
import { HttpModule } from "./shared/http";
import { IdGeneratorModule } from "./shared/id-generator";
import { SanitizationModule } from "./shared/sanitization";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        HttpModule,
        ErrorsModule,
        IdGeneratorModule,
        SanitizationModule,
        TenantModule,
        AtsModule,
    ],
})
export class AppModule {}
