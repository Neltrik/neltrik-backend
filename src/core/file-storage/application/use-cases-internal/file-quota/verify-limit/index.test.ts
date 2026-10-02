import { FileQuota } from "../../../../domain/entities";
import { FileQuotaNotFoundError } from "../../../../domain/errors";
import { FileQuotaRepositorySpy } from "../../../../test-doubles";
import { VerifyQuotaLimitUseCase } from "./index";
import type { VerifyQuotaLimitInput } from "./input";

const makeInput = (): VerifyQuotaLimitInput => ({
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

describe("VerifyQuotaLimitUseCase", () => {
    const makeSut = () => {
        const fileQuotaRepository = new FileQuotaRepositorySpy();
        const useCase = new VerifyQuotaLimitUseCase(fileQuotaRepository);
        return { useCase, fileQuotaRepository };
    };

    it("should return true when quota can accommodate the requested size", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const quota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(quota);
        const result = await useCase.execute(makeInput());
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
        expect(result).toBe(true);
    });

    it("should return false when quota cannot accommodate the requested size", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const quota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(quota);
        const result = await useCase.execute({ tenantId: "tenant-id", size: 8_001 });
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
        expect(result).toBe(false);
    });

    it("should return true when requested size exactly reaches the quota limit", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const quota = makeQuota();
        fileQuotaRepository.findByTenantId.mockResolvedValue(quota);
        const result = await useCase.execute({ tenantId: "tenant-id", size: 8_000 });
        expect(result).toBe(true);
    });

    it("should throw FileQuotaNotFoundError when quota does not exist", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        fileQuotaRepository.findByTenantId.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(FileQuotaNotFoundError);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
    });

    it("should propagate repository errors", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        fileQuotaRepository.findByTenantId.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
    });
});
