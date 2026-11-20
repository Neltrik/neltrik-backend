import { type ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

import { AUDIT_METADATA_KEY, type AuditRecorder } from "@/shared/audit";

import { type MembershipChecker } from "../../contracts";
import { WITHOUT_COMPANY_KEY } from "../../decorators";
import { CompanyContextGuard } from ".";

describe("CompanyContextGuard", () => {
    const makeSut = () => {
        const reflector = new Reflector();
        const hasActiveMembershipMock = jest.fn();
        const membershipChecker = {
            hasActiveMembership: hasActiveMembershipMock,
        } satisfies MembershipChecker;
        const auditRecorder: jest.Mocked<AuditRecorder> = { record: jest.fn() };
        const guard = new CompanyContextGuard(reflector, auditRecorder, membershipChecker);
        const request = { headers: {} } as Request;
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
        jest.spyOn(reflector, "get").mockReturnValue(undefined);
        return { guard, reflector, auditRecorder, membershipChecker, hasActiveMembershipMock, context, request };
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should allow access when the route does not require company context", async () => {
        const { guard, reflector, membershipChecker, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(true);
        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(WITHOUT_COMPANY_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        expect(membershipChecker.hasActiveMembership).not.toHaveBeenCalled();
    });

    it("should throw when user is not authenticated", async () => {
        const { guard, reflector, membershipChecker, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        await expect(guard.canActivate(context)).rejects.toThrow(new ForbiddenException("User not authenticated"));
        expect(membershipChecker.hasActiveMembership).not.toHaveBeenCalled();
    });

    it("should allow access when user is a platform admin", async () => {
        const { guard, reflector, membershipChecker, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        request.user = {
            userId: "user-id",
            roleCode: "PLATFORM_ADMIN",
            tenantId: "",
            sessionId: "",
            userState: { status: "ACTIVE" },
            tenantState: { status: "ACTIVE" },
        };
        request.headers["x-company-id"] = "company-id";
        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(membershipChecker.hasActiveMembership).not.toHaveBeenCalled();
    });

    it("should throw when company context is missing", async () => {
        const { guard, reflector, membershipChecker, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        request.user = {
            userId: "user-id",
            roleCode: "ADMIN",
            tenantId: "",
            sessionId: "",
            userState: { status: "ACTIVE" },
            tenantState: { status: "ACTIVE" },
        };
        await expect(guard.canActivate(context)).rejects.toThrow(new ForbiddenException("Company context required"));
        expect(membershipChecker.hasActiveMembership).not.toHaveBeenCalled();
    });

    it("should throw when company header is not a string", async () => {
        const { guard, reflector, membershipChecker, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        request.user = {
            userId: "user-id",
            roleCode: "ADMIN",
            tenantId: "",
            sessionId: "",
            userState: { status: "ACTIVE" },
            tenantState: { status: "ACTIVE" },
        };
        request.headers["x-company-id"] = ["company-id"];
        await expect(guard.canActivate(context)).rejects.toThrow(new ForbiddenException("Company context required"));
        expect(membershipChecker.hasActiveMembership).not.toHaveBeenCalled();
    });

    it("should allow access when user has an active membership", async () => {
        const { guard, reflector, hasActiveMembershipMock, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        request.user = {
            userId: "user-id",
            roleCode: "ADMIN",
            tenantId: "",
            sessionId: "",
            userState: { status: "ACTIVE" },
            tenantState: { status: "ACTIVE" },
        };
        request.headers["x-company-id"] = "company-id";
        hasActiveMembershipMock.mockResolvedValue(true);
        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(hasActiveMembershipMock).toHaveBeenCalledTimes(1);
        expect(hasActiveMembershipMock).toHaveBeenCalledWith("user-id", "company-id");
    });

    it("should throw when user does not have an active membership", async () => {
        const { guard, reflector, hasActiveMembershipMock, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        request.user = {
            userId: "user-id",
            roleCode: "ADMIN",
            tenantId: "",
            sessionId: "",
            userState: { status: "ACTIVE" },
            tenantState: { status: "ACTIVE" },
        };
        request.headers["x-company-id"] = "company-id";
        hasActiveMembershipMock.mockResolvedValue(false);
        await expect(guard.canActivate(context)).rejects.toThrow(
            new ForbiddenException("User does not have access to this company"),
        );
        expect(hasActiveMembershipMock).toHaveBeenCalledTimes(1);
        expect(hasActiveMembershipMock).toHaveBeenCalledWith("user-id", "company-id");
    });

    it("should propagate membership checker errors", async () => {
        const { guard, reflector, hasActiveMembershipMock, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        request.user = {
            userId: "user-id",
            roleCode: "ADMIN",
            tenantId: "",
            sessionId: "",
            userState: { status: "ACTIVE" },
            tenantState: { status: "ACTIVE" },
        };
        request.headers["x-company-id"] = "company-id";
        hasActiveMembershipMock.mockRejectedValue(new Error("Membership checker error"));
        await expect(guard.canActivate(context)).rejects.toThrow("Membership checker error");
        expect(hasActiveMembershipMock).toHaveBeenCalledWith("user-id", "company-id");
    });

    it("should record a denied audit when user is not authenticated", async () => {
        const { guard, reflector, auditRecorder, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        jest.spyOn(reflector, "get").mockReturnValue({ action: "AUTHORIZE", resource: "COMPANY" });
        await expect(guard.canActivate(context)).rejects.toThrow(new ForbiddenException("User not authenticated"));
        expect(reflector.get).toHaveBeenCalledWith(AUDIT_METADATA_KEY, context.getHandler());
        expect(auditRecorder.record).toHaveBeenCalledWith({
            action: "AUTHORIZE",
            resource: "COMPANY",
            resourceId: null,
            userId: null,
            userEmail: null,
            tenantId: null,
            status: "DENIED",
            metadata: { errorMessage: "User not authenticated", origin: "CompanyContextGuard" },
        });
    });

    it("should record a denied audit when company context is missing", async () => {
        const { guard, reflector, auditRecorder, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        jest.spyOn(reflector, "get").mockReturnValue({ action: "AUTHORIZE", resource: "COMPANY" });
        request.user = {
            userId: "user-id",
            roleCode: "ADMIN",
            tenantId: "",
            sessionId: "",
            userState: { status: "ACTIVE" },
            tenantState: { status: "ACTIVE" },
        };
        await expect(guard.canActivate(context)).rejects.toThrow(new ForbiddenException("Company context required"));
        expect(auditRecorder.record).toHaveBeenCalledWith({
            action: "AUTHORIZE",
            resource: "COMPANY",
            resourceId: null,
            userId: null,
            userEmail: null,
            tenantId: null,
            status: "DENIED",
            metadata: { errorMessage: "Company context required", origin: "CompanyContextGuard" },
        });
    });

    it("should record a denied audit when user does not have access to the company", async () => {
        const { guard, reflector, auditRecorder, hasActiveMembershipMock, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        jest.spyOn(reflector, "get").mockReturnValue({ action: "AUTHORIZE", resource: "COMPANY" });
        request.user = {
            userId: "user-id",
            roleCode: "ADMIN",
            tenantId: "",
            sessionId: "",
            userState: { status: "ACTIVE" },
            tenantState: { status: "ACTIVE" },
        };
        request.headers["x-company-id"] = "company-id";
        hasActiveMembershipMock.mockResolvedValue(false);
        await expect(guard.canActivate(context)).rejects.toThrow(
            new ForbiddenException("User does not have access to this company"),
        );
        expect(auditRecorder.record).toHaveBeenCalledWith({
            action: "AUTHORIZE",
            resource: "COMPANY",
            resourceId: null,
            userId: null,
            userEmail: null,
            tenantId: null,
            status: "DENIED",
            metadata: { errorMessage: "User does not have access to this company", origin: "CompanyContextGuard" },
        });
    });

    it("should not record an audit when access is denied without audit metadata", async () => {
        const { guard, reflector, auditRecorder, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        jest.spyOn(reflector, "get").mockReturnValue(undefined);
        await expect(guard.canActivate(context)).rejects.toThrow(new ForbiddenException("User not authenticated"));
        expect(auditRecorder.record).not.toHaveBeenCalled();
    });

    it("should record Unknown error when the error is not an Error instance", () => {
        const { guard, reflector, auditRecorder, context } = makeSut();
        class NonError {
            public readonly message = "Something went wrong";
        }
        const nonError: NonError = new NonError();
        jest.spyOn(reflector, "get").mockReturnValue({ action: "AUTHORIZE", resource: "COMPANY" });
        expect(nonError instanceof Error).toBe(false);
        (
            guard as unknown as {
                auditDenied: (context: ExecutionContext, error: unknown) => void;
            }
        ).auditDenied(context, nonError);
        expect(auditRecorder.record).toHaveBeenCalledWith({
            action: "AUTHORIZE",
            resource: "COMPANY",
            resourceId: null,
            userId: null,
            userEmail: null,
            tenantId: null,
            status: "DENIED",
            metadata: { errorMessage: "Unknown error", origin: "CompanyContextGuard" },
        });
    });
});
