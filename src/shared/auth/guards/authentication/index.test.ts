import type { ExecutionContext } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

import { CookieHelper } from "@/shared/http";

import { IS_PUBLIC_KEY } from "../../decorators";
import { TokenVerifier } from "../../providers";
import { AuthenticationGuard } from "./";

jest.mock("@nestjs/jwt", () => ({
    JwtService: jest.fn().mockImplementation(() => ({
        verifyAsync: jest.fn(),
    })),
}));

describe("AuthenticationGuard", () => {
    const makeSut = () => {
        const reflector = new Reflector();
        const jwtService = new JwtService();
        const tokenVerifier = new TokenVerifier(jwtService);
        const guard = new AuthenticationGuard(reflector, tokenVerifier);
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
        return { guard, reflector, tokenVerifier, context, request };
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should allow access when the route is public", async () => {
        const { guard, reflector, tokenVerifier, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
        const verifySpy = jest.spyOn(tokenVerifier, "verify");
        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        expect(verifySpy).not.toHaveBeenCalled();
    });

    it("should throw when the access token is not found", async () => {
        const { guard, reflector, tokenVerifier, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        jest.spyOn(CookieHelper, "get").mockReturnValue(undefined);
        const verifySpy = jest.spyOn(tokenVerifier, "verify");
        await expect(guard.canActivate(context)).rejects.toThrow(new UnauthorizedException("Access token not found"));
        expect(verifySpy).not.toHaveBeenCalled();
    });

    it("should allow access and set the authenticated user when the token is valid", async () => {
        const { guard, reflector, tokenVerifier, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        jest.spyOn(CookieHelper, "get").mockReturnValue("access-token");
        jest.spyOn(tokenVerifier, "verify").mockResolvedValue({
            sub: "user-id",
            tenantId: "tenant-id",
            roleCode: "ADMIN",
            emailVerified: false,
        });
        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(tokenVerifier.verify).toHaveBeenCalledWith("access-token");
        expect(request.user).toEqual({ userId: "user-id", tenantId: "tenant-id", roleCode: "ADMIN" });
    });

    it("should propagate the error when token verification fails", async () => {
        const { guard, reflector, tokenVerifier, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        jest.spyOn(CookieHelper, "get").mockReturnValue("invalid-token");
        jest.spyOn(tokenVerifier, "verify").mockRejectedValue(new Error("Invalid access token"));
        await expect(guard.canActivate(context)).rejects.toThrow("Invalid access token");
        expect(tokenVerifier.verify).toHaveBeenCalledWith("invalid-token");
    });
});
