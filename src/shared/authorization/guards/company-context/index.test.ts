import { type ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

import { AUDIT_METADATA_KEY, type AuditRecorder } from "@/shared/audit";

import { type CompanyChecker, type MembershipChecker } from "../../contracts";
import { WITHOUT_COMPANY_KEY } from "../../decorators";
import { CompanyContextGuard } from ".";

describe("CompanyContextGuard", () => {
    const makeSut = () => {
        const reflector = new Reflector();
        const isActiveMock = jest.fn();
        const companyChecker = { isActive: isActiveMock } satisfies CompanyChecker;
        const hasActiveMembershipMock = jest.fn();
        const membershipChecker = { hasActiveMembership: hasActiveMembershipMock } satisfies MembershipChecker;
        const auditRecorder: jest.Mocked<AuditRecorder> = { record: jest.fn() };
        const guard = new CompanyContextGuard(reflector, auditRecorder, companyChecker, membershipChecker);
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
        return { guard, reflector, auditRecorder, isActiveMock, hasActiveMembershipMock, context, request };
    };
    const setAdminUserWithCompany = (request: Request, companyId?: string | string[]) => {
        request.user = {
            userId: "user-id",
            roleCode: "ADMIN",
            tenantId: "",
            sessionId: "",
            userState: { status: "ACTIVE" },
            tenantState: { status: "ACTIVE" },
        };
        if (companyId !== undefined) {
            request.headers["x-company-id"] = companyId;
        }
    };
    const expectDeniedAudit = (auditRecorder: jest.Mocked<AuditRecorder>, errorMessage: string) => {
        expect(auditRecorder.record).toHaveBeenCalledWith({
            action: "AUTHORIZE",
            resource: "COMPANY",
            resourceId: null,
            userId: null,
            userEmail: null,
            tenantId: null,
            status: "DENIED",
            metadata: { errorMessage, origin: "CompanyContextGuard" },
        });
    };

    afterEach(() => jest.restoreAllMocks());

    it("should allow access when the route does not require company context", async () => {
        const { guard, reflector, isActiveMock, hasActiveMembershipMock, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(true);
        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(WITHOUT_COMPANY_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        expect(isActiveMock).not.toHaveBeenCalled();
        expect(hasActiveMembershipMock).not.toHaveBeenCalled();
    });

    it("should throw when user is not authenticated", async () => {
        const { guard, reflector, isActiveMock, hasActiveMembershipMock, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        await expect(guard.canActivate(context)).rejects.toThrow(new ForbiddenException("User not authenticated"));
        expect(isActiveMock).not.toHaveBeenCalled();
        expect(hasActiveMembershipMock).not.toHaveBeenCalled();
    });

    it("should allow access when user is a platform admin", async () => {
        const { guard, reflector, isActiveMock, hasActiveMembershipMock, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        request.user = {
            userId: "user-id",
            roleCode: "PLATFORM_ADMIN",
            tenantId: "",
            sessionId: "",
            userState: { status: "ACTIVE" },
            tenantState: { status: "ACTIVE" },
        };
        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(isActiveMock).not.toHaveBeenCalled();
        expect(hasActiveMembershipMock).not.toHaveBeenCalled();
    });

    it.each([undefined, ["company-id"]])(
        "should throw when company header is missing or not a string (%p)",
        async (headerValue) => {
            const { guard, reflector, isActiveMock, hasActiveMembershipMock, context, request } = makeSut();
            jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
            setAdminUserWithCompany(request, headerValue);
            await expect(guard.canActivate(context)).rejects.toThrow(
                new ForbiddenException("Company context required"),
            );
            expect(isActiveMock).not.toHaveBeenCalled();
            expect(hasActiveMembershipMock).not.toHaveBeenCalled();
        },
    );

    it("should throw when company is not active", async () => {
        const { guard, reflector, isActiveMock, hasActiveMembershipMock, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        setAdminUserWithCompany(request, "company-id");
        isActiveMock.mockResolvedValue(false);
        await expect(guard.canActivate(context)).rejects.toThrow(new ForbiddenException("Company is not active"));
        expect(isActiveMock).toHaveBeenCalledWith("company-id");
        expect(hasActiveMembershipMock).not.toHaveBeenCalled();
    });

    it("should allow access when company is active and user has an active membership", async () => {
        const { guard, reflector, isActiveMock, hasActiveMembershipMock, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        setAdminUserWithCompany(request, "company-id");
        isActiveMock.mockResolvedValue(true);
        hasActiveMembershipMock.mockResolvedValue(true);
        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(isActiveMock).toHaveBeenCalledWith("company-id");
        expect(hasActiveMembershipMock).toHaveBeenCalledWith("user-id", "company-id");
    });

    it("should throw when user does not have an active membership", async () => {
        const { guard, reflector, isActiveMock, hasActiveMembershipMock, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        setAdminUserWithCompany(request, "company-id");
        isActiveMock.mockResolvedValue(true);
        hasActiveMembershipMock.mockResolvedValue(false);
        await expect(guard.canActivate(context)).rejects.toThrow(
            new ForbiddenException("User does not have access to this company"),
        );
        expect(hasActiveMembershipMock).toHaveBeenCalledWith("user-id", "company-id");
    });

    it.each([
        ["companyChecker", "isActive", "hasActiveMembership", "Company checker error", false],
        ["membershipChecker", "hasActiveMembership", null, "Membership checker error", true],
    ])("should propagate %s errors", async (_, failingFn, nextFn, errorMessage, companyActive) => {
        const { guard, reflector, isActiveMock, hasActiveMembershipMock, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        setAdminUserWithCompany(request, "company-id");
        if (companyActive) {
            isActiveMock.mockResolvedValue(true);
        }
        const targetMock = failingFn === "isActive" ? isActiveMock : hasActiveMembershipMock;
        targetMock.mockRejectedValue(new Error(errorMessage));
        await expect(guard.canActivate(context)).rejects.toThrow(errorMessage);
        if (nextFn === "hasActiveMembership") {
            expect(hasActiveMembershipMock).not.toHaveBeenCalled();
        }
    });

    it.each([
        ["unauthenticated", undefined, "User not authenticated", false],
        ["missing company", "ADMIN", "Company is not active", false],
        ["inactive company", "ADMIN", "Company is not active", false],
        ["no membership", "ADMIN", "User does not have access to this company", true],
    ])("should record a denied audit when rejected due to %s", async (_, roleCode, errorMessage, activeCompany) => {
        const { guard, reflector, auditRecorder, isActiveMock, hasActiveMembershipMock, context, request } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        jest.spyOn(reflector, "get").mockReturnValue({ action: "AUTHORIZE", resource: "COMPANY" });
        if (roleCode) {
            request.user = {
                userId: "user-id",
                roleCode,
                tenantId: "",
                sessionId: "",
                userState: { status: "ACTIVE" },
                tenantState: { status: "ACTIVE" },
            };
        }
        if (roleCode === "ADMIN") {
            request.headers["x-company-id"] = "company-id";
            isActiveMock.mockResolvedValue(activeCompany);
            if (activeCompany) {
                hasActiveMembershipMock.mockResolvedValue(false);
            }
        }
        await expect(guard.canActivate(context)).rejects.toThrow(new ForbiddenException(errorMessage));
        expect(reflector.get).toHaveBeenCalledWith(AUDIT_METADATA_KEY, context.getHandler());
        expectDeniedAudit(auditRecorder, errorMessage);
    });

    it("should not record an audit when access is denied without audit metadata", async () => {
        const { guard, reflector, auditRecorder, context } = makeSut();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(false);
        await expect(guard.canActivate(context)).rejects.toThrow(new ForbiddenException("User not authenticated"));
        expect(auditRecorder.record).not.toHaveBeenCalled();
    });

    it("should record Unknown error when the error is not an Error instance", () => {
        const { guard, reflector, auditRecorder, context } = makeSut();
        class NonError {
            public readonly message = "Something went wrong";
        }
        jest.spyOn(reflector, "get").mockReturnValue({ action: "AUTHORIZE", resource: "COMPANY" });
        (guard as unknown as { auditDenied: (ctx: ExecutionContext, err: unknown) => void }).auditDenied(
            context,
            new NonError(),
        );
        expectDeniedAudit(auditRecorder, "Unknown error");
    });
});
