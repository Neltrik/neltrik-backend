import { Role } from "../../../../domain/entities";
import { RoleTenantRepositorySpy } from "../../../../test-doubles";
import { GetRolesByTenantOhsUseCase } from "./index";

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

describe("GetRolesByTenantOhsUseCase", () => {
    const makeSut = () => {
        const roleTenantRepository = new RoleTenantRepositorySpy();
        roleTenantRepository.getRolesByTenant.mockResolvedValue([
            makeRole("role-id-1", "TENANT_ADMIN", "TENANT"),
            makeRole("role-id-2", "TENANT_RECRUITER", "TENANT"),
        ]);
        const useCase = new GetRolesByTenantOhsUseCase(roleTenantRepository);
        return { useCase, roleTenantRepository };
    };

    it("should return roles successfully", async () => {
        const { useCase, roleTenantRepository } = makeSut();
        const roles = await useCase.execute("tenant-id");
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
        expect(roleTenantRepository.getRolesByTenant).toHaveBeenCalledWith("tenant-id");
    });

    it("should propagate role tenant repository errors", async () => {
        const { useCase, roleTenantRepository } = makeSut();
        roleTenantRepository.getRolesByTenant.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("tenant-id")).rejects.toThrow("Database error");
    });
});
