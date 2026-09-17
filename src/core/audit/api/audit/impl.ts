import { Injectable, Logger } from "@nestjs/common";

import { CreateAuditEventInput, CreateAuditEventOhsUseCase } from "../../application/use-cases-ohs";
import { AuditApi } from "./contract";

@Injectable()
export class AuditApiImpl extends AuditApi {
    private readonly logger = new Logger(AuditApiImpl.name);

    public constructor(private readonly createAuditEventOhsUseCase: CreateAuditEventOhsUseCase) {
        super();
    }

    public record(input: CreateAuditEventInput): void {
        this.createAuditEventOhsUseCase.execute(input).catch((error: unknown) => {
            this.logger.error(
                `Failed to record audit event: ${input.action}`,
                error instanceof Error ? error.stack : undefined,
            );
        });
    }
}
