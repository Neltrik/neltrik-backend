import { Tenant } from "../../../../domain/entities";
import { TenantNotFoundError } from "../../../../domain/errors";
import { AuthorizationRoleApiSpy, TenantRepositorySpy } from "../../../../test-doubles";
import { GetTenantUseCase } from "./index";

const makeTenant = () =>
    Tenant.create({
        id: "tenant-id",
        name: "Neltrik",
        slug: "neltrik-tenant",
        type: "CUSTOMER",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
        suspendedAt: null,
    });

const makeRoles = () => [
    {
        id: "role-1",
        code: "TENANT_ADMIN",
        defaultDisplayName: "Administrador",
        description: "Tenant administrator.",
        scope: "TENANT",
    },
];

describe("GetTenantUseCase", () => {
    const makeSut = () => {
        const tenantRepository = new TenantRepositorySpy();
        const authorizationRoleApi = new AuthorizationRoleApiSpy();
        tenantRepository.get.mockResolvedValue(makeTenant());
        authorizationRoleApi.getRolesByTenantId.mockResolvedValue(makeRoles());
        const useCase = new GetTenantUseCase(tenantRepository, authorizationRoleApi);
        return { useCase, tenantRepository, authorizationRoleApi };
    };

    it("should return tenant and enabled roles successfully", async () => {
        const { useCase, tenantRepository, authorizationRoleApi } = makeSut();
        const result = await useCase.execute("tenant-id");
        expect(tenantRepository.get).toHaveBeenCalledTimes(1);
        expect(tenantRepository.get).toHaveBeenCalledWith("tenant-id");
        expect(authorizationRoleApi.getRolesByTenantId).toHaveBeenCalledTimes(1);
        expect(authorizationRoleApi.getRolesByTenantId).toHaveBeenCalledWith("tenant-id");
        expect(result).toEqual({ tenant: makeTenant(), roles: makeRoles() });
    });

    it("should return an empty roles array when tenant has no enabled roles", async () => {
        const { useCase, authorizationRoleApi } = makeSut();
        authorizationRoleApi.getRolesByTenantId.mockResolvedValue([]);
        const result = await useCase.execute("tenant-id");
        expect(result).toEqual({ tenant: makeTenant(), roles: [] });
    });

    it("should throw TenantNotFoundError when tenant does not exist", async () => {
        const { useCase, tenantRepository, authorizationRoleApi } = makeSut();
        tenantRepository.get.mockResolvedValue(null);
        await expect(useCase.execute("tenant-id")).rejects.toThrow(TenantNotFoundError);
        expect(authorizationRoleApi.getRolesByTenantId).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, tenantRepository, authorizationRoleApi } = makeSut();
        tenantRepository.get.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("tenant-id")).rejects.toThrow("Database error");
        expect(authorizationRoleApi.getRolesByTenantId).not.toHaveBeenCalled();
    });

    it("should propagate authorization api errors", async () => {
        const { useCase, authorizationRoleApi } = makeSut();
        authorizationRoleApi.getRolesByTenantId.mockRejectedValue(new Error("Authorization error"));
        await expect(useCase.execute("tenant-id")).rejects.toThrow("Authorization error");
    });
});
