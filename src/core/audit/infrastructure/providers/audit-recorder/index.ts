import { Injectable, Logger } from "@nestjs/common";

import { AuditRecorder, type AuditRecordInput } from "@/shared/audit";

import { CreateAuditEventOhsUseCase } from "../../../application/use-cases-ohs";
import { AUDIT_ACTION, AUDIT_RESOURCE, type AuditAction, type AuditResource } from "../../../domain/catalogs";
import { AUDIT_STATUS, type AuditStatus } from "../../../domain/types";

@Injectable()
export class AuditRecorderProvider extends AuditRecorder {
    private readonly logger = new Logger(AuditRecorderProvider.name);

    public constructor(private readonly createAuditEventOhsUseCase: CreateAuditEventOhsUseCase) {
        super();
    }

    public record(input: AuditRecordInput): void {
        if (!this.isValidAction(input.action)) {
            this.logger.error(`Invalid audit action: ${input.action}`);
            return;
        }
        if (!this.isValidResource(input.resource)) {
            this.logger.error(`Invalid audit resource: ${input.resource}`);
            return;
        }
        if (!this.isValidStatus(input.status)) {
            this.logger.error(`Invalid audit status: ${input.status}`);
            return;
        }
        this.createAuditEventOhsUseCase
            .execute({
                action: input.action,
                resource: input.resource,
                resourceId: input.resourceId,
                userId: input.userId,
                userEmail: input.userEmail,
                tenantId: input.tenantId,
                status: input.status,
                metadata: input.metadata ?? {},
                ipAddress: null,
                userAgent: null,
            })
            .catch((error: unknown) => {
                this.logger.error(
                    `Failed to record audit event: ${input.action}`,
                    error instanceof Error ? error.stack : undefined,
                );
            });
    }

    private isValidAction(action: string): action is AuditAction {
        return Object.values(AUDIT_ACTION).includes(action as AuditAction);
    }

    private isValidResource(resource: string): resource is AuditResource {
        return Object.values(AUDIT_RESOURCE).includes(resource as AuditResource);
    }

    private isValidStatus(status: string): status is AuditStatus {
        return Object.values(AUDIT_STATUS).includes(status as AuditStatus);
    }
}
