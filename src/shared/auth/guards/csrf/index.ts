import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

import { env } from "@/config/env";
import { AUDIT_METADATA_KEY, type AuditMetadata, AuditRecorder } from "@/shared/audit";

import { CSRF_HEADER_NAME } from "../../constants";
import { IS_PUBLIC_KEY } from "../../decorators";
import { CsrfTokenProvider } from "../../providers";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

@Injectable()
export class CsrfGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly auditRecorder: AuditRecorder,
        private readonly csrfTokenProvider: CsrfTokenProvider,
    ) {}

    public canActivate(context: ExecutionContext): boolean {
        try {
            const request = context.switchToHttp().getRequest<Request>();
            if (!MUTATING_METHODS.has(request.method)) {
                return true;
            }
            const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            if (isPublic) {
                return true;
            }
            this.validateOrigin(request);
            this.validateRequestedWith(request);
            this.validateToken(request);
            return true;
        } catch (error) {
            this.auditDenied(context, error);
            throw error;
        }
    }

    private validateOrigin(request: Request): void {
        const origin = request.headers.origin;
        if (origin !== env.FRONTEND_URL) {
            throw new ForbiddenException("Invalid origin");
        }
    }

    private validateRequestedWith(request: Request): void {
        const requestedWith = request.headers["x-requested-with"];
        if (requestedWith !== "XMLHttpRequest") {
            throw new ForbiddenException("Missing X-Requested-With header");
        }
    }

    private validateToken(request: Request): void {
        const headerToken = request.headers[CSRF_HEADER_NAME];
        const sessionId = request.user?.sessionId;
        if (!sessionId) {
            throw new ForbiddenException("Session not available");
        }
        const header = Array.isArray(headerToken) ? headerToken[0] : headerToken;
        if (!this.csrfTokenProvider.verify(header, sessionId)) {
            throw new ForbiddenException("Invalid CSRF token");
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
                origin: "CsrfGuard",
            },
        });
    }
}
