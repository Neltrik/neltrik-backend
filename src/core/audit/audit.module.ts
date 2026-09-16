import { Module } from "@nestjs/common";

import { GetAuditEventUseCase, ListAuditEventsUseCase } from "./application/use-cases";
import { CreateAuditEventUseCase } from "./application/use-cases-ohs";
import { AuditEventRepository } from "./domain/interfaces";
import { PrismaAuditEventRepository } from "./infrastructure/repositories";

@Module({
    providers: [
        GetAuditEventUseCase,
        ListAuditEventsUseCase,
        CreateAuditEventUseCase,
        {
            provide: AuditEventRepository,
            useClass: PrismaAuditEventRepository,
        },
    ],
})
export class AuditModule {}
