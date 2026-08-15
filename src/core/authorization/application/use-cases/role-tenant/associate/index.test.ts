import { Role } from "../../../../domain/entities";
import { CannotManageRoleTenantError, InvalidRoleScopeError, RoleNotFoundError } from "../../../../domain/errors";
import {
    RoleRepositorySpy,
    RoleTenantRepositorySpy,
    TenantApiSpy,
    TransactionManagerSpy,
} from "../../../../test-doubles";
import { AssociateRolesToTenantUseCase } from "./index";

const makeRole = (id: string, scope: "PLATFORM" | "TENANT") =>
    Role.create({
        id,
        code: `ROLE_${id}`,
        defaultDisplayName: "Test Role",
        description: "Test role.",
        permissionIds: [],
        scope,
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });

describe("AssociateRolesToTenantUseCase", () => {
    const makeSut = () => {
        const roleRepository = new RoleRepositorySpy();
        const roleTenantRepository = new RoleTenantRepositorySpy();
        const tenantApi = new TenantApiSpy();
        const transactionManager = new TransactionManagerSpy();
        const useCase = new AssociateRolesToTenantUseCase(
            roleRepository,
            roleTenantRepository,
            tenantApi,
            transactionManager,
        );
        return { useCase, roleRepository, roleTenantRepository, tenantApi, transactionManager };
    };

    it("should associate multiple roles successfully when the actor is a platform tenant", async () => {
        const { useCase, roleRepository, roleTenantRepository, tenantApi, transactionManager } = makeSut();
        const roleIds = ["role-1", "role-2"];
        tenantApi.isPlatformTenant.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        roleRepository.getByIds.mockResolvedValue([makeRole("role-1", "TENANT"), makeRole("role-2", "TENANT")]);
        const result = await useCase.execute({
            actorTenantId: "platform-tenant-id",
            targetTenantId: "customer-tenant-id",
            roleIds,
        });
        expect(transactionManager.execute).toHaveBeenCalledTimes(1);
        expect(tenantApi.isPlatformTenant).toHaveBeenNthCalledWith(1, "platform-tenant-id");
        expect(tenantApi.validate).toHaveBeenCalledWith("customer-tenant-id");
        expect(tenantApi.isPlatformTenant).toHaveBeenNthCalledWith(2, "customer-tenant-id");
        expect(roleRepository.getByIds).toHaveBeenCalledWith(roleIds);
        expect(roleTenantRepository.associateRoles).toHaveBeenCalledTimes(1);
        expect(roleTenantRepository.associateRoles).toHaveBeenCalledWith(
            roleIds,
            "customer-tenant-id",
            expect.anything(),
        );
        expect(result).toEqual({ tenantId: "customer-tenant-id", roleIds });
    });

    it("should reject the operation when the actor is not a platform tenant", async () => {
        const { useCase, tenantApi, roleRepository, roleTenantRepository } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        await expect(
            useCase.execute({
                actorTenantId: "customer-tenant-id",
                targetTenantId: "another-customer-tenant-id",
                roleIds: ["role-1"],
            }),
        ).rejects.toThrow(CannotManageRoleTenantError);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith("customer-tenant-id");
        expect(tenantApi.validate).not.toHaveBeenCalled();
        expect(roleRepository.getByIds).not.toHaveBeenCalled();
        expect(roleTenantRepository.associateRoles).not.toHaveBeenCalled();
    });

    it("should reject the operation when one or more roles do not exist", async () => {
        const { useCase, tenantApi, roleRepository, roleTenantRepository } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValueOnce(true);
        roleRepository.getByIds.mockResolvedValue([makeRole("role-1", "TENANT")]);
        await expect(
            useCase.execute({
                actorTenantId: "platform-tenant-id",
                targetTenantId: "customer-tenant-id",
                roleIds: ["role-1", "role-2"],
            }),
        ).rejects.toThrow(RoleNotFoundError);
        expect(tenantApi.validate).toHaveBeenCalledWith("customer-tenant-id");
        expect(roleRepository.getByIds).toHaveBeenCalledWith(["role-1", "role-2"]);
        expect(roleTenantRepository.associateRoles).not.toHaveBeenCalled();
    });

    it("should reject a PLATFORM role for a customer target tenant", async () => {
        const { useCase, tenantApi, roleRepository, roleTenantRepository } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        roleRepository.getByIds.mockResolvedValue([makeRole("role-1", "PLATFORM")]);
        await expect(
            useCase.execute({
                actorTenantId: "platform-tenant-id",
                targetTenantId: "customer-tenant-id",
                roleIds: ["role-1"],
            }),
        ).rejects.toThrow(InvalidRoleScopeError);
        expect(roleTenantRepository.associateRoles).not.toHaveBeenCalled();
    });

    it("should allow a PLATFORM role for the platform target tenant", async () => {
        const { useCase, tenantApi, roleRepository, roleTenantRepository } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValueOnce(true).mockResolvedValueOnce(true);
        roleRepository.getByIds.mockResolvedValue([makeRole("role-1", "PLATFORM")]);
        await useCase.execute({
            actorTenantId: "platform-tenant-id",
            targetTenantId: "platform-tenant-id",
            roleIds: ["role-1"],
        });
        expect(roleTenantRepository.associateRoles).toHaveBeenCalledWith(
            ["role-1"],
            "platform-tenant-id",
            expect.anything(),
        );
    });

    it("should remove duplicated role ids from the input", async () => {
        const { useCase, tenantApi, roleRepository, roleTenantRepository } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        roleRepository.getByIds.mockResolvedValue([makeRole("role-1", "TENANT"), makeRole("role-2", "TENANT")]);
        await useCase.execute({
            actorTenantId: "platform-tenant-id",
            targetTenantId: "customer-tenant-id",
            roleIds: ["role-1", "role-1", "role-2"],
        });
        expect(roleRepository.getByIds).toHaveBeenCalledWith(["role-1", "role-2"]);
        expect(roleTenantRepository.associateRoles).toHaveBeenCalledWith(
            ["role-1", "role-2"],
            "customer-tenant-id",
            expect.anything(),
        );
    });

    it("should reject the entire operation when one of the roles has an invalid PLATFORM scope", async () => {
        const { useCase, tenantApi, roleRepository, roleTenantRepository } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        roleRepository.getByIds.mockResolvedValue([
            makeRole("role-1", "TENANT"),
            makeRole("role-2", "PLATFORM"),
            makeRole("role-3", "TENANT"),
        ]);
        await expect(
            useCase.execute({
                actorTenantId: "platform-tenant-id",
                targetTenantId: "customer-tenant-id",
                roleIds: ["role-1", "role-2", "role-3"],
            }),
        ).rejects.toThrow(InvalidRoleScopeError);
        expect(roleTenantRepository.associateRoles).not.toHaveBeenCalled();
    });

    it("should propagate tenant api errors when validating the actor", async () => {
        const { useCase, tenantApi, roleRepository, roleTenantRepository } = makeSut();
        tenantApi.isPlatformTenant.mockRejectedValueOnce(new Error("Tenant validation error"));
        await expect(
            useCase.execute({
                actorTenantId: "platform-tenant-id",
                targetTenantId: "customer-tenant-id",
                roleIds: ["role-1"],
            }),
        ).rejects.toThrow("Tenant validation error");
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith("platform-tenant-id");
        expect(tenantApi.validate).not.toHaveBeenCalled();
        expect(roleRepository.getByIds).not.toHaveBeenCalled();
        expect(roleTenantRepository.associateRoles).not.toHaveBeenCalled();
    });

    it("should propagate tenant api errors when validating the target tenant", async () => {
        const { useCase, tenantApi, roleRepository, roleTenantRepository } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValueOnce(true);
        tenantApi.validate.mockRejectedValueOnce(new Error("Target tenant validation error"));
        await expect(
            useCase.execute({
                actorTenantId: "platform-tenant-id",
                targetTenantId: "customer-tenant-id",
                roleIds: ["role-1"],
            }),
        ).rejects.toThrow("Target tenant validation error");
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith("platform-tenant-id");
        expect(tenantApi.validate).toHaveBeenCalledWith("customer-tenant-id");
        expect(roleRepository.getByIds).not.toHaveBeenCalled();
        expect(roleTenantRepository.associateRoles).not.toHaveBeenCalled();
    });

    it("should propagate tenant api errors when validating the target scope", async () => {
        const { useCase, tenantApi, roleRepository, roleTenantRepository } = makeSut();
        tenantApi.isPlatformTenant
            .mockResolvedValueOnce(true)
            .mockRejectedValueOnce(new Error("Target tenant scope validation error"));
        roleRepository.getByIds.mockResolvedValue([makeRole("role-1", "PLATFORM")]);
        await expect(
            useCase.execute({
                actorTenantId: "platform-tenant-id",
                targetTenantId: "customer-tenant-id",
                roleIds: ["role-1"],
            }),
        ).rejects.toThrow("Target tenant scope validation error");
        expect(roleTenantRepository.associateRoles).not.toHaveBeenCalled();
    });

    it("should propagate role repository errors", async () => {
        const { useCase, tenantApi, roleRepository, roleTenantRepository } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValueOnce(true);
        roleRepository.getByIds.mockRejectedValue(new Error("Database error"));
        await expect(
            useCase.execute({
                actorTenantId: "platform-tenant-id",
                targetTenantId: "customer-tenant-id",
                roleIds: ["role-1"],
            }),
        ).rejects.toThrow("Database error");
        expect(roleTenantRepository.associateRoles).not.toHaveBeenCalled();
    });

    it("should propagate role tenant repository errors", async () => {
        const { useCase, tenantApi, roleRepository, roleTenantRepository } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        roleRepository.getByIds.mockResolvedValue([makeRole("role-1", "TENANT")]);
        roleTenantRepository.associateRoles.mockRejectedValue(new Error("Association database error"));
        await expect(
            useCase.execute({
                actorTenantId: "platform-tenant-id",
                targetTenantId: "customer-tenant-id",
                roleIds: ["role-1"],
            }),
        ).rejects.toThrow("Association database error");
    });
});
