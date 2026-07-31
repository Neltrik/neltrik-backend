import { Tenant } from "../../../domain/entities";
import { TenantAlreadyActiveError, TenantNotFoundError } from "../../../domain/errors";
import { TENANT_STATUS, type TenantState } from "../../../domain/types";
import { TenantRepositorySpy } from "../../../test-doubles";
import { ReactivateTenantUseCase } from "./index";

const createActiveTenant = (): Tenant => {
    const now = new Date();
    return Tenant.create({
        id: "tenant-id",
        name: "Neltrik",
        slug: "neltrik-12345678",
        createdAt: now,
        updatedAt: now,
        suspendedAt: null,
    });
};

const createSuspendedTenant = (): Tenant => {
    const now = new Date();
    return Tenant.restore({
        id: "tenant-id",
        name: "Neltrik",
        slug: "neltrik-12345678",
        status: TENANT_STATUS.SUSPENDED,
        createdAt: now,
        updatedAt: now,
        suspendedAt: now,
    } satisfies TenantState);
};

describe("ReactivateTenantUseCase", () => {
    const makeSut = () => {
        const tenantRepository = new TenantRepositorySpy();
        tenantRepository.update.mockResolvedValue(undefined);
        const useCase = new ReactivateTenantUseCase(tenantRepository);
        return { useCase, tenantRepository };
    };

    it("should reactivate a suspended tenant", async () => {
        const { useCase, tenantRepository } = makeSut();
        tenantRepository.get.mockResolvedValue(createSuspendedTenant());
        await useCase.execute("tenant-id");
        expect(tenantRepository.get).toHaveBeenCalledWith("tenant-id");
        expect(tenantRepository.update).toHaveBeenCalledTimes(1);
        const tenant = tenantRepository.update.mock.calls[0]![0];
        expect(tenant.status).toBe(TENANT_STATUS.ACTIVE);
        expect(tenant.suspendedAt).toBeNull();
    });

    it("should throw TenantNotFoundError when tenant does not exist", async () => {
        const { useCase, tenantRepository } = makeSut();
        tenantRepository.get.mockResolvedValue(null);
        await expect(useCase.execute("tenant-id")).rejects.toThrow(TenantNotFoundError);
        expect(tenantRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate domain errors", async () => {
        const { useCase, tenantRepository } = makeSut();
        tenantRepository.get.mockResolvedValue(createActiveTenant());
        await expect(useCase.execute("tenant-id")).rejects.toThrow(TenantAlreadyActiveError);
        expect(tenantRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, tenantRepository } = makeSut();
        tenantRepository.get.mockResolvedValue(createSuspendedTenant());
        tenantRepository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("tenant-id")).rejects.toThrow("Database error");
    });
});
