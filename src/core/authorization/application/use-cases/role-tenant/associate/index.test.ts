import { Role } from "../../../../domain/entities";
import { InvalidRoleScopeError, RoleNotFoundError } from "../../../../domain/errors";
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

    it("should associate multiple roles successfully for a platform tenant", async () => {
        const { useCase, roleRepository, roleTenantRepository, tenantApi, transactionManager } = makeSut();
        const roleIds = ["role-1", "role-2"];
        tenantApi.isPlatformTenant.mockResolvedValue(true);
        roleRepository.getByIds.mockResolvedValue([makeRole("role-1", "PLATFORM"), makeRole("role-2", "TENANT")]);
        const result = await useCase.execute({ tenantId: "tenant-id", roleIds });
        expect(transactionManager.execute).toHaveBeenCalledTimes(1);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith("tenant-id");
        expect(roleRepository.getByIds).toHaveBeenCalledWith(roleIds);
        expect(roleTenantRepository.associateRoles).toHaveBeenCalledTimes(1);
        expect(roleTenantRepository.associateRoles).toHaveBeenCalledWith(roleIds, "tenant-id", expect.anything());
        expect(result).toEqual({ tenantId: "tenant-id", roleIds });
    });

    it("should associate TENANT roles successfully for a customer tenant", async () => {
        const { useCase, roleRepository, roleTenantRepository, tenantApi } = makeSut();
        const roleIds = ["role-1", "role-2"];
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        roleRepository.getByIds.mockResolvedValue([makeRole("role-1", "TENANT"), makeRole("role-2", "TENANT")]);
        const result = await useCase.execute({ tenantId: "tenant-id", roleIds });
        expect(roleTenantRepository.associateRoles).toHaveBeenCalledWith(roleIds, "tenant-id", expect.anything());
        expect(result).toEqual({ tenantId: "tenant-id", roleIds });
    });

    it("should reject the operation when at least one role does not exist", async () => {
        const { useCase, roleRepository, roleTenantRepository, tenantApi } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        roleRepository.getByIds.mockResolvedValue([makeRole("role-1", "TENANT")]);
        await expect(useCase.execute({ tenantId: "tenant-id", roleIds: ["role-1", "role-2"] })).rejects.toThrow(
            RoleNotFoundError,
        );
        expect(roleTenantRepository.associateRoles).not.toHaveBeenCalled();
    });

    it("should reject a PLATFORM role for a customer tenant", async () => {
        const { useCase, roleRepository, roleTenantRepository, tenantApi } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        roleRepository.getByIds.mockResolvedValue([makeRole("role-1", "PLATFORM")]);
        await expect(useCase.execute({ tenantId: "tenant-id", roleIds: ["role-1"] })).rejects.toThrow(
            InvalidRoleScopeError,
        );
        expect(roleTenantRepository.associateRoles).not.toHaveBeenCalled();
    });

    it("should allow a PLATFORM role for the platform tenant", async () => {
        const { useCase, roleRepository, roleTenantRepository, tenantApi } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValue(true);
        roleRepository.getByIds.mockResolvedValue([makeRole("role-1", "PLATFORM")]);
        await useCase.execute({ tenantId: "tenant-id", roleIds: ["role-1"] });
        expect(roleTenantRepository.associateRoles).toHaveBeenCalledWith(["role-1"], "tenant-id", expect.anything());
    });

    it("should remove duplicated role ids from the input", async () => {
        const { useCase, roleRepository, roleTenantRepository, tenantApi } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        roleRepository.getByIds.mockResolvedValue([makeRole("role-1", "TENANT"), makeRole("role-2", "TENANT")]);
        await useCase.execute({ tenantId: "tenant-id", roleIds: ["role-1", "role-1", "role-2"] });
        expect(roleRepository.getByIds).toHaveBeenCalledWith(["role-1", "role-2"]);
        expect(roleTenantRepository.associateRoles).toHaveBeenCalledWith(
            ["role-1", "role-2"],
            "tenant-id",
            expect.anything(),
        );
    });

    it("should reject the entire operation when one of the roles has an invalid PLATFORM scope", async () => {
        const { useCase, roleRepository, roleTenantRepository, tenantApi } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        roleRepository.getByIds.mockResolvedValue([
            makeRole("role-1", "TENANT"),
            makeRole("role-2", "PLATFORM"),
            makeRole("role-3", "TENANT"),
        ]);
        await expect(
            useCase.execute({ tenantId: "tenant-id", roleIds: ["role-1", "role-2", "role-3"] }),
        ).rejects.toThrow(InvalidRoleScopeError);
        expect(roleTenantRepository.associateRoles).not.toHaveBeenCalled();
    });

    it("should propagate tenant api errors", async () => {
        const { useCase, tenantApi, roleRepository, roleTenantRepository } = makeSut();
        roleRepository.getByIds.mockResolvedValue([makeRole("role-1", "TENANT")]);
        tenantApi.isPlatformTenant.mockRejectedValue(new Error("Tenant validation error"));
        await expect(useCase.execute({ tenantId: "tenant-id", roleIds: ["role-1"] })).rejects.toThrow(
            "Tenant validation error",
        );
        expect(tenantApi.validate).toHaveBeenCalledWith("tenant-id");
        expect(roleRepository.getByIds).toHaveBeenCalledWith(["role-1"]);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith("tenant-id");
        expect(roleTenantRepository.associateRoles).not.toHaveBeenCalled();
    });

    it("should propagate role repository errors", async () => {
        const { useCase, roleRepository, roleTenantRepository, tenantApi } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        roleRepository.getByIds.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute({ tenantId: "tenant-id", roleIds: ["role-1"] })).rejects.toThrow("Database error");
        expect(roleTenantRepository.associateRoles).not.toHaveBeenCalled();
    });
});
