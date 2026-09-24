import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

import { AUDIT_METADATA_KEY, type AuditMetadata, AuditRecorder } from "@/shared/audit";

import { SKIP_TENANT_STATE_KEY } from "../../decorators";

@Injectable()
export class TenantStateGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly auditRecorder: AuditRecorder,
    ) {}

    public canActivate(context: ExecutionContext): boolean {
        try {
            const skipTenantState = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_STATE_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            if (skipTenantState) {
                return true;
            }
            const request = context.switchToHttp().getRequest<Request>();
            const user = request.user;
            if (!user) {
                throw new ForbiddenException("User not authenticated");
            }
            if (user.roleCode === "PLATFORM_ADMIN") {
                return true;
            }
            if (user.tenantState.status !== "ACTIVE") {
                throw new ForbiddenException("Tenant is not active");
            }
            return true;
        } catch (error) {
            this.auditDenied(context, error);
            throw error;
        }
    }

    private auditDenied(context: ExecutionContext, error: unknown): void {
        const auditMetadata = this.reflector.get<AuditMetadata | undefined>(AUDIT_METADATA_KEY, context.getHandler());
        if (!auditMetadata) {
            return;
        }
        this.auditRecorder.record({
            action: auditMetadata.action,
            resource: auditMetadata.resource,
            resourceId: null,
            userId: null,
            userEmail: null,
            tenantId: null,
            status: "DENIED",
            metadata: {
                errorMessage: error instanceof Error ? error.message : "Unknown error",
                origin: "TenantStateGuard",
            },
        });
    }
}
