import { Role } from "../../../../domain/entities";
import { RoleNotEnabledForTenantError } from "../../../../domain/errors";
import { RoleTenantRepositorySpy } from "../../../../test-doubles";
import { CanAssignRoleToTenantOhsUseCase } from "./index";

const makeRole = (id: string) =>
    Role.create({
        id,
        code: `ROLE_${id}`,
        defaultDisplayName: "Test Role",
        description: "Test role.",
        permissionIds: [],
        scope: "TENANT",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });

describe("CanAssignRoleToTenantOhsUseCase", () => {
    const makeSut = () => {
        const roleTenantRepository = new RoleTenantRepositorySpy();
        const useCase = new CanAssignRoleToTenantOhsUseCase(roleTenantRepository);
        return { useCase, roleTenantRepository };
    };

    it("should allow assigning a role enabled for the tenant", async () => {
        const { useCase, roleTenantRepository } = makeSut();
        roleTenantRepository.getRolesByTenant.mockResolvedValue([makeRole("role-1"), makeRole("role-2")]);
        await expect(useCase.execute({ roleId: "role-2", tenantId: "tenant-id" })).resolves.toBeUndefined();
        expect(roleTenantRepository.getRolesByTenant).toHaveBeenCalledWith("tenant-id");
    });

    it("should reject assigning a role that is not enabled for the tenant", async () => {
        const { useCase, roleTenantRepository } = makeSut();
        roleTenantRepository.getRolesByTenant.mockResolvedValue([makeRole("role-1")]);
        await expect(useCase.execute({ roleId: "role-2", tenantId: "tenant-id" })).rejects.toThrow(
            RoleNotEnabledForTenantError,
        );
        expect(roleTenantRepository.getRolesByTenant).toHaveBeenCalledWith("tenant-id");
    });

    it("should propagate repository errors", async () => {
        const { useCase, roleTenantRepository } = makeSut();
        roleTenantRepository.getRolesByTenant.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute({ roleId: "role-1", tenantId: "tenant-id" })).rejects.toThrow("Database error");
    });
});
