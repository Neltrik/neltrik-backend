import { Global, Module } from "@nestjs/common";

import { AuditRecorder } from "@/shared/audit";

import { AuditApi, AuditApiImpl } from "./api";
import { GetAuditEventUseCase, ListAuditEventsUseCase } from "./application/use-cases";
import { CreateAuditEventOhsUseCase } from "./application/use-cases-ohs";
import { AuditEventRepository } from "./domain/interfaces";
import { AuditRecorderProvider } from "./infrastructure/providers";
import { PrismaAuditEventRepository } from "./infrastructure/repositories";
import { AuditEventController } from "./presentation/controllers";

@Global()
@Module({
    controllers: [AuditEventController],
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
        {
            provide: AuditRecorder,
            useClass: AuditRecorderProvider,
        },
    ],
    exports: [AuditApi, AuditRecorder],
})
export class AuditModule {}
