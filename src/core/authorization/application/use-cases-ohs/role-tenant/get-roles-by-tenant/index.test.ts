import { Role } from "../../../../domain/entities";
import { DisplayName } from "../../../../domain/value-objects";
import { RoleTenantRepositorySpy, TenantRoleConfigurationRepositorySpy } from "../../../../test-doubles";
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
        const tenantRoleConfigurationRepository = new TenantRoleConfigurationRepositorySpy();

        roleTenantRepository.getRolesByTenant.mockResolvedValue([
            makeRole("role-id-1", "TENANT_ADMIN", "TENANT"),
            makeRole("role-id-2", "TENANT_RECRUITER", "TENANT"),
        ]);

        tenantRoleConfigurationRepository.list.mockResolvedValue([]);

        const useCase = new GetRolesByTenantOhsUseCase(roleTenantRepository, tenantRoleConfigurationRepository);

        return {
            useCase,
            roleTenantRepository,
            tenantRoleConfigurationRepository,
        };
    };

    it("should return roles with their default display names", async () => {
        const { useCase, roleTenantRepository, tenantRoleConfigurationRepository } = makeSut();

        const roles = await useCase.execute("tenant-id");

        expect(roleTenantRepository.getRolesByTenant).toHaveBeenCalledWith("tenant-id");
        expect(tenantRoleConfigurationRepository.list).toHaveBeenCalledWith("tenant-id");
        expect(roles).toEqual([
            expect.objectContaining({
                id: "role-id-1",
                code: "TENANT_ADMIN",
                defaultDisplayName: "TENANT_ADMIN",
            }),
            expect.objectContaining({
                id: "role-id-2",
                code: "TENANT_RECRUITER",
                defaultDisplayName: "TENANT_RECRUITER",
            }),
        ]);
    });

    it("should use the customized display name when configured", async () => {
        const { useCase, tenantRoleConfigurationRepository } = makeSut();

        tenantRoleConfigurationRepository.list.mockResolvedValue([
            {
                roleId: "role-id-1",
                displayName: DisplayName.create("Administrador"),
            },
        ] as never);

        const roles = await useCase.execute("tenant-id");

        expect(roles[0]?.defaultDisplayName).toBe("Administrador");
        expect(roles[1]?.defaultDisplayName).toBe("TENANT_RECRUITER");
    });

    it("should return an empty list when the tenant has no roles", async () => {
        const { useCase, roleTenantRepository } = makeSut();

        roleTenantRepository.getRolesByTenant.mockResolvedValue([]);

        await expect(useCase.execute("tenant-id")).resolves.toEqual([]);
    });

    it("should propagate repository errors", async () => {
        const { useCase, roleTenantRepository } = makeSut();

        roleTenantRepository.getRolesByTenant.mockRejectedValue(new Error("Database error"));

        await expect(useCase.execute("tenant-id")).rejects.toThrow("Database error");
    });
});
