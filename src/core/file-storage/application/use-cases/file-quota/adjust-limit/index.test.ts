import { FileQuota } from "../../../../domain/entities";
import { FileQuotaNotFoundError, QuotaLimitBelowMinimumError } from "../../../../domain/errors";
import { FileQuotaRepositorySpy } from "../../../../test-doubles";
import { MIN_FILE_QUOTA_LIMIT_BYTES } from "../../../constants";
import { AdjustQuotaLimitUseCase } from "./index";

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

describe("AdjustQuotaLimitUseCase", () => {
    const makeSut = () => {
        const fileQuotaRepository = new FileQuotaRepositorySpy();
        const useCase = new AdjustQuotaLimitUseCase(fileQuotaRepository);
        return { useCase, fileQuotaRepository };
    };

    it("should adjust quota limit successfully when quota exists", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        fileQuotaRepository.update.mockResolvedValue();
        const result = await useCase.execute({ tenantId: "tenant-id", newLimitBytes: 20_000 });
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
        expect(fileQuotaRepository.update).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).toHaveBeenCalledWith(mockQuota);
        expect(mockQuota.limitBytes).toBe(20_000);
        expect(result).toBe(mockQuota);
    });

    it("should throw FileQuotaNotFoundError when quota does not exist", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        fileQuotaRepository.findByTenantId.mockResolvedValue(null);
        await expect(useCase.execute({ tenantId: "tenant-id", newLimitBytes: 20_000 })).rejects.toThrow(
            FileQuotaNotFoundError,
        );
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
        expect(fileQuotaRepository.update).not.toHaveBeenCalled();
    });

    it("should throw QuotaLimitBelowMinimumError when new limit is below minimum", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        await expect(
            useCase.execute({ tenantId: "tenant-id", newLimitBytes: MIN_FILE_QUOTA_LIMIT_BYTES - 1 }),
        ).rejects.toThrow(QuotaLimitBelowMinimumError);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
        expect(fileQuotaRepository.update).not.toHaveBeenCalled();
        expect(mockQuota.limitBytes).toBe(10_000);
    });

    it("should allow the minimum quota limit", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        fileQuotaRepository.update.mockResolvedValue();
        const result = await useCase.execute({
            tenantId: "tenant-id",
            newLimitBytes: MIN_FILE_QUOTA_LIMIT_BYTES,
        });
        expect(mockQuota.limitBytes).toBe(MIN_FILE_QUOTA_LIMIT_BYTES);
        expect(fileQuotaRepository.update).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).toHaveBeenCalledWith(mockQuota);
        expect(result).toBe(mockQuota);
    });

    it("should propagate repository errors when finding quota", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        fileQuotaRepository.findByTenantId.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute({ tenantId: "tenant-id", newLimitBytes: 20_000 })).rejects.toThrow(
            "Database error",
        );
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when updating quota", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        fileQuotaRepository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute({ tenantId: "tenant-id", newLimitBytes: 20_000 })).rejects.toThrow(
            "Database error",
        );
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).toHaveBeenCalledWith(mockQuota);
        expect(mockQuota.limitBytes).toBe(20_000);
    });
});
