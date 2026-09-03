import type { ExecutionContext } from "@nestjs/common";
import { ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

import { SKIP_EMAIL_VERIFICATION_KEY } from "../../";
import { EmailVerifiedGuard } from ".";

describe("EmailVerifiedGuard", () => {
    const makeSut = () => {
        const reflector = new Reflector();
        const guard = new EmailVerifiedGuard(reflector);
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
        return { guard, reflector, context, request };
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
        request.user = { userId: "user-id", tenantId: "tenant-id", roleCode: "ADMIN" };
        delete request.account;
        expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("User not authenticated"));
    });

    it("should throw when email is not verified", () => {
        const { guard, reflector, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        request.user = { userId: "user-id", tenantId: "tenant-id", roleCode: "ADMIN" };
        request.account = { emailVerified: false };
        expect(() => guard.canActivate(context)).toThrow(new ForbiddenException("Email not verified"));
    });

    it("should allow access when email is verified", () => {
        const { guard, reflector, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        request.user = {
            userId: "user-id",
            tenantId: "tenant-id",
            roleCode: "ADMIN",
        };
        request.account = { emailVerified: true };
        expect(guard.canActivate(context)).toBe(true);
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(SKIP_EMAIL_VERIFICATION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
    });
});
