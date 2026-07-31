import { Tenant } from "../../../domain/entities";
import { TenantNotFoundError } from "../../../domain/errors";
import { TenantRepositorySpy } from "../../../test-doubles";
import { GetTenantUseCase } from "./index";

const makeTenant = () =>
    Tenant.create({
        id: "tenant-id",
        name: "Neltrik",
        slug: "neltrik-tenant",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
        suspendedAt: null,
    });

describe("GetTenantUseCase", () => {
    const makeSut = () => {
        const tenantRepository = new TenantRepositorySpy();
        tenantRepository.get.mockResolvedValue(makeTenant());
        const useCase = new GetTenantUseCase(tenantRepository);
        return { useCase, tenantRepository };
    };

    it("should return a tenant successfully", async () => {
        const { useCase, tenantRepository } = makeSut();
        const tenant = await useCase.execute("tenant-id");
        expect(tenantRepository.get).toHaveBeenCalledTimes(1);
        expect(tenantRepository.get).toHaveBeenCalledWith("tenant-id");
        expect(tenant.id).toBe("tenant-id");
    });

    it("should throw TenantNotFoundError when tenant does not exist", async () => {
        const { useCase, tenantRepository } = makeSut();
        tenantRepository.get.mockResolvedValue(null);
        await expect(useCase.execute("tenant-id")).rejects.toThrow(TenantNotFoundError);
    });

    it("should propagate repository errors", async () => {
        const { useCase, tenantRepository } = makeSut();
        tenantRepository.get.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("tenant-id")).rejects.toThrow("Database error");
    });
});
