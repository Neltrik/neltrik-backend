import { FileQuota } from "../../../../domain/entities";
import { FileQuotaNotFoundError } from "../../../../domain/errors";
import { FileQuotaRepositorySpy } from "../../../../test-doubles";
import { DecrementQuotaInternalUseCase } from "./index";
import type { DecrementQuotaInput } from "./input";

const makeInput = (): DecrementQuotaInput => ({ tenantId: "tenant-id", size: 500 });

const makeQuota = (): FileQuota => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return FileQuota.restore({
        id: "quota-id",
        tenantId: "tenant-id",
        limitBytes: 10_000,
        usedBytes: 1_500,
        createdAt,
        updatedAt: createdAt,
    });
};

describe("DecrementQuotaInternalUseCase", () => {
    const makeSut = () => {
        const fileQuotaRepository = new FileQuotaRepositorySpy();
        const useCase = new DecrementQuotaInternalUseCase(fileQuotaRepository);
        return { useCase, fileQuotaRepository };
    };

    it("should decrement quota successfully", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        const result = await useCase.execute(makeInput());
        expect(fileQuotaRepository.decrementUsedBytes).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.decrementUsedBytes).toHaveBeenCalledWith("tenant-id", 500, undefined);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
        expect(result).toBe(mockQuota);
    });

    it("should decrement quota with the specified size", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        await useCase.execute({ tenantId: "tenant-id", size: 2_000 });
        expect(fileQuotaRepository.decrementUsedBytes).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.decrementUsedBytes).toHaveBeenCalledWith("tenant-id", 2_000, undefined);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
    });

    it("should return the updated quota", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        const result = await useCase.execute(makeInput());
        expect(result).toBeInstanceOf(FileQuota);
        expect(result).toBe(mockQuota);
    });

    it("should throw FileQuotaNotFoundError when quota does not exist", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        fileQuotaRepository.findByTenantId.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(FileQuotaNotFoundError);
        expect(fileQuotaRepository.decrementUsedBytes).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.decrementUsedBytes).toHaveBeenCalledWith("tenant-id", 500, undefined);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
    });

    it("should propagate repository errors when decrementing quota", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        fileQuotaRepository.decrementUsedBytes.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(fileQuotaRepository.decrementUsedBytes).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.decrementUsedBytes).toHaveBeenCalledWith("tenant-id", 500, undefined);
        expect(fileQuotaRepository.findByTenantId).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when finding quota", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        fileQuotaRepository.findByTenantId.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(fileQuotaRepository.decrementUsedBytes).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.decrementUsedBytes).toHaveBeenCalledWith("tenant-id", 500, undefined);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
    });

    it("should pass the transaction context to the repository", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota();
        const context = { get: jest.fn() };
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        await useCase.execute(makeInput(), context);
        expect(fileQuotaRepository.decrementUsedBytes).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.decrementUsedBytes).toHaveBeenCalledWith("tenant-id", 500, context);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
    });
});
