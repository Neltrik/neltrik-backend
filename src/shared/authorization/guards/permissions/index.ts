import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

import { AUDIT_METADATA_KEY, type AuditMetadata, AuditRecorder } from "@/shared/audit";

import { PermissionChecker } from "../../contracts";
import { PERMISSIONS_KEY, PUBLIC_PERMISSION_KEY } from "../../decorators";

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly auditRecorder: AuditRecorder,
        private readonly permissionChecker: PermissionChecker,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_PERMISSION_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            if (isPublic) {
                return true;
            }
            const requiredPermissions = this.reflector.getAllAndOverride<string[] | undefined>(PERMISSIONS_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            if (requiredPermissions === undefined || requiredPermissions.length === 0) {
                throw new ForbiddenException("Access denied: no permissions defined for this endpoint");
            }
            const request = context.switchToHttp().getRequest<Request>();
            const userId = request.user?.userId;
            if (!userId) {
                throw new ForbiddenException("User does not have permission");
            }
            const results = await Promise.all(
                requiredPermissions.map((permission) => this.permissionChecker.hasPermission(userId, permission)),
            );
            const missingPermission = requiredPermissions.find((_, index) => !results[index]);
            if (missingPermission) {
                throw new ForbiddenException(`Missing required permission: ${missingPermission}`);
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
                origin: "PermissionsGuard",
            },
        });
    }
}
