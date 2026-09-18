import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

import { AUDIT_METADATA_KEY, type AuditMetadata, AuditRecorder } from "@/shared/audit";

import { SKIP_EMAIL_VERIFICATION_KEY } from "../../";

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly auditRecorder: AuditRecorder,
    ) {}

    public canActivate(context: ExecutionContext): boolean {
        try {
            const skipEmailVerification = this.reflector.getAllAndOverride<boolean>(SKIP_EMAIL_VERIFICATION_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            if (skipEmailVerification) {
                return true;
            }
            const request = context.switchToHttp().getRequest<Request>();
            const user = request.user;
            const account = request.account;
            if (!account || !user) {
                throw new ForbiddenException("User not authenticated");
            }
            if (!account.emailVerified) {
                throw new ForbiddenException("Email not verified");
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
                origin: "EmailVerifiedGuard",
            },
        });
    }
}
