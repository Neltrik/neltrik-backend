import { RECONCILE_STORAGE_JOB, RECONCILE_STORAGE_QUEUE } from "@/core/file-storage/domain/types";
import type { TenantApi } from "@/core/tenant/api";
import type { TenantContextService } from "@/prisma/index";

import type { ReconcileStorageJobsUseCase } from "../../../application/jobs";
import { ReconcileStorageHandler } from "./index";

jest.mock("@/config/index", () => ({ env: { RECONCILE_DRY_RUN: false } }));

describe("ReconcileStorageHandler", () => {
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
        const reconcileStorageJobsUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        } as unknown as ReconcileStorageJobsUseCase;
        const handler = new ReconcileStorageHandler(tenantApi, tenantContext, reconcileStorageJobsUseCase);
        const payload = {} as never;
        const ctx = {} as never;
        return { handler, tenantApi, tenantContext, reconcileStorageJobsUseCase, payload, ctx };
    };

    it("should expose the correct queue and job name", () => {
        const { handler } = makeSut();
        expect(handler.queue).toBe(RECONCILE_STORAGE_QUEUE);
        expect(handler.name).toBe(RECONCILE_STORAGE_JOB);
    });

    it("should reconcile storage jobs for each tenant within its context", async () => {
        const { handler, tenantApi, tenantContext, reconcileStorageJobsUseCase, payload, ctx } = makeSut();
        (tenantApi.list as jest.Mock).mockResolvedValue([{ id: "tenant-1" }, { id: "tenant-2" }]);
        await expect(handler.handle(payload, ctx)).resolves.toBeUndefined();
        expect(tenantApi.list).toHaveBeenCalledTimes(1);
        expect(tenantContext.runWithContext).toHaveBeenCalledTimes(2);
        expect(tenantContext.runWithContext).toHaveBeenNthCalledWith(1, "tenant-1", null, false, expect.any(Function));
        expect(tenantContext.runWithContext).toHaveBeenNthCalledWith(2, "tenant-2", null, false, expect.any(Function));
        expect(reconcileStorageJobsUseCase.execute).toHaveBeenCalledTimes(2);
        expect(reconcileStorageJobsUseCase.execute).toHaveBeenNthCalledWith(1, { tenantId: "tenant-1", dryRun: false });
        expect(reconcileStorageJobsUseCase.execute).toHaveBeenNthCalledWith(2, { tenantId: "tenant-2", dryRun: false });
    });

    it("should not execute the use case when there are no tenants", async () => {
        const { handler, tenantApi, tenantContext, reconcileStorageJobsUseCase, payload, ctx } = makeSut();
        (tenantApi.list as jest.Mock).mockResolvedValue([]);
        await expect(handler.handle(payload, ctx)).resolves.toBeUndefined();
        expect(tenantApi.list).toHaveBeenCalledTimes(1);
        expect(tenantContext.runWithContext).not.toHaveBeenCalled();
        expect(reconcileStorageJobsUseCase.execute).not.toHaveBeenCalled();
    });

    it("should propagate errors from the tenant API", async () => {
        const { handler, tenantApi, tenantContext, reconcileStorageJobsUseCase, payload, ctx } = makeSut();
        (tenantApi.list as jest.Mock).mockRejectedValue(new Error("Failed to list tenants"));
        await expect(handler.handle(payload, ctx)).rejects.toThrow("Failed to list tenants");
        expect(tenantContext.runWithContext).not.toHaveBeenCalled();
        expect(reconcileStorageJobsUseCase.execute).not.toHaveBeenCalled();
    });

    it("should propagate errors from the reconciliation use case", async () => {
        const { handler, reconcileStorageJobsUseCase, payload, ctx } = makeSut();
        (reconcileStorageJobsUseCase.execute as jest.Mock).mockRejectedValue(
            new Error("Storage reconciliation failed"),
        );
        await expect(handler.handle(payload, ctx)).rejects.toThrow("Storage reconciliation failed");
    });

    it("should propagate errors from the tenant context", async () => {
        const { handler, tenantContext, reconcileStorageJobsUseCase, payload, ctx } = makeSut();
        (tenantContext.runWithContext as jest.Mock).mockRejectedValue(new Error("Tenant context failed"));
        await expect(handler.handle(payload, ctx)).rejects.toThrow("Tenant context failed");
        expect(reconcileStorageJobsUseCase.execute).not.toHaveBeenCalled();
    });

    it("should stop processing remaining tenants when reconciliation fails", async () => {
        const { handler, tenantApi, tenantContext, reconcileStorageJobsUseCase, payload, ctx } = makeSut();
        (tenantApi.list as jest.Mock).mockResolvedValue([{ id: "tenant-1" }, { id: "tenant-2" }]);
        (reconcileStorageJobsUseCase.execute as jest.Mock).mockRejectedValue(
            new Error("Storage reconciliation failed"),
        );
        await expect(handler.handle(payload, ctx)).rejects.toThrow("Storage reconciliation failed");
        expect(tenantContext.runWithContext).toHaveBeenCalledTimes(1);
        expect(reconcileStorageJobsUseCase.execute).toHaveBeenCalledTimes(1);
        expect(reconcileStorageJobsUseCase.execute).toHaveBeenCalledWith({ tenantId: "tenant-1", dryRun: false });
    });
});
