import { FileQuota } from "../../../../domain/entities";
import { FileQuotaExceededError, FileQuotaNotFoundError } from "../../../../domain/errors";
import { FileQuotaRepositorySpy } from "../../../../test-doubles";
import { IncrementQuotaInternalUseCase } from "./index";
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
        fileQuotaRepository.update.mockResolvedValue(undefined);

        const result = await useCase.execute(makeInput());

        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
        expect(fileQuotaRepository.update).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).toHaveBeenCalledWith(quota, undefined);

        expect(quota.usedBytes).toBe(3_000);
        expect(result).toBe(quota);
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

        const quota = FileQuota.restore({
            id: "quota-id",
            tenantId: "tenant-id",
            limitBytes: 10_000,
            usedBytes: 9_000,
            createdAt: new Date("2025-01-01T00:00:00.000Z"),
            updatedAt: new Date("2025-01-01T00:00:00.000Z"),
        });

        fileQuotaRepository.findByTenantId.mockResolvedValue(quota);

        await expect(
            useCase.execute({
                tenantId: "tenant-id",
                size: 1_001,
            }),
        ).rejects.toThrow(FileQuotaExceededError);

        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).not.toHaveBeenCalled();
        expect(quota.usedBytes).toBe(9_000);
    });

    it("should allow increment when size exactly reaches the limit", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const quota = makeQuota();

        fileQuotaRepository.findByTenantId.mockResolvedValue(quota);
        fileQuotaRepository.update.mockResolvedValue(undefined);

        const result = await useCase.execute({
            tenantId: "tenant-id",
            size: 8_000,
        });

        expect(quota.usedBytes).toBe(10_000);
        expect(fileQuotaRepository.update).toHaveBeenCalledWith(quota, undefined);

        expect(result).toBe(quota);
    });

    it("should pass the transaction context to the repository", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        const quota = makeQuota();
        const context = { get: jest.fn() };

        fileQuotaRepository.findByTenantId.mockResolvedValue(quota);
        fileQuotaRepository.update.mockResolvedValue(undefined);

        await useCase.execute(makeInput(), context);

        expect(fileQuotaRepository.update).toHaveBeenCalledWith(quota, context);
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
        const quota = makeQuota();

        fileQuotaRepository.findByTenantId.mockResolvedValue(quota);
        fileQuotaRepository.update.mockRejectedValue(new Error("Database error"));

        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");

        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).toHaveBeenCalledWith(quota, undefined);

        expect(quota.usedBytes).toBe(3_000);
    });
});
