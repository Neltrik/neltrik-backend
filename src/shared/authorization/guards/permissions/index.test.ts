import { type ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

import { AUDIT_METADATA_KEY, type AuditRecorder } from "@/shared/audit";

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
        const auditRecorder: jest.Mocked<AuditRecorder> = {
            record: jest.fn(),
        };
        const guard = new PermissionsGuard(reflector, auditRecorder, permissionChecker);
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
        return { guard, reflector, auditRecorder, permissionChecker, hasPermissionMock, context, request };
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
        await expect(guard.canActivate(context)).rejects.toThrow(
            new ForbiddenException("User does not have permission"),
        );
        expect(permissionChecker.hasPermission).not.toHaveBeenCalled();
    });

    it("should allow access when user has all required permissions", async () => {
        const { guard, reflector, hasPermissionMock, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride")
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(["USER_CREATE", "USER_READ"]);
        request.user = {
            userId: "user-id",
            tenantId: "tenant-id",
            roleCode: "ADMIN",
            sessionId: "",
            userState: { status: "SUSPENDED" },
            tenantState: { status: "ACTIVE" },
        };
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
        request.user = {
            userId: "user-id",
            roleCode: "",
            tenantId: "",
            sessionId: "",
            userState: { status: "ACTIVE" },
            tenantState: { status: "ACTIVE" },
        };
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
        request.user = {
            userId: "user-id",
            roleCode: "",
            tenantId: "",
            sessionId: "",
            userState: { status: "ACTIVE" },
            tenantState: { status: "ACTIVE" },
        };
        permissionChecker.hasPermission.mockRejectedValue(new Error("Permission checker error"));
        await expect(guard.canActivate(context)).rejects.toThrow("Permission checker error");
        expect(permissionChecker.hasPermission).toHaveBeenCalledWith("user-id", "USER_CREATE");
    });

    it("should record a denied audit when no permissions are defined", async () => {
        const { guard, reflector, auditRecorder, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false).mockReturnValueOnce(undefined);
        jest.spyOn(reflector, "get").mockReturnValue({
            action: "AUTHORIZE",
            resource: "PERMISSION",
        });
        await expect(guard.canActivate(context)).rejects.toThrow(
            new ForbiddenException("Access denied: no permissions defined for this endpoint"),
        );
        expect(reflector.get).toHaveBeenCalledWith(AUDIT_METADATA_KEY, context.getHandler());
        expect(auditRecorder.record).toHaveBeenCalledWith({
            action: "AUTHORIZE",
            resource: "PERMISSION",
            resourceId: null,
            userId: null,
            userEmail: null,
            tenantId: null,
            status: "DENIED",
            metadata: {
                errorMessage: "Access denied: no permissions defined for this endpoint",
                origin: "PermissionsGuard",
            },
        });
    });

    it("should record a denied audit when user has no permission", async () => {
        const { guard, reflector, auditRecorder, permissionChecker, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false).mockReturnValueOnce(["USER_CREATE"]);
        jest.spyOn(reflector, "get").mockReturnValue({
            action: "AUTHORIZE",
            resource: "PERMISSION",
        });
        request.user = {
            userId: "user-id",
            roleCode: "",
            tenantId: "",
            sessionId: "",
            userState: { status: "SUSPENDED" },
            tenantState: { status: "SUSPENDED" },
        };
        permissionChecker.hasPermission.mockResolvedValue(false);
        await expect(guard.canActivate(context)).rejects.toThrow(
            new ForbiddenException("Missing required permission: USER_CREATE"),
        );
        expect(auditRecorder.record).toHaveBeenCalledWith({
            action: "AUTHORIZE",
            resource: "PERMISSION",
            resourceId: null,
            userId: null,
            userEmail: null,
            tenantId: null,
            status: "DENIED",
            metadata: { errorMessage: "Missing required permission: USER_CREATE", origin: "PermissionsGuard" },
        });
    });

    it("should not record an audit when authentication fails without audit metadata", async () => {
        const { guard, reflector, auditRecorder, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false).mockReturnValueOnce(["USER_CREATE"]);
        jest.spyOn(reflector, "get").mockReturnValue(undefined);
        await expect(guard.canActivate(context)).rejects.toThrow(
            new ForbiddenException("User does not have permission"),
        );
        expect(auditRecorder.record).not.toHaveBeenCalled();
    });

    it("should record Unknown error when the error is not an Error instance", () => {
        const { guard, reflector, auditRecorder, context } = makeSut();
        class NonError {
            public readonly message = "Something went wrong";
        }
        const nonError: NonError = new NonError();
        jest.spyOn(reflector, "get").mockReturnValue({
            action: "AUTHORIZE",
            resource: "PERMISSION",
        });
        expect(nonError instanceof Error).toBe(false);
        (
            guard as unknown as {
                auditDenied: (context: ExecutionContext, error: unknown) => void;
            }
        ).auditDenied(context, nonError);
        expect(auditRecorder.record).toHaveBeenCalledWith({
            action: "AUTHORIZE",
            resource: "PERMISSION",
            resourceId: null,
            userId: null,
            userEmail: null,
            tenantId: null,
            status: "DENIED",
            metadata: { errorMessage: "Unknown error", origin: "PermissionsGuard" },
        });
    });
});
