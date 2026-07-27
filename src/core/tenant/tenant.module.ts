import { Module } from "@nestjs/common";

import { TenantRepository } from "./domain/interfaces/tenant-repository";
import { PrismaTenantRepository } from "./infrastructure/repositories/prisma-tenant.repository";

@Module({
    providers: [
        {
            provide: TenantRepository,
            useClass: PrismaTenantRepository,
        },
    ],
})
export class TenantModule {}
