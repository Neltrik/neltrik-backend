import { FileQuota } from "../../../../domain/entities";
import { FileQuotaNotFoundError, InvalidQuotaUsageError } from "../../../../domain/errors";
import { FileQuotaRepositorySpy } from "../../../../test-doubles";
import { DecrementQuotaUseCase } from "./index";
import type { DecrementQuotaInput } from "./input";

const makeInput = (): DecrementQuotaInput => ({ tenantId: "tenant-id", size: 500 });

const makeQuota = (): FileQuota => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return FileQuota.restore({
        id: "quota-id",
        tenantId: "tenant-id",
        limitBytes: 10_000,
        usedBytes: 2_000,
        createdAt,
        updatedAt: createdAt,
    });
};

describe("DecrementQuotaUseCase", () => {
    const makeSut = () => {
        const fileQuotaRepository = new FileQuotaRepositorySpy();
        const useCase = new DecrementQuotaUseCase(fileQuotaRepository);
        return { useCase, fileQuotaRepository };
    };

    it("should decrement quota successfully", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        fileQuotaRepository.update.mockResolvedValue(undefined);
        const result = await useCase.execute(makeInput());
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
        expect(fileQuotaRepository.update).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).toHaveBeenCalledWith(mockQuota, undefined);
        expect(mockQuota.usedBytes).toBe(1_500);
        expect(result).toBe(mockQuota);
    });

    it("should decrement quota down to zero", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        fileQuotaRepository.update.mockResolvedValue(undefined);
        const result = await useCase.execute({ tenantId: "tenant-id", size: 2_000 });
        expect(mockQuota.usedBytes).toBe(0);
        expect(fileQuotaRepository.update).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).toHaveBeenCalledWith(mockQuota, undefined);
        expect(result).toBe(mockQuota);
    });

    it("should throw FileQuotaNotFoundError when quota does not exist", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        fileQuotaRepository.findByTenantId.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(FileQuotaNotFoundError);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
        expect(fileQuotaRepository.update).not.toHaveBeenCalled();
    });

    it("should throw InvalidQuotaUsageError when decrement exceeds current usage", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        await expect(useCase.execute({ tenantId: "tenant-id", size: 2_001 })).rejects.toThrow(InvalidQuotaUsageError);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).not.toHaveBeenCalled();
        expect(mockQuota.usedBytes).toBe(2_000);
    });

    it("should propagate repository errors when finding quota", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        fileQuotaRepository.findByTenantId.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when updating quota", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        fileQuotaRepository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).toHaveBeenCalledWith(mockQuota, undefined);
        expect(mockQuota.usedBytes).toBe(1_500);
    });

    it("should pass the transaction context to the repository", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota();
        const context = { get: jest.fn() };
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        fileQuotaRepository.update.mockResolvedValue(undefined);
        await useCase.execute(makeInput(), context);
        expect(fileQuotaRepository.update).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).toHaveBeenCalledWith(mockQuota, context);
    });
});
