import type { ExecutionContext } from "@nestjs/common";
import { ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

import { type AuditRecorder } from "@/shared/audit";

import { CSRF_HEADER_NAME } from "../../constants";
import { IS_PUBLIC_KEY } from "../../decorators";
import { type CsrfTokenProvider } from "../../providers";
import { CsrfGuard } from "./";

jest.mock("@/config/env", () => ({
    env: { FRONTEND_URL: "https://example.com" },
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
        const request = {
            method: "POST",
            headers: {
                origin: "https://example.com",
                "x-requested-with": "XMLHttpRequest",
                [CSRF_HEADER_NAME]: "valid-token",
            },
            user: {
                sessionId: "session-id",
                userId: "user-id",
                tenantId: "tenant-id",
                roleCode: "ADMIN",
                userState: { status: "ACTIVE" },
                tenantState: { status: "ACTIVE" },
            },
        } as unknown as Request;
        const httpContext = {
            getRequest: jest.fn().mockReturnValue(request),
        };
        const context = {
            getArgs: jest.fn(),
            getArgByIndex: jest.fn(),
            getType: jest.fn(),
            getClass: jest.fn(),
            getHandler: jest.fn(),
            switchToRpc: jest.fn(),
            switchToWs: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue(httpContext),
        } as unknown as ExecutionContext;
        jest.spyOn(reflector, "get").mockReturnValue(undefined);
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        const guard = new CsrfGuard(reflector, auditRecorder, csrfTokenProvider);
        return { guard, reflector, auditRecorder, csrfTokenProvider, context, request };
    };

    afterEach(() => jest.restoreAllMocks());

    it("should allow access for non-mutating methods", () => {
        const { guard, reflector, context, request } = makeSut();
        request.method = "GET";
        expect(guard.canActivate(context)).toBe(true);
        expect(reflector.getAllAndOverride).not.toHaveBeenCalled();
    });

    it("should allow access when route is public", () => {
        const { guard, reflector, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
        expect(guard.canActivate(context)).toBe(true);
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
    });

    it.each([
        ["invalid origin", { origin: "https://malicious.com" }, "Invalid origin"],
        ["invalid X-Requested-With", { "x-requested-with": "Fetch" }, "Missing X-Requested-With header"],
    ])("should reject requests with %s", (_, headers, message) => {
        const { guard, reflector, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        Object.assign(request.headers, headers);
        expect(() => guard.canActivate(context)).toThrow(new ForbiddenException(message));
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
        expect(reflector.get).not.toHaveBeenCalled();
    });

    it("should record denied audit when validation fails with metadata", () => {
        const { guard, reflector, auditRecorder, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        jest.spyOn(reflector, "get").mockReturnValue({
            action: "UPDATE",
            resource: "SETTINGS",
        });
        request.headers.origin = "https://malicious.com";
        expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("Invalid origin"));
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

    it("should not record audit without metadata", () => {
        const { guard, reflector, auditRecorder, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        request.headers.origin = "https://malicious.com";
        expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("Invalid origin"));
        expect(auditRecorder.record).not.toHaveBeenCalled();
    });

    it("should record Unknown error for non-Error values", () => {
        const { guard, reflector, auditRecorder, context } = makeSut();
        const nonError = Object.create(null) as object;
        jest.spyOn(reflector, "get").mockReturnValue({
            action: "UPDATE",
            resource: "SETTINGS",
        });

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

    it("should use the first CSRF token when header is an array", () => {
        const { guard, reflector, csrfTokenProvider, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        request.headers[CSRF_HEADER_NAME] = ["valid-token", "another-token"];
        expect(guard.canActivate(context)).toBe(true);
        expect(csrfTokenProvider.verify).toHaveBeenCalledWith("valid-token", "session-id");
    });
});
