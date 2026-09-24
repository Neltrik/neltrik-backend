import type { ExecutionContext } from "@nestjs/common";
import { ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

import { AUDIT_METADATA_KEY, type AuditRecorder } from "@/shared/audit";

import { SKIP_TENANT_STATE_KEY } from "../..";
import { TenantStateGuard } from "./";

describe("TenantStateGuard", () => {
    const makeSut = () => {
        const reflector = new Reflector();
        const auditRecorder: jest.Mocked<AuditRecorder> = {
            record: jest.fn(),
        };
        const guard = new TenantStateGuard(reflector, auditRecorder);
        const request = Object.create(Request.prototype) as Request;
        const httpContext = {
            getRequest: jest.fn().mockReturnValue(request),
        };
        const context = {
            switchToHttp: jest.fn().mockReturnValue(httpContext),
            getClass: jest.fn(),
            getHandler: jest.fn(),
        } as unknown as ExecutionContext;
        jest.spyOn(reflector, "get").mockReturnValue(undefined);
        return { guard, reflector, auditRecorder, context, request };
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("Skip Tenant State", () => {
        it("should allow access when user state is skipped", () => {
            const { guard, reflector, context } = makeSut();
            jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
            expect(guard.canActivate(context)).toBe(true);
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith(SKIP_TENANT_STATE_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
        });
    });

    describe("Authentication and Authorization", () => {
        it("should throw when user is not authenticated", () => {
            const { guard, reflector, context, request } = makeSut();
            jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
            delete request.user;
            expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("User not authenticated"));
        });

        it("should allow access when user is a platform admin", () => {
            const { guard, reflector, context, request } = makeSut();
            jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
            request.user = {
                userId: "admin-id",
                tenantId: "tenant-id",
                roleCode: "PLATFORM_ADMIN",
                sessionId: "session-id",
                userState: { status: "ACTIVE" },
                tenantState: { status: "SUSPENDED" },
            };
            expect(guard.canActivate(context)).toBe(true);
        });

        it("should throw when tenant is not active", () => {
            const { guard, reflector, context, request } = makeSut();
            jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
            request.user = {
                userId: "user-id",
                tenantId: "tenant-id",
                roleCode: "ADMIN",
                sessionId: "session-id",
                userState: { status: "ACTIVE" },
                tenantState: { status: "SUSPENDED" },
            };
            expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("Tenant is not active"));
        });

        it("should allow access when tenant is active", () => {
            const { guard, reflector, context, request } = makeSut();
            jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
            request.user = {
                userId: "user-id",
                tenantId: "tenant-id",
                roleCode: "ADMIN",
                sessionId: "session-id",
                userState: { status: "ACTIVE" },
                tenantState: { status: "ACTIVE" },
            };
            expect(guard.canActivate(context)).toBe(true);
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith(SKIP_TENANT_STATE_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
        });
    });

    describe("Audit Logging on Denial", () => {
        it("should record a denied audit when user is not authenticated and audit metadata exists", () => {
            const { guard, reflector, auditRecorder, context, request } = makeSut();
            jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
            jest.spyOn(reflector, "get").mockReturnValue({ action: "AUTHENTICATE", resource: "ACCOUNT" });
            delete request.user;
            expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("User not authenticated"));
            expect(reflector.get).toHaveBeenCalledWith(AUDIT_METADATA_KEY, context.getHandler());
            expect(auditRecorder.record).toHaveBeenCalledWith({
                action: "AUTHENTICATE",
                resource: "ACCOUNT",
                resourceId: null,
                userId: null,
                userEmail: null,
                tenantId: null,
                status: "DENIED",
                metadata: { errorMessage: "User not authenticated", origin: "TenantStateGuard" },
            });
        });

        it("should record a denied audit when tenant is not active", () => {
            const { guard, reflector, auditRecorder, context, request } = makeSut();
            jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
            jest.spyOn(reflector, "get").mockReturnValue({
                action: "AUTHENTICATE",
                resource: "ACCOUNT",
            });
            request.user = {
                userId: "user-id",
                tenantId: "tenant-id",
                roleCode: "ADMIN",
                sessionId: "session-id",
                userState: { status: "ACTIVE" },
                tenantState: { status: "SUSPENDED" },
            };
            expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("Tenant is not active"));
            expect(auditRecorder.record).toHaveBeenCalledWith({
                action: "AUTHENTICATE",
                resource: "ACCOUNT",
                resourceId: null,
                userId: null,
                userEmail: null,
                tenantId: null,
                status: "DENIED",
                metadata: { errorMessage: "Tenant is not active", origin: "TenantStateGuard" },
            });
        });

        it("should not record an audit when authentication fails without audit metadata", () => {
            const { guard, reflector, auditRecorder, context, request } = makeSut();
            jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
            jest.spyOn(reflector, "get").mockReturnValue(undefined);
            delete request.user;
            expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("User not authenticated"));
            expect(auditRecorder.record).not.toHaveBeenCalled();
        });

        it("should record 'Unknown error' when the error is not an Error instance", () => {
            const { guard, reflector, auditRecorder, context } = makeSut();
            const nonError: object = Object.create(null) as object;
            jest.spyOn(reflector, "get").mockReturnValue({ action: "AUTHENTICATE", resource: "ACCOUNT" });
            (
                guard as unknown as {
                    auditDenied: (context: ExecutionContext, error: unknown) => void;
                }
            ).auditDenied(context, nonError);
            expect(auditRecorder.record).toHaveBeenCalledWith({
                action: "AUTHENTICATE",
                resource: "ACCOUNT",
                resourceId: null,
                userEmail: null,
                userId: null,
                tenantId: null,
                status: "DENIED",
                metadata: { errorMessage: "Unknown error", origin: "TenantStateGuard" },
            });
        });
    });
});
