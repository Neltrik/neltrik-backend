import { RoleTenantRepositorySpy, TenantApiSpy, TransactionManagerSpy } from "../../../../test-doubles";
import { DisassociateRolesFromTenantUseCase } from "./index";

describe("DisassociateRolesFromTenantUseCase", () => {
    const makeSut = () => {
        const roleTenantRepository = new RoleTenantRepositorySpy();
        const tenantApi = new TenantApiSpy();
        const transactionManager = new TransactionManagerSpy();
        const useCase = new DisassociateRolesFromTenantUseCase(roleTenantRepository, tenantApi, transactionManager);
        return { useCase, roleTenantRepository, tenantApi, transactionManager };
    };

    it("should disassociate multiple roles successfully", async () => {
        const { useCase, roleTenantRepository, tenantApi, transactionManager } = makeSut();
        const roleIds = ["role-1", "role-2"];
        tenantApi.validate.mockResolvedValue(undefined);
        const result = await useCase.execute({ tenantId: "tenant-id", roleIds });
        expect(transactionManager.execute).toHaveBeenCalledTimes(1);
        expect(tenantApi.validate).toHaveBeenCalledWith("tenant-id");
        expect(roleTenantRepository.disassociateRoles).toHaveBeenCalledTimes(1);
        expect(roleTenantRepository.disassociateRoles).toHaveBeenCalledWith(roleIds, "tenant-id", expect.anything());
        expect(result).toEqual({ tenantId: "tenant-id", roleIds });
    });

    it("should remove duplicated role ids from the input", async () => {
        const { useCase, roleTenantRepository, tenantApi } = makeSut();
        tenantApi.validate.mockResolvedValue(undefined);
        await useCase.execute({ tenantId: "tenant-id", roleIds: ["role-1", "role-1", "role-2"] });
        expect(roleTenantRepository.disassociateRoles).toHaveBeenCalledWith(
            ["role-1", "role-2"],
            "tenant-id",
            expect.anything(),
        );
    });

    it("should reject the operation when the tenant does not exist", async () => {
        const { useCase, roleTenantRepository, tenantApi } = makeSut();
        tenantApi.validate.mockRejectedValue(new Error("Tenant not found"));
        await expect(useCase.execute({ tenantId: "tenant-id", roleIds: ["role-1"] })).rejects.toThrow(
            "Tenant not found",
        );
        expect(roleTenantRepository.disassociateRoles).not.toHaveBeenCalled();
    });

    it("should not require role existence before disassociating", async () => {
        const { useCase, roleTenantRepository, tenantApi } = makeSut();
        tenantApi.validate.mockResolvedValue(undefined);
        await useCase.execute({ tenantId: "tenant-id", roleIds: ["role-1", "role-that-does-not-exist"] });
        expect(roleTenantRepository.disassociateRoles).toHaveBeenCalledWith(
            ["role-1", "role-that-does-not-exist"],
            "tenant-id",
            expect.anything(),
        );
    });

    it("should propagate repository errors", async () => {
        const { useCase, roleTenantRepository, tenantApi } = makeSut();
        tenantApi.validate.mockResolvedValue(undefined);
        roleTenantRepository.disassociateRoles.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute({ tenantId: "tenant-id", roleIds: ["role-1"] })).rejects.toThrow("Database error");
    });

    it("should propagate tenant api errors", async () => {
        const { useCase, tenantApi, roleTenantRepository } = makeSut();
        tenantApi.validate.mockRejectedValue(new Error("Tenant validation error"));
        await expect(useCase.execute({ tenantId: "tenant-id", roleIds: ["role-1"] })).rejects.toThrow(
            "Tenant validation error",
        );
        expect(roleTenantRepository.disassociateRoles).not.toHaveBeenCalled();
    });
});
