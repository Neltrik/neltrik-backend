import type { TenantContextService } from "@/prisma/index";

import type { ScanFileJobsUseCase } from "../../../application/jobs";
import { FILE_SCAN_JOB, FILE_SCAN_QUEUE, type ScanFilePayload } from "../../../domain/types";
import { ScanFileHandler } from "./index";

describe("ScanFileHandler", () => {
    const makeSut = () => {
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
        const scanFileJobsUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        } as unknown as ScanFileJobsUseCase;
        const handler = new ScanFileHandler(tenantContext, scanFileJobsUseCase);
        const payload: ScanFilePayload = { tenantId: "tenant-id", fileId: "file-id", version: 1 };
        const ctx = {} as never;
        return { handler, tenantContext, scanFileJobsUseCase, payload, ctx };
    };

    it("should expose the correct queue and job name", () => {
        const { handler } = makeSut();
        expect(handler.queue).toBe(FILE_SCAN_QUEUE);
        expect(handler.name).toBe(FILE_SCAN_JOB);
    });

    it("should execute the scan successfully within the tenant context", async () => {
        const { handler, tenantContext, scanFileJobsUseCase, payload, ctx } = makeSut();
        await expect(handler.handle(payload, ctx)).resolves.toBeUndefined();
        expect(tenantContext.runWithContext).toHaveBeenCalledTimes(1);
        expect(tenantContext.runWithContext).toHaveBeenCalledWith(payload.tenantId, null, false, expect.any(Function));
        expect(scanFileJobsUseCase.execute).toHaveBeenCalledTimes(1);
        expect(scanFileJobsUseCase.execute).toHaveBeenCalledWith({
            tenantId: payload.tenantId,
            fileId: payload.fileId,
            version: payload.version,
        });
    });

    it("should propagate errors from the scan use case", async () => {
        const { handler, scanFileJobsUseCase, payload, ctx } = makeSut();
        (scanFileJobsUseCase.execute as jest.Mock).mockRejectedValue(new Error("Antivirus scan failed"));
        await expect(handler.handle(payload, ctx)).rejects.toThrow("Antivirus scan failed");
    });

    it("should propagate errors from the tenant context", async () => {
        const { handler, tenantContext, scanFileJobsUseCase, payload, ctx } = makeSut();
        (tenantContext.runWithContext as jest.Mock).mockRejectedValue(new Error("Tenant context failed"));
        await expect(handler.handle(payload, ctx)).rejects.toThrow("Tenant context failed");
        expect(scanFileJobsUseCase.execute).not.toHaveBeenCalled();
    });
});
