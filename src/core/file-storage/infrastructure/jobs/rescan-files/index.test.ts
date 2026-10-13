import { RESCAN_FILES_JOB, RESCAN_FILES_QUEUE } from "@/core/file-storage/domain/types";
import type { TenantApi } from "@/core/tenant/api";
import type { TenantContextService } from "@/prisma/index";

import type { RescanFilesJobsUseCase } from "../../../application/jobs";
import { RescanFilesHandler } from "./index";

jest.mock("@/config/index", () => ({ env: { RESCAN_AGE_DAYS: 30, RESCAN_DRY_RUN: false } }));

describe("RescanFilesHandler", () => {
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
        const rescanFilesJobsUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        } as unknown as RescanFilesJobsUseCase;
        const handler = new RescanFilesHandler(tenantApi, tenantContext, rescanFilesJobsUseCase);
        const payload = {} as never;
        const ctx = {} as never;
        return { handler, tenantApi, tenantContext, rescanFilesJobsUseCase, payload, ctx };
    };

    it("should expose the correct queue and job name", () => {
        const { handler } = makeSut();
        expect(handler.queue).toBe(RESCAN_FILES_QUEUE);
        expect(handler.name).toBe(RESCAN_FILES_JOB);
    });

    it("should rescan files for each tenant within its context", async () => {
        const { handler, tenantApi, tenantContext, rescanFilesJobsUseCase, payload, ctx } = makeSut();
        (tenantApi.list as jest.Mock).mockResolvedValue([{ id: "tenant-1" }, { id: "tenant-2" }]);
        await expect(handler.handle(payload, ctx)).resolves.toBeUndefined();
        expect(tenantApi.list).toHaveBeenCalledTimes(1);
        expect(tenantContext.runWithContext).toHaveBeenCalledTimes(2);
        expect(tenantContext.runWithContext).toHaveBeenNthCalledWith(1, "tenant-1", null, false, expect.any(Function));
        expect(tenantContext.runWithContext).toHaveBeenNthCalledWith(2, "tenant-2", null, false, expect.any(Function));
        expect(rescanFilesJobsUseCase.execute).toHaveBeenCalledTimes(2);
        expect(rescanFilesJobsUseCase.execute).toHaveBeenNthCalledWith(1, {
            tenantId: "tenant-1",
            ageDays: 30,
            dryRun: false,
        });
        expect(rescanFilesJobsUseCase.execute).toHaveBeenNthCalledWith(2, {
            tenantId: "tenant-2",
            ageDays: 30,
            dryRun: false,
        });
    });

    it("should not execute the use case when there are no tenants", async () => {
        const { handler, tenantApi, tenantContext, rescanFilesJobsUseCase, payload, ctx } = makeSut();
        (tenantApi.list as jest.Mock).mockResolvedValue([]);
        await expect(handler.handle(payload, ctx)).resolves.toBeUndefined();
        expect(tenantApi.list).toHaveBeenCalledTimes(1);
        expect(tenantContext.runWithContext).not.toHaveBeenCalled();
        expect(rescanFilesJobsUseCase.execute).not.toHaveBeenCalled();
    });

    it("should propagate errors from the tenant API", async () => {
        const { handler, tenantApi, tenantContext, rescanFilesJobsUseCase, payload, ctx } = makeSut();
        (tenantApi.list as jest.Mock).mockRejectedValue(new Error("Failed to list tenants"));
        await expect(handler.handle(payload, ctx)).rejects.toThrow("Failed to list tenants");
        expect(tenantContext.runWithContext).not.toHaveBeenCalled();
        expect(rescanFilesJobsUseCase.execute).not.toHaveBeenCalled();
    });

    it("should propagate errors from the rescan files use case", async () => {
        const { handler, rescanFilesJobsUseCase, payload, ctx } = makeSut();
        (rescanFilesJobsUseCase.execute as jest.Mock).mockRejectedValue(new Error("File rescan failed"));
        await expect(handler.handle(payload, ctx)).rejects.toThrow("File rescan failed");
    });

    it("should propagate errors from the tenant context", async () => {
        const { handler, tenantContext, rescanFilesJobsUseCase, payload, ctx } = makeSut();
        (tenantContext.runWithContext as jest.Mock).mockRejectedValue(new Error("Tenant context failed"));
        await expect(handler.handle(payload, ctx)).rejects.toThrow("Tenant context failed");
        expect(rescanFilesJobsUseCase.execute).not.toHaveBeenCalled();
    });

    it("should stop processing remaining tenants when rescan fails", async () => {
        const { handler, tenantApi, tenantContext, rescanFilesJobsUseCase, payload, ctx } = makeSut();
        (tenantApi.list as jest.Mock).mockResolvedValue([{ id: "tenant-1" }, { id: "tenant-2" }]);
        (rescanFilesJobsUseCase.execute as jest.Mock).mockRejectedValue(new Error("File rescan failed"));
        await expect(handler.handle(payload, ctx)).rejects.toThrow("File rescan failed");
        expect(tenantContext.runWithContext).toHaveBeenCalledTimes(1);
        expect(rescanFilesJobsUseCase.execute).toHaveBeenCalledTimes(1);
        expect(rescanFilesJobsUseCase.execute).toHaveBeenCalledWith({
            tenantId: "tenant-1",
            ageDays: 30,
            dryRun: false,
        });
    });
});
