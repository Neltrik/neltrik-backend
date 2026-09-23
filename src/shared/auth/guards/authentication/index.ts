import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

import { AUDIT_METADATA_KEY, type AuditMetadata, AuditRecorder } from "@/shared/audit";
import { CookieHelper } from "@/shared/http";

import { IS_PUBLIC_KEY } from "../../decorators";
import { TokenVerifier } from "../../providers";
import { SessionValidator } from "./contracts";

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly auditRecorder: AuditRecorder,
        private readonly tokenVerifier: TokenVerifier,
        private readonly sessionValidator: SessionValidator,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            if (isPublic) {
                return true;
            }
            const request = context.switchToHttp().getRequest<Request>();
            const token = CookieHelper.get(request, "accessToken");
            if (!token) {
                throw new UnauthorizedException("Access token not found");
            }
            const payload = await this.tokenVerifier.verify(token);
            const result = await this.sessionValidator.resolve(payload.sessionId);
            if (!result.isValid) {
                throw new UnauthorizedException("Invalid or revoked session");
            }
            request.user = {
                userId: payload.sub,
                tenantId: payload.tenantId,
                roleCode: payload.roleCode,
                sessionId: payload.sessionId,
                userState: result.userState,
            };
            request.account = {
                emailVerified: result.accountState.emailVerified,
            };
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
                origin: "AuthenticationGuard",
            },
        });
    }
}
