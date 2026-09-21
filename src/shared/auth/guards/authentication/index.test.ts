import type { ExecutionContext } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

import { AUDIT_METADATA_KEY, type AuditRecorder } from "@/shared/audit";
import { CookieHelper } from "@/shared/http";

import { IS_PUBLIC_KEY } from "../../decorators";
import { TokenVerifier } from "../../providers";
import { AuthenticationGuard } from "./";
import { type SessionValidator } from "./contracts";

jest.mock("@nestjs/jwt", () => ({
    JwtService: jest.fn().mockImplementation(() => ({
        verifyAsync: jest.fn(),
    })),
}));

describe("AuthenticationGuard", () => {
    const makeSut = () => {
        const reflector = new Reflector();
        const jwtService = new JwtService();
        const auditRecorder: jest.Mocked<AuditRecorder> = {
            record: jest.fn(),
        };
        const tokenVerifier = new TokenVerifier(jwtService);
        const sessionValidator: jest.Mocked<SessionValidator> = {
            validate: jest.fn(),
        };
        const guard = new AuthenticationGuard(reflector, auditRecorder, tokenVerifier, sessionValidator);
        const request = Object.create(Request.prototype) as Request;
        request.cookies = {};
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
        return { guard, reflector, auditRecorder, tokenVerifier, sessionValidator, context, request };
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should allow access when the route is public", async () => {
        const { guard, reflector, tokenVerifier, sessionValidator, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
        const verifySpy = jest.spyOn(tokenVerifier, "verify");
        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        expect(verifySpy).not.toHaveBeenCalled();
        expect(sessionValidator.validate).not.toHaveBeenCalled();
    });

    it("should throw when the access token is not found", async () => {
        const { guard, reflector, tokenVerifier, sessionValidator, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        jest.spyOn(CookieHelper, "get").mockReturnValue(undefined);
        const verifySpy = jest.spyOn(tokenVerifier, "verify");
        await expect(guard.canActivate(context)).rejects.toThrow(new UnauthorizedException("Access token not found"));
        expect(verifySpy).not.toHaveBeenCalled();
        expect(sessionValidator.validate).not.toHaveBeenCalled();
    });

    it("should throw when the session is invalid or revoked", async () => {
        const { guard, reflector, tokenVerifier, sessionValidator, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        jest.spyOn(CookieHelper, "get").mockReturnValue("access-token");
        jest.spyOn(tokenVerifier, "verify").mockResolvedValue({
            sub: "user-id",
            tenantId: "tenant-id",
            roleCode: "ADMIN",
            emailVerified: false,
            sessionId: "session-id",
        });
        sessionValidator.validate.mockResolvedValue(false);
        await expect(guard.canActivate(context)).rejects.toThrow(
            new UnauthorizedException("Invalid or revoked session"),
        );
        expect(tokenVerifier.verify).toHaveBeenCalledWith("access-token");
        expect(sessionValidator.validate).toHaveBeenCalledWith("session-id");
    });

    it("should allow access and set the authenticated user when the token and session are valid", async () => {
        const { guard, reflector, tokenVerifier, sessionValidator, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        jest.spyOn(CookieHelper, "get").mockReturnValue("access-token");
        jest.spyOn(tokenVerifier, "verify").mockResolvedValue({
            sub: "user-id",
            tenantId: "tenant-id",
            roleCode: "ADMIN",
            emailVerified: false,
            sessionId: "session-id",
        });
        sessionValidator.validate.mockResolvedValue(true);
        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(tokenVerifier.verify).toHaveBeenCalledWith("access-token");
        expect(sessionValidator.validate).toHaveBeenCalledWith("session-id");
        expect(request.user).toEqual({
            userId: "user-id",
            tenantId: "tenant-id",
            roleCode: "ADMIN",
            sessionId: "session-id",
        });
        expect(request.account).toEqual({ emailVerified: false });
    });

    it("should propagate the error when token verification fails", async () => {
        const { guard, reflector, tokenVerifier, sessionValidator, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        jest.spyOn(CookieHelper, "get").mockReturnValue("invalid-token");
        jest.spyOn(tokenVerifier, "verify").mockRejectedValue(new Error("Invalid access token"));
        await expect(guard.canActivate(context)).rejects.toThrow("Invalid access token");
        expect(tokenVerifier.verify).toHaveBeenCalledWith("invalid-token");
        expect(sessionValidator.validate).not.toHaveBeenCalled();
    });

    it("should record a denied audit when authentication fails and audit metadata exists", async () => {
        const { guard, reflector, auditRecorder, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        jest.spyOn(reflector, "get").mockReturnValue({
            action: "AUTHENTICATE",
            resource: "SESSION",
        });
        jest.spyOn(CookieHelper, "get").mockReturnValue(undefined);
        await expect(guard.canActivate(context)).rejects.toThrow(new UnauthorizedException("Access token not found"));
        expect(reflector.get).toHaveBeenCalledWith(AUDIT_METADATA_KEY, context.getHandler());
        expect(auditRecorder.record).toHaveBeenCalledWith({
            action: "AUTHENTICATE",
            resource: "SESSION",
            resourceId: null,
            userId: null,
            userEmail: null,
            tenantId: null,
            status: "DENIED",
            metadata: { errorMessage: "Access token not found", origin: "AuthenticationGuard" },
        });
    });

    it("should not record an audit when authentication fails without audit metadata", async () => {
        const { guard, reflector, auditRecorder, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        jest.spyOn(reflector, "get").mockReturnValue(undefined);
        jest.spyOn(CookieHelper, "get").mockReturnValue(undefined);
        await expect(guard.canActivate(context)).rejects.toThrow(new UnauthorizedException("Access token not found"));
        expect(auditRecorder.record).not.toHaveBeenCalled();
    });

    it("should record the token verification error in the audit metadata", async () => {
        const { guard, reflector, auditRecorder, tokenVerifier, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        jest.spyOn(reflector, "get").mockReturnValue({
            action: "AUTHENTICATE",
            resource: "SESSION",
        });
        jest.spyOn(CookieHelper, "get").mockReturnValue("invalid-token");
        jest.spyOn(tokenVerifier, "verify").mockRejectedValue(new Error("Invalid access token"));
        await expect(guard.canActivate(context)).rejects.toThrow("Invalid access token");
        expect(auditRecorder.record).toHaveBeenCalledWith({
            action: "AUTHENTICATE",
            resource: "SESSION",
            resourceId: null,
            userId: null,
            userEmail: null,
            tenantId: null,
            status: "DENIED",
            metadata: {
                errorMessage: "Invalid access token",
                origin: "AuthenticationGuard",
            },
        });
    });

    it("should record the invalid session error in the audit metadata", async () => {
        const { guard, reflector, auditRecorder, tokenVerifier, sessionValidator, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        jest.spyOn(reflector, "get").mockReturnValue({
            action: "AUTHENTICATE",
            resource: "SESSION",
        });
        jest.spyOn(CookieHelper, "get").mockReturnValue("access-token");
        jest.spyOn(tokenVerifier, "verify").mockResolvedValue({
            sub: "user-id",
            tenantId: "tenant-id",
            roleCode: "ADMIN",
            emailVerified: true,
            sessionId: "session-id",
        });
        sessionValidator.validate.mockResolvedValue(false);
        await expect(guard.canActivate(context)).rejects.toThrow(
            new UnauthorizedException("Invalid or revoked session"),
        );
        expect(auditRecorder.record).toHaveBeenCalledWith({
            action: "AUTHENTICATE",
            resource: "SESSION",
            resourceId: null,
            userId: null,
            userEmail: null,
            tenantId: null,
            status: "DENIED",
            metadata: { errorMessage: "Invalid or revoked session", origin: "AuthenticationGuard" },
        });
    });

    it("should record Unknown error when the authentication error is not an Error instance", async () => {
        const { guard, reflector, auditRecorder, tokenVerifier, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        jest.spyOn(reflector, "get").mockReturnValue({
            action: "AUTHENTICATE",
            resource: "SESSION",
        });
        jest.spyOn(CookieHelper, "get").mockReturnValue("invalid-token");
        jest.spyOn(tokenVerifier, "verify").mockRejectedValue("Something went wrong");
        await expect(guard.canActivate(context)).rejects.toBe("Something went wrong");
        expect(auditRecorder.record).toHaveBeenCalledWith({
            action: "AUTHENTICATE",
            resource: "SESSION",
            resourceId: null,
            userId: null,
            userEmail: null,
            tenantId: null,
            status: "DENIED",
            metadata: {
                errorMessage: "Unknown error",
                origin: "AuthenticationGuard",
            },
        });
    });
});
