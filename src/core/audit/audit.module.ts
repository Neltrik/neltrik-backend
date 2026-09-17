import { Module } from "@nestjs/common";

import { AuditApi, AuditApiImpl } from "./api";
import { GetAuditEventUseCase, ListAuditEventsUseCase } from "./application/use-cases";
import { CreateAuditEventOhsUseCase } from "./application/use-cases-ohs";
import { AuditEventRepository } from "./domain/interfaces";
import { PrismaAuditEventRepository } from "./infrastructure/repositories";

@Module({
    providers: [
        GetAuditEventUseCase,
        ListAuditEventsUseCase,
        CreateAuditEventOhsUseCase,
        {
            provide: AuditEventRepository,
            useClass: PrismaAuditEventRepository,
        },
        {
            provide: AuditApi,
            useClass: AuditApiImpl,
        },
    ],
    exports: [AuditApi],
})
export class AuditModule {}
