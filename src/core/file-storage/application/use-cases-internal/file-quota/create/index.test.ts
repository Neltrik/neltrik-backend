import type { IdGenerator } from "@/shared/id-generator";

import { FileQuota } from "../../../../domain/entities";
import { FileQuotaRepositorySpy } from "../../../../test-doubles";
import { DEFAULT_FILE_QUOTA_LIMIT_BYTES } from "../../../constants";
import { CreateOrGetQuotaInternalUseCase } from "./index";

describe("CreateOrGetQuotaInternalUseCase", () => {
    const makeSut = () => {
        const fileQuotaRepository = new FileQuotaRepositorySpy();
        const generateMock = jest.fn().mockReturnValue("quota-id");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;
        const useCase = new CreateOrGetQuotaInternalUseCase(idGenerator, fileQuotaRepository);
        return { useCase, fileQuotaRepository, generateMock };
    };

    it("should return the existing quota when it exists", async () => {
        const { useCase, fileQuotaRepository, generateMock } = makeSut();
        const quota = FileQuota.restore({
            id: "quota-id",
            tenantId: "tenant-id",
            limitBytes: DEFAULT_FILE_QUOTA_LIMIT_BYTES,
            usedBytes: 2_000,
            createdAt: new Date("2025-01-01T00:00:00.000Z"),
            updatedAt: new Date("2025-01-01T00:00:00.000Z"),
        });
        fileQuotaRepository.findByTenantId.mockResolvedValue(quota);
        const result = await useCase.execute("tenant-id");
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
        expect(generateMock).not.toHaveBeenCalled();
        expect(fileQuotaRepository.create).not.toHaveBeenCalled();
        expect(result).toBe(quota);
    });

    it("should create and return a quota when it does not exist", async () => {
        const { useCase, fileQuotaRepository, generateMock } = makeSut();
        fileQuotaRepository.findByTenantId.mockResolvedValue(null);
        fileQuotaRepository.create.mockResolvedValue(undefined);
        const result = await useCase.execute("tenant-id");
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
        expect(generateMock).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.create).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.create).toHaveBeenCalledWith(result);
        expect(result).toBeInstanceOf(FileQuota);
        expect(result.id).toBe("quota-id");
        expect(result.tenantId).toBe("tenant-id");
        expect(result.limitBytes).toBe(DEFAULT_FILE_QUOTA_LIMIT_BYTES);
        expect(result.usedBytes).toBe(0);
        expect(result.getAvailableBytes()).toBe(DEFAULT_FILE_QUOTA_LIMIT_BYTES);
    });

    it("should initialize the quota with the current date", async () => {
        const { useCase, fileQuotaRepository } = makeSut();
        fileQuotaRepository.findByTenantId.mockResolvedValue(null);
        fileQuotaRepository.create.mockResolvedValue(undefined);
        const before = new Date();
        const result = await useCase.execute("tenant-id");
        const after = new Date();
        expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(result.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
        expect(result.updatedAt).toBe(result.createdAt);
    });

    it("should propagate repository errors when finding quota", async () => {
        const { useCase, fileQuotaRepository, generateMock } = makeSut();
        fileQuotaRepository.findByTenantId.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("tenant-id")).rejects.toThrow("Database error");
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(generateMock).not.toHaveBeenCalled();
        expect(fileQuotaRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when creating quota", async () => {
        const { useCase, fileQuotaRepository, generateMock } = makeSut();
        fileQuotaRepository.findByTenantId.mockResolvedValue(null);
        fileQuotaRepository.create.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("tenant-id")).rejects.toThrow("Database error");
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(generateMock).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.create).toHaveBeenCalledTimes(1);
    });
});
