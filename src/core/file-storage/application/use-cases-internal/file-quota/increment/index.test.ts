import { FileQuota } from "../../../../domain/entities";
import { FileQuotaNotFoundError } from "../../../../domain/errors";
import { FileQuotaRepositorySpy } from "../../../../test-doubles";
import { IncrementQuotaInternalUseCase } from "./index";
import type { IncrementQuotaInput } from "./input";

const makeInput = (): IncrementQuotaInput => ({ tenantId: "tenant-id", size: 1_000 });

const makeQuota = (): FileQuota => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return FileQuota.restore({
        id: "quota-id",
        tenantId: "tenant-id",
        limitBytes: 10_000,
        usedBytes: 3_000,
        createdAt,
        updatedAt: createdAt,
    });
};

describe("IncrementQuotaInternalUseCase", () => {
    const makeSut = () => {
        const fileQuotaRepository = new FileQuotaRepositorySpy();
        const useCase = new IncrementQuotaInternalUseCase(fileQuotaRepository);
        return { useCase, fileQuotaRepository };
    };

    it("should increment quota successfully", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const quota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(quota);
        const result = await useCase.execute(makeInput());
        expect(fileQuotaRepository.incrementUsedBytes).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.incrementUsedBytes).toHaveBeenCalledWith("tenant-id", 1_000, undefined);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
        expect(result).toBe(quota);
    });

    it("should increment quota with the specified size", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const quota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(quota);
        await useCase.execute({ tenantId: "tenant-id", size: 2_000 });
        expect(fileQuotaRepository.incrementUsedBytes).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.incrementUsedBytes).toHaveBeenCalledWith("tenant-id", 2_000, undefined);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
    });

    it("should return the updated quota", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const quota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(quota);
        const result = await useCase.execute(makeInput());
        expect(result).toBeInstanceOf(FileQuota);
        expect(result).toBe(quota);
    });

    it("should throw FileQuotaNotFoundError when quota does not exist", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        fileQuotaRepository.findByTenantId.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(FileQuotaNotFoundError);
        expect(fileQuotaRepository.incrementUsedBytes).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.incrementUsedBytes).toHaveBeenCalledWith("tenant-id", 1_000, undefined);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
    });

    it("should propagate repository errors when incrementing quota", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        fileQuotaRepository.incrementUsedBytes.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(fileQuotaRepository.incrementUsedBytes).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.incrementUsedBytes).toHaveBeenCalledWith("tenant-id", 1_000, undefined);
        expect(fileQuotaRepository.findByTenantId).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when finding quota", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        fileQuotaRepository.findByTenantId.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(fileQuotaRepository.incrementUsedBytes).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.incrementUsedBytes).toHaveBeenCalledWith("tenant-id", 1_000, undefined);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
    });

    it("should pass the transaction context to the repository", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const quota = makeQuota();
        const context = { get: jest.fn() };
        fileQuotaRepository.findByTenantId.mockResolvedValue(quota);
        await useCase.execute(makeInput(), context);
        expect(fileQuotaRepository.incrementUsedBytes).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.incrementUsedBytes).toHaveBeenCalledWith("tenant-id", 1_000, context);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
    });
});
