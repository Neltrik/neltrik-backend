import type { ExecutionContext } from "@nestjs/common";
import { ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

import { AUDIT_METADATA_KEY, type AuditRecorder } from "@/shared/audit";

import { SKIP_EMAIL_VERIFICATION_KEY } from "../../";
import { EmailVerifiedGuard } from ".";

describe("EmailVerifiedGuard", () => {
    const makeSut = () => {
        const reflector = new Reflector();
        const auditRecorder: jest.Mocked<AuditRecorder> = {
            record: jest.fn(),
        };
        const guard = new EmailVerifiedGuard(reflector, auditRecorder);
        const request = Object.create(Request.prototype) as Request;
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
        return { guard, reflector, auditRecorder, context, request };
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should allow access when email verification is skipped", () => {
        const { guard, reflector, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
        expect(guard.canActivate(context)).toBe(true);
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(SKIP_EMAIL_VERIFICATION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
    });

    it("should throw when user is not authenticated", () => {
        const { guard, reflector, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        delete request.user;
        delete request.account;
        expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("User not authenticated"));
    });

    it("should throw when account is not found", () => {
        const { guard, reflector, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        request.user = { userId: "user-id", tenantId: "tenant-id", roleCode: "ADMIN", sessionId: "" };
        delete request.account;
        expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("User not authenticated"));
    });

    it("should throw when email is not verified", () => {
        const { guard, reflector, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        request.user = { userId: "user-id", tenantId: "tenant-id", roleCode: "ADMIN", sessionId: "" };
        request.account = { emailVerified: false };
        expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("Email not verified"));
    });

    it("should allow access when email is verified", () => {
        const { guard, reflector, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        request.user = { userId: "user-id", tenantId: "tenant-id", roleCode: "ADMIN", sessionId: "" };
        request.account = { emailVerified: true };
        expect(guard.canActivate(context)).toBe(true);
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(SKIP_EMAIL_VERIFICATION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
    });

    it("should record a denied audit when user is not authenticated and audit metadata exists", () => {
        const { guard, reflector, auditRecorder, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        jest.spyOn(reflector, "get").mockReturnValue({
            action: "AUTHENTICATE",
            resource: "ACCOUNT",
        });
        delete request.user;
        delete request.account;
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
            metadata: { errorMessage: "User not authenticated", origin: "EmailVerifiedGuard" },
        });
    });

    it("should record a denied audit when email is not verified", () => {
        const { guard, reflector, auditRecorder, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        jest.spyOn(reflector, "get").mockReturnValue({
            action: "AUTHENTICATE",
            resource: "ACCOUNT",
        });
        request.user = { userId: "user-id", tenantId: "tenant-id", roleCode: "ADMIN", sessionId: "session-id" };
        request.account = { emailVerified: false };
        expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("Email not verified"));
        expect(auditRecorder.record).toHaveBeenCalledWith({
            action: "AUTHENTICATE",
            resource: "ACCOUNT",
            resourceId: null,
            userId: null,
            userEmail: null,
            tenantId: null,
            status: "DENIED",
            metadata: { errorMessage: "Email not verified", origin: "EmailVerifiedGuard" },
        });
    });

    it("should not record an audit when authentication fails without audit metadata", () => {
        const { guard, reflector, auditRecorder, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        jest.spyOn(reflector, "get").mockReturnValue(undefined);
        delete request.user;
        delete request.account;
        expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("User not authenticated"));
        expect(auditRecorder.record).not.toHaveBeenCalled();
    });

    it("should record Unknown error when the error is not an Error instance", () => {
        const { guard, reflector, auditRecorder, context } = makeSut();
        const nonError: object = Object.create(null) as object;
        jest.spyOn(reflector, "get").mockReturnValue({
            action: "AUTHENTICATE",
            resource: "ACCOUNT",
        });
        expect(nonError instanceof Error).toBe(false);
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
            metadata: {
                errorMessage: "Unknown error",
                origin: "EmailVerifiedGuard",
            },
        });
    });
});
