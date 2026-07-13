import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AtsModule } from "./modules/ats/ats.module";
import { PrismaModule } from "./prisma";
import { HttpModule } from "./shared/http";
import { IdGeneratorModule } from "./shared/id-generator";
import { SanitizationModule } from "./shared/sanitization";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        HttpModule,
        IdGeneratorModule,
        SanitizationModule,
        AtsModule,
    ],
})
export class AppModule {}
