import { Tenant } from "../../../../domain/entities";
import { TenantRepositorySpy } from "../../../../test-doubles";
import { ListTenantsUseCase } from "./index";

const makeTenant = (overrides: Partial<Parameters<typeof Tenant.restore>[0]> = {}) =>
    Tenant.restore({
        id: "tenant-id",
        name: "Acme Corporation",
        slug: "acme-corporation",
        type: "CUSTOMER",
        status: "ACTIVE",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
        suspendedAt: null,
        ...overrides,
    });

describe("ListTenantsUseCase", () => {
    const makeSut = () => {
        const tenantRepository = new TenantRepositorySpy();
        const useCase = new ListTenantsUseCase(tenantRepository);
        return { useCase, tenantRepository };
    };

    it("should list all tenants successfully", async () => {
        const { useCase, tenantRepository } = makeSut();
        const tenants = [
            makeTenant({ id: "tenant-1", name: "Acme Corporation", slug: "acme-corporation" }),
            makeTenant({ id: "tenant-2", name: "Globex Corporation", slug: "globex-corporation" }),
        ];
        tenantRepository.list.mockResolvedValue(tenants);
        const result = await useCase.execute();
        expect(tenantRepository.list).toHaveBeenCalledTimes(1);
        expect(result).toEqual(tenants);
    });

    it("should return an empty list when there are no tenants", async () => {
        const { useCase, tenantRepository } = makeSut();
        tenantRepository.list.mockResolvedValue([]);
        const result = await useCase.execute();
        expect(tenantRepository.list).toHaveBeenCalledTimes(1);
        expect(result).toEqual([]);
    });

    it("should propagate repository errors", async () => {
        const { useCase, tenantRepository } = makeSut();
        tenantRepository.list.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute()).rejects.toThrow("Database error");
        expect(tenantRepository.list).toHaveBeenCalledTimes(1);
    });
});
