import type { ExecutionContext } from "@nestjs/common";
import { ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

import { AUDIT_METADATA_KEY, type AuditRecorder } from "@/shared/audit";

import { CSRF_HEADER_NAME } from "../../constants";
import { IS_PUBLIC_KEY } from "../../decorators";
import { type CsrfTokenProvider } from "../../providers";
import { CsrfGuard } from "./";

jest.mock("@/config/env", () => ({
    env: {
        FRONTEND_URL: "https://example.com",
    },
}));

describe("CsrfGuard", () => {
    const makeSut = () => {
        const reflector = new Reflector();
        const auditRecorder: jest.Mocked<AuditRecorder> = {
            record: jest.fn(),
        };
        const csrfTokenProvider: jest.Mocked<CsrfTokenProvider> = {
            verify: jest.fn().mockReturnValue(true),
        } as unknown as jest.Mocked<CsrfTokenProvider>;

        const guard = new CsrfGuard(reflector, auditRecorder, csrfTokenProvider);
        const request = Object.create(Request.prototype) as Request;
        request.method = "POST";
        request.headers = {
            origin: "https://example.com",
            "x-requested-with": "XMLHttpRequest",
            [CSRF_HEADER_NAME]: "valid-token",
        };
        request.user = {
            sessionId: "session-id",
            userId: "user-id",
            tenantId: "tenant-id",
            roleCode: "ADMIN",
            userState: { status: "ACTIVE" },
            tenantState: { status: "ACTIVE" },
        };

        const httpContext = {
            getRequest: jest.fn().mockReturnValue(request),
        };
        const context: ExecutionContext = {
            getArgs: jest.fn(),
            getArgByIndex: jest.fn(),
            getType: jest.fn(),
            getClass: jest.fn(),
            getHandler: jest.fn(),
            switchToRpc: jest.fn(),
            switchToWs: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue(httpContext),
        };
        jest.spyOn(reflector, "get").mockReturnValue(undefined);
        return { guard, reflector, auditRecorder, csrfTokenProvider, context, request };
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should allow access for non-mutating methods (e.g., GET)", () => {
        const { guard, reflector, context, request } = makeSut();
        request.method = "GET";
        expect(guard.canActivate(context)).toBe(true);
        expect(reflector.getAllAndOverride).not.toHaveBeenCalled();
    });

    it("should allow access when route is public", () => {
        const { guard, reflector, context, request } = makeSut();
        request.method = "POST";
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
        expect(guard.canActivate(context)).toBe(true);
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
    });

    it("should throw when origin is invalid", () => {
        const { guard, reflector, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        request.headers.origin = "https://malicious.com";
        expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("Invalid origin"));
    });

    it("should throw when X-Requested-With header is missing or invalid", () => {
        const { guard, reflector, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        request.headers["x-requested-with"] = "Fetch";
        expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("Missing X-Requested-With header"));
    });

    it("should throw when session is not available", () => {
        const { guard, reflector, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        delete request.user;
        expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("Session not available"));
    });

    it("should throw when CSRF token is invalid", () => {
        const { guard, reflector, csrfTokenProvider, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        csrfTokenProvider.verify.mockReturnValue(false);
        expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("Invalid CSRF token"));
    });

    it("should allow access when all validations pass", () => {
        const { guard, reflector, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        expect(guard.canActivate(context)).toBe(true);
    });

    it("should record a denied audit when validation fails and audit metadata exists", () => {
        const { guard, reflector, auditRecorder, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        jest.spyOn(reflector, "get").mockReturnValue({ action: "UPDATE", resource: "SETTINGS" });
        request.headers.origin = "https://malicious.com";

        expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("Invalid origin"));
        expect(reflector.get).toHaveBeenCalledWith(AUDIT_METADATA_KEY, context.getHandler());
        expect(auditRecorder.record).toHaveBeenCalledWith({
            action: "UPDATE",
            resource: "SETTINGS",
            resourceId: null,
            userId: null,
            userEmail: null,
            tenantId: null,
            status: "DENIED",
            metadata: { errorMessage: "Invalid origin", origin: "CsrfGuard" },
        });
    });

    it("should not record an audit when validation fails without audit metadata", () => {
        const { guard, reflector, auditRecorder, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        jest.spyOn(reflector, "get").mockReturnValue(undefined);
        request.headers.origin = "https://malicious.com";

        expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("Invalid origin"));
        expect(auditRecorder.record).not.toHaveBeenCalled();
    });

    it("should record Unknown error when the error is not an Error instance", () => {
        const { guard, reflector, auditRecorder, context } = makeSut();
        const nonError: object = Object.create(null) as object;
        jest.spyOn(reflector, "get").mockReturnValue({ action: "UPDATE", resource: "SETTINGS" });

        expect(nonError instanceof Error).toBe(false);
        (
            guard as unknown as {
                auditDenied: (context: ExecutionContext, error: unknown) => void;
            }
        ).auditDenied(context, nonError);

        expect(auditRecorder.record).toHaveBeenCalledWith({
            action: "UPDATE",
            resource: "SETTINGS",
            resourceId: null,
            userEmail: null,
            userId: null,
            tenantId: null,
            status: "DENIED",
            metadata: { errorMessage: "Unknown error", origin: "CsrfGuard" },
        });
    });
});
