import { Tenant } from "../../../domain/entities/tenant";
import { TenantAlreadySuspendedError, TenantNotFoundError } from "../../../domain/errors";
import { TENANT_STATUS, type TenantState } from "../../../domain/types";
import { TenantRepositorySpy } from "../../../test-doubles";
import { SuspendTenantUseCase } from "./index";

const createTenant = (): Tenant => {
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

describe("SuspendTenantUseCase", () => {
    const makeSut = () => {
        const tenantRepository = new TenantRepositorySpy();
        tenantRepository.update.mockResolvedValue(undefined);
        const useCase = new SuspendTenantUseCase(tenantRepository);
        return { useCase, tenantRepository };
    };

    it("should suspend an active tenant", async () => {
        const { useCase, tenantRepository } = makeSut();
        tenantRepository.get.mockResolvedValue(createTenant());
        await useCase.execute("tenant-id");
        expect(tenantRepository.get).toHaveBeenCalledWith("tenant-id");
        expect(tenantRepository.update).toHaveBeenCalledTimes(1);
        const tenant = tenantRepository.update.mock.calls[0]![0];
        expect(tenant.status).toBe(TENANT_STATUS.SUSPENDED);
        expect(tenant.suspendedAt).not.toBeNull();
    });

    it("should throw TenantNotFoundError when tenant does not exist", async () => {
        const { useCase, tenantRepository } = makeSut();
        tenantRepository.get.mockResolvedValue(null);
        await expect(useCase.execute("tenant-id")).rejects.toThrow(TenantNotFoundError);
        expect(tenantRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate domain errors", async () => {
        const { useCase, tenantRepository } = makeSut();
        tenantRepository.get.mockResolvedValue(createSuspendedTenant());
        await expect(useCase.execute("tenant-id")).rejects.toThrow(TenantAlreadySuspendedError);
        expect(tenantRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, tenantRepository } = makeSut();
        tenantRepository.get.mockResolvedValue(createTenant());
        tenantRepository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("tenant-id")).rejects.toThrow("Database error");
    });
});
