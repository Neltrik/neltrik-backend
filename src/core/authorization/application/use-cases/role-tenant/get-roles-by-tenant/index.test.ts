import { Role } from "../../../../domain/entities";
import { RoleTenantRepositorySpy, TenantApiSpy } from "../../../../test-doubles";
import { GetRolesByTenantUseCase } from "./index";

const makeRole = (id: string, code: string, scope: "PLATFORM" | "TENANT") =>
    Role.create({
        id,
        code,
        defaultDisplayName: code,
        description: `${code} role.`,
        permissionIds: [],
        scope,
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });

describe("GetRolesByTenantUseCase", () => {
    const makeSut = () => {
        const roleTenantRepository = new RoleTenantRepositorySpy();
        const tenantApi = new TenantApiSpy();
        roleTenantRepository.getRolesByTenant.mockResolvedValue([
            makeRole("role-id-1", "TENANT_ADMIN", "TENANT"),
            makeRole("role-id-2", "TENANT_RECRUITER", "TENANT"),
        ]);
        const useCase = new GetRolesByTenantUseCase(roleTenantRepository, tenantApi);
        return { useCase, roleTenantRepository, tenantApi };
    };

    it("should return roles successfully", async () => {
        const { useCase, roleTenantRepository, tenantApi } = makeSut();
        const roles = await useCase.execute("tenant-id");
        expect(tenantApi.validate).toHaveBeenCalledTimes(1);
        expect(tenantApi.validate).toHaveBeenCalledWith("tenant-id");
        expect(roleTenantRepository.getRolesByTenant).toHaveBeenCalledTimes(1);
        expect(roleTenantRepository.getRolesByTenant).toHaveBeenCalledWith("tenant-id");
        expect(roles).toHaveLength(2);
        expect(roles[0]?.code).toBe("TENANT_ADMIN");
        expect(roles[1]?.code).toBe("TENANT_RECRUITER");
    });

    it("should return an empty list when the tenant has no roles", async () => {
        const { useCase, roleTenantRepository } = makeSut();
        roleTenantRepository.getRolesByTenant.mockResolvedValue([]);
        const roles = await useCase.execute("tenant-id");
        expect(roles).toEqual([]);
        expect(roleTenantRepository.getRolesByTenant).toHaveBeenCalledTimes(1);
    });

    it("should reject the operation when the tenant does not exist", async () => {
        const { useCase, tenantApi, roleTenantRepository } = makeSut();
        tenantApi.validate.mockRejectedValue(new Error("Tenant not found"));
        await expect(useCase.execute("tenant-id")).rejects.toThrow("Tenant not found");
        expect(roleTenantRepository.getRolesByTenant).not.toHaveBeenCalled();
    });

    it("should propagate tenant api errors", async () => {
        const { useCase, tenantApi, roleTenantRepository } = makeSut();
        tenantApi.validate.mockRejectedValue(new Error("Tenant validation error"));
        await expect(useCase.execute("tenant-id")).rejects.toThrow("Tenant validation error");
        expect(roleTenantRepository.getRolesByTenant).not.toHaveBeenCalled();
    });

    it("should propagate role tenant repository errors", async () => {
        const { useCase, roleTenantRepository } = makeSut();
        roleTenantRepository.getRolesByTenant.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("tenant-id")).rejects.toThrow("Database error");
    });
});
