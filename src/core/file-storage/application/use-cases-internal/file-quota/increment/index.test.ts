import { FileQuota } from "../../../../domain/entities";
import { FileQuotaExceededError, FileQuotaNotFoundError } from "../../../../domain/errors";
import { FileQuotaRepositorySpy } from "../../../../test-doubles";
import { IncrementQuotaUseCase } from "./index";
import type { IncrementQuotaInput } from "./input";

const makeInput = (): IncrementQuotaInput => ({
    tenantId: "tenant-id",
    size: 1_000,
});

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

describe("IncrementQuotaUseCase", () => {
    const makeSut = () => {
        const fileQuotaRepository = new FileQuotaRepositorySpy();
        const useCase = new IncrementQuotaUseCase(fileQuotaRepository);
        return { useCase, fileQuotaRepository };
    };

    it("should increment quota successfully", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        fileQuotaRepository.update.mockResolvedValue(undefined);
        const result = await useCase.execute(makeInput());
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
        expect(fileQuotaRepository.update).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).toHaveBeenCalledWith(mockQuota);
        expect(mockQuota.usedBytes).toBe(3_000);
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

    it("should throw FileQuotaExceededError when increment exceeds the limit", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = FileQuota.restore({
            id: "quota-id",
            tenantId: "tenant-id",
            limitBytes: 10_000,
            usedBytes: 9_000,
            createdAt: new Date("2025-01-01T00:00:00.000Z"),
            updatedAt: new Date("2025-01-01T00:00:00.000Z"),
        });
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        await expect(useCase.execute({ tenantId: "tenant-id", size: 1_001 })).rejects.toThrow(FileQuotaExceededError);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).not.toHaveBeenCalled();
        expect(mockQuota.usedBytes).toBe(9_000);
    });

    it("should allow increment when size exactly reaches the limit", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        fileQuotaRepository.update.mockResolvedValue(undefined);
        const result = await useCase.execute({ tenantId: "tenant-id", size: 8_000 });
        expect(mockQuota.usedBytes).toBe(10_000);
        expect(fileQuotaRepository.update).toHaveBeenCalledWith(mockQuota);
        expect(result).toBe(mockQuota);
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
        expect(fileQuotaRepository.update).toHaveBeenCalledWith(mockQuota);
        expect(mockQuota.usedBytes).toBe(3_000);
    });
});
