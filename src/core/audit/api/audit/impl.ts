import { Injectable, Logger } from "@nestjs/common";

import { CreateAuditEventInput, CreateAuditEventOhsUseCase } from "../../application/use-cases-ohs";
import { AUDIT_STATUS } from "../../domain/types";
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

    public recordWithFn<T>(input: Omit<CreateAuditEventInput, "status">, fn: () => Promise<T>): Promise<T> {
        return fn()
            .then((result) => {
                this.createAuditEventOhsUseCase
                    .execute({ ...input, status: AUDIT_STATUS.SUCCESS })
                    .catch((error) => this.logger.error("Audit failed", error));
                return result;
            })
            .catch((error) => {
                this.createAuditEventOhsUseCase
                    .execute({ ...input, status: AUDIT_STATUS.FAILED })
                    .catch((auditError) => this.logger.error("Audit failed", auditError));
                throw error;
            });
    }
}

export { type CreateAuditEventInput };
