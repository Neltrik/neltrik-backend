import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AtsModule } from "./modules/ats/ats.module";
import { PrismaModule } from "./prisma";
import { IdGeneratorModule } from "./shared/id-generator";

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, IdGeneratorModule, AtsModule],
})
export class AppModule {}
