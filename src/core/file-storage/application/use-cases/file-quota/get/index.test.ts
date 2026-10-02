import { FileQuota } from "../../../../domain/entities";
import { type FileQuotaProps } from "../../../../domain/types";
import { FileQuotaRepositorySpy } from "../../../../test-doubles";
import { DEFAULT_FILE_QUOTA_LIMIT_BYTES } from "../../../constants";
import { GetFileQuotaUseCase } from "./index";

const makeQuota = (overrides: Partial<FileQuotaProps> = {}): FileQuota => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return FileQuota.restore({
        id: "quota-id",
        tenantId: "tenant-id",
        limitBytes: 10_000,
        usedBytes: 2_000,
        createdAt,
        updatedAt: createdAt,
        ...overrides,
    });
};

describe("GetFileQuotaUseCase", () => {
    const makeSut = () => {
        const fileQuotaRepository = new FileQuotaRepositorySpy();
        const useCase = new GetFileQuotaUseCase(fileQuotaRepository);
        return { useCase, fileQuotaRepository };
    };

    it("should return the default quota when tenant has no quota", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        fileQuotaRepository.findByTenantId.mockResolvedValue(null);
        const result = await useCase.execute("tenant-id");
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
        expect(result).toEqual({
            limitBytes: DEFAULT_FILE_QUOTA_LIMIT_BYTES,
            usedBytes: 0,
            availableBytes: DEFAULT_FILE_QUOTA_LIMIT_BYTES,
            isNearLimit: false,
            isOverLimit: false,
        });
    });

    it("should return quota information when tenant has a quota", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        const result = await useCase.execute("tenant-id");
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
        expect(result).toEqual({
            limitBytes: 10_000,
            usedBytes: 2_000,
            availableBytes: 8_000,
            isNearLimit: false,
            isOverLimit: false,
        });
    });

    it("should return isNearLimit as true when quota is near the limit", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota({ usedBytes: 8_000 });
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        const result = await useCase.execute("tenant-id");
        expect(result).toEqual({
            limitBytes: 10_000,
            usedBytes: 8_000,
            availableBytes: 2_000,
            isNearLimit: true,
            isOverLimit: false,
        });
    });

    it("should return isOverLimit as true when quota is over the limit", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota({ usedBytes: 10_001 });
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        const result = await useCase.execute("tenant-id");
        expect(result).toEqual({
            limitBytes: 10_000,
            usedBytes: 10_001,
            availableBytes: -1,
            isNearLimit: true,
            isOverLimit: true,
        });
    });

    it("should return isOverLimit as false when usage is exactly at the limit", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const mockQuota = makeQuota({ usedBytes: 10_000 });
        fileQuotaRepository.findByTenantId.mockResolvedValue(mockQuota);
        const result = await useCase.execute("tenant-id");
        expect(result).toEqual({
            limitBytes: 10_000,
            usedBytes: 10_000,
            availableBytes: 0,
            isNearLimit: true,
            isOverLimit: false,
        });
    });

    it("should propagate repository errors when finding quota", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        fileQuotaRepository.findByTenantId.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("tenant-id")).rejects.toThrow("Database error");
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
    });
});
