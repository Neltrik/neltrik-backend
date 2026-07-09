import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AtsModule } from "./modules/ats/ats.module";
import { PrismaModule } from "./prisma";

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AtsModule],
})
export class AppModule {}
