import { PURGE_DELETED_FILES_JOB, PURGE_DELETED_FILES_QUEUE } from "@/core/file-storage/domain/types";
import type { TenantApi } from "@/core/tenant/api";
import type { TenantContextService } from "@/prisma/index";

import type { PurgeDeletedFilesJobsUseCase } from "../../../application/jobs";
import { PurgeDeletedFilesHandler } from "./index";

jest.mock("@/config/index", () => ({
    env: { FILE_DELETION_DRY_RUN: false, FILE_DELETION_GRACE_DAYS: 30 },
}));

describe("PurgeDeletedFilesHandler", () => {
    const makeSut = () => {
        const tenantApi = {
            list: jest.fn().mockResolvedValue([{ id: "tenant-id" }]),
        } as unknown as TenantApi;
        const tenantContext = {
            runWithContext: jest.fn(
                async (
                    _tenantId: string,
                    _userId: string | null,
                    _transaction: boolean,
                    callback: () => Promise<void>,
                ) => await callback(),
            ),
        } as unknown as TenantContextService;
        const purgeDeletedFilesJobsUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        } as unknown as PurgeDeletedFilesJobsUseCase;
        const handler = new PurgeDeletedFilesHandler(tenantApi, tenantContext, purgeDeletedFilesJobsUseCase);
        const payload = {} as never;
        const ctx = {} as never;
        return { handler, tenantApi, tenantContext, purgeDeletedFilesJobsUseCase, payload, ctx };
    };

    it("should expose the correct queue and job name", () => {
        const { handler } = makeSut();
        expect(handler.queue).toBe(PURGE_DELETED_FILES_QUEUE);
        expect(handler.name).toBe(PURGE_DELETED_FILES_JOB);
    });

    it("should purge deleted files for each tenant within its context", async () => {
        const { handler, tenantApi, tenantContext, purgeDeletedFilesJobsUseCase, payload, ctx } = makeSut();
        (tenantApi.list as jest.Mock).mockResolvedValue([{ id: "tenant-1" }, { id: "tenant-2" }]);
        await expect(handler.handle(payload, ctx)).resolves.toBeUndefined();
        expect(tenantApi.list).toHaveBeenCalledTimes(1);
        expect(tenantContext.runWithContext).toHaveBeenCalledTimes(2);
        expect(tenantContext.runWithContext).toHaveBeenNthCalledWith(1, "tenant-1", null, false, expect.any(Function));
        expect(tenantContext.runWithContext).toHaveBeenNthCalledWith(2, "tenant-2", null, false, expect.any(Function));
        expect(purgeDeletedFilesJobsUseCase.execute).toHaveBeenCalledTimes(2);
        expect(purgeDeletedFilesJobsUseCase.execute).toHaveBeenNthCalledWith(1, {
            tenantId: "tenant-1",
            dryRun: false,
            graceDays: 30,
        });
        expect(purgeDeletedFilesJobsUseCase.execute).toHaveBeenNthCalledWith(2, {
            tenantId: "tenant-2",
            dryRun: false,
            graceDays: 30,
        });
    });

    it("should not execute the use case when there are no tenants", async () => {
        const { handler, tenantApi, tenantContext, purgeDeletedFilesJobsUseCase, payload, ctx } = makeSut();
        (tenantApi.list as jest.Mock).mockResolvedValue([]);
        await expect(handler.handle(payload, ctx)).resolves.toBeUndefined();
        expect(tenantApi.list).toHaveBeenCalledTimes(1);
        expect(tenantContext.runWithContext).not.toHaveBeenCalled();
        expect(purgeDeletedFilesJobsUseCase.execute).not.toHaveBeenCalled();
    });

    it("should propagate errors from the tenant API", async () => {
        const { handler, tenantApi, tenantContext, purgeDeletedFilesJobsUseCase, payload, ctx } = makeSut();
        (tenantApi.list as jest.Mock).mockRejectedValue(new Error("Failed to list tenants"));
        await expect(handler.handle(payload, ctx)).rejects.toThrow("Failed to list tenants");
        expect(tenantContext.runWithContext).not.toHaveBeenCalled();
        expect(purgeDeletedFilesJobsUseCase.execute).not.toHaveBeenCalled();
    });

    it("should propagate errors from the purge deleted files use case", async () => {
        const { handler, purgeDeletedFilesJobsUseCase, payload, ctx } = makeSut();
        (purgeDeletedFilesJobsUseCase.execute as jest.Mock).mockRejectedValue(new Error("Deleted files purge failed"));
        await expect(handler.handle(payload, ctx)).rejects.toThrow("Deleted files purge failed");
    });

    it("should propagate errors from the tenant context", async () => {
        const { handler, tenantContext, purgeDeletedFilesJobsUseCase, payload, ctx } = makeSut();
        (tenantContext.runWithContext as jest.Mock).mockRejectedValue(new Error("Tenant context failed"));
        await expect(handler.handle(payload, ctx)).rejects.toThrow("Tenant context failed");
        expect(purgeDeletedFilesJobsUseCase.execute).not.toHaveBeenCalled();
    });

    it("should stop processing remaining tenants when the purge use case fails", async () => {
        const { handler, tenantApi, tenantContext, purgeDeletedFilesJobsUseCase, payload, ctx } = makeSut();
        (tenantApi.list as jest.Mock).mockResolvedValue([{ id: "tenant-1" }, { id: "tenant-2" }]);
        (purgeDeletedFilesJobsUseCase.execute as jest.Mock).mockRejectedValue(new Error("Deleted files purge failed"));
        await expect(handler.handle(payload, ctx)).rejects.toThrow("Deleted files purge failed");
        expect(tenantContext.runWithContext).toHaveBeenCalledTimes(1);
        expect(purgeDeletedFilesJobsUseCase.execute).toHaveBeenCalledTimes(1);
        expect(purgeDeletedFilesJobsUseCase.execute).toHaveBeenCalledWith({
            tenantId: "tenant-1",
            dryRun: false,
            graceDays: 30,
        });
    });
});
