import { type ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

import { type PermissionChecker } from "../../contracts";
import { PUBLIC_PERMISSION_KEY } from "../../decorators";
import { PermissionsGuard } from ".";

describe("PermissionsGuard", () => {
    const makeSut = () => {
        const reflector = new Reflector();
        const hasPermissionMock = jest.fn();
        const permissionChecker = {
            hasPermission: hasPermissionMock,
        } satisfies PermissionChecker;
        const guard = new PermissionsGuard(reflector, permissionChecker);
        const request = Object.create(Request.prototype) as Request;
        const httpContext = { getRequest: jest.fn().mockReturnValue(request) };
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
        return { guard, reflector, permissionChecker, hasPermissionMock, context, request };
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should allow access when the route is public", async () => {
        const { guard, reflector, permissionChecker, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(true);
        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(PUBLIC_PERMISSION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        expect(permissionChecker.hasPermission).not.toHaveBeenCalled();
    });

    it("should throw when no permissions are defined", async () => {
        const { guard, reflector, permissionChecker, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false).mockReturnValueOnce(undefined);
        await expect(guard.canActivate(context)).rejects.toThrow(
            new ForbiddenException("Access denied: no permissions defined for this endpoint"),
        );
        expect(permissionChecker.hasPermission).not.toHaveBeenCalled();
    });

    it("should throw when permissions are empty", async () => {
        const { guard, reflector, permissionChecker, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false).mockReturnValueOnce([]);
        await expect(guard.canActivate(context)).rejects.toThrow(
            new ForbiddenException("Access denied: no permissions defined for this endpoint"),
        );
        expect(permissionChecker.hasPermission).not.toHaveBeenCalled();
    });

    it("should throw when user is not authenticated", async () => {
        const { guard, reflector, permissionChecker, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false).mockReturnValueOnce(["USER_CREATE"]);
        await expect(guard.canActivate(context)).rejects.toThrow(new ForbiddenException("User not authenticated"));
        expect(permissionChecker.hasPermission).not.toHaveBeenCalled();
    });

    it("should allow access when user has all required permissions", async () => {
        const { guard, reflector, hasPermissionMock, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride")
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(["USER_CREATE", "USER_READ"]);
        request.user = { userId: "user-id", tenantId: "tenant-id", roleCode: "ADMIN" };
        hasPermissionMock.mockResolvedValueOnce(true).mockResolvedValueOnce(true);
        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(hasPermissionMock).toHaveBeenCalledTimes(2);
        expect(hasPermissionMock).toHaveBeenNthCalledWith(1, "user-id", "USER_CREATE");
        expect(hasPermissionMock).toHaveBeenNthCalledWith(2, "user-id", "USER_READ");
    });

    it("should throw when user is missing a required permission", async () => {
        const { guard, reflector, permissionChecker, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride")
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(["USER_CREATE", "USER_DELETE"]);
        request.user = { userId: "user-id", roleCode: "", tenantId: "" };
        permissionChecker.hasPermission.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        await expect(guard.canActivate(context)).rejects.toThrow(
            new ForbiddenException("Missing required permission: USER_DELETE"),
        );
        expect(permissionChecker.hasPermission).toHaveBeenCalledTimes(2);
        expect(permissionChecker.hasPermission).toHaveBeenNthCalledWith(1, "user-id", "USER_CREATE");
        expect(permissionChecker.hasPermission).toHaveBeenNthCalledWith(2, "user-id", "USER_DELETE");
    });

    it("should propagate permission checker errors", async () => {
        const { guard, reflector, permissionChecker, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false).mockReturnValueOnce(["USER_CREATE"]);
        request.user = { userId: "user-id", roleCode: "", tenantId: "" };
        permissionChecker.hasPermission.mockRejectedValue(new Error("Permission checker error"));
        await expect(guard.canActivate(context)).rejects.toThrow("Permission checker error");
        expect(permissionChecker.hasPermission).toHaveBeenCalledWith("user-id", "USER_CREATE");
    });
});
