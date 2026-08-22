import { Tenant } from "../../../../domain/entities";
import { InvalidTenantNameError, TenantNotFoundError } from "../../../../domain/errors";
import { TenantRepositorySpy } from "../../../../test-doubles";
import { UpdateTenantUseCase } from "./index";
import type { UpdateTenantInput } from "./input";

const makeTenant = () =>
    Tenant.create({
        id: "tenant-id",
        name: "Neltrik",
        slug: "neltrik-tenant",
        type: "PLATFORM",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
        suspendedAt: null,
    });

const makeInput = (): UpdateTenantInput => ({
    id: "tenant-id",
    name: "Neltrik Updated",
});

describe("UpdateTenantUseCase", () => {
    const makeSut = () => {
        const tenantRepository = new TenantRepositorySpy();
        tenantRepository.get.mockResolvedValue(makeTenant());
        tenantRepository.update.mockResolvedValue(undefined);
        const useCase = new UpdateTenantUseCase(tenantRepository);
        return { useCase, tenantRepository };
    };

    it("should update a tenant successfully", async () => {
        const { useCase, tenantRepository } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(tenantRepository.get).toHaveBeenCalledWith("tenant-id");
        expect(tenantRepository.update).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: "tenant-id" });
    });

    it("should throw TenantNotFoundError when tenant does not exist", async () => {
        const { useCase, tenantRepository } = makeSut();
        tenantRepository.get.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(TenantNotFoundError);
        expect(tenantRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate domain errors", async () => {
        const { useCase, tenantRepository } = makeSut();
        const input = makeInput();
        input.name = "";
        await expect(useCase.execute(input)).rejects.toThrow(InvalidTenantNameError);
        expect(tenantRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, tenantRepository } = makeSut();
        tenantRepository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});
