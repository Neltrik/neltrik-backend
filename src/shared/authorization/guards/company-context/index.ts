import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

import { AUDIT_METADATA_KEY, type AuditMetadata, AuditRecorder } from "@/shared/audit";

import { CompanyChecker, MembershipChecker } from "../../contracts";
import { WITHOUT_COMPANY_KEY } from "../../decorators";

@Injectable()
export class CompanyContextGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly auditRecorder: AuditRecorder,
        private readonly companyChecker: CompanyChecker,
        private readonly membershipChecker: MembershipChecker,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const isWithoutCompany = this.reflector.getAllAndOverride<boolean>(WITHOUT_COMPANY_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            if (isWithoutCompany) {
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
            const headerCompanyId = request.headers["x-company-id"];
            const companyId = typeof headerCompanyId === "string" ? headerCompanyId : null;
            if (!companyId) {
                throw new ForbiddenException("Company context required");
            }
            const hasAccess = await this.companyChecker.isActive(companyId);
            if (!hasAccess) {
                throw new ForbiddenException("Company is not active");
            }
            const hasMembership = await this.membershipChecker.hasActiveMembership(user.userId, companyId);
            if (!hasMembership) {
                throw new ForbiddenException("User does not have access to this company");
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
                origin: "CompanyContextGuard",
            },
        });
    }
}
