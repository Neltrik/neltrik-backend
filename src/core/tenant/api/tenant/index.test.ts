import { Tenant } from "../../domain/entities";
import { TENANT_STATUS, TENANT_TYPE } from "../../domain/types";
import { GetTenantUseCaseSpy } from "../../test-doubles";
import { TenantApiImpl } from "./index";

const makeTenant = (type: "PLATFORM" | "CUSTOMER") =>
    Tenant.restore({
        id: "tenant-id",
        name: "Acme Corporation",
        slug: "acme-corporation",
        type,
        status: TENANT_STATUS.ACTIVE,
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
        suspendedAt: null,
    });

describe("TenantApiImpl", () => {
    const makeSut = () => {
        const getTenantUseCase = new GetTenantUseCaseSpy();
        const tenantApi = new TenantApiImpl(getTenantUseCase);
        return { tenantApi, getTenantUseCase };
    };

    describe("validate", () => {
        it("should validate the tenant successfully", async () => {
            const { tenantApi, getTenantUseCase } = makeSut();
            getTenantUseCase.execute.mockResolvedValue(makeTenant(TENANT_TYPE.CUSTOMER));
            await expect(tenantApi.validate("tenant-id")).resolves.toBeUndefined();
            expect(getTenantUseCase.execute).toHaveBeenCalledTimes(1);
            expect(getTenantUseCase.execute).toHaveBeenCalledWith("tenant-id");
        });

        it("should propagate tenant validation errors", async () => {
            const { tenantApi, getTenantUseCase } = makeSut();
            getTenantUseCase.execute.mockRejectedValue(new Error("Tenant not found"));
            await expect(tenantApi.validate("tenant-id")).rejects.toThrow("Tenant not found");
            expect(getTenantUseCase.execute).toHaveBeenCalledWith("tenant-id");
        });
    });

    describe("isPlatformTenant", () => {
        it("should return true when the tenant is PLATFORM", async () => {
            const { tenantApi, getTenantUseCase } = makeSut();
            getTenantUseCase.execute.mockResolvedValue(makeTenant(TENANT_TYPE.PLATFORM));
            const result = await tenantApi.isPlatformTenant("tenant-id");
            expect(result).toBe(true);
            expect(getTenantUseCase.execute).toHaveBeenCalledTimes(1);
            expect(getTenantUseCase.execute).toHaveBeenCalledWith("tenant-id");
        });

        it("should return false when the tenant is CUSTOMER", async () => {
            const { tenantApi, getTenantUseCase } = makeSut();
            getTenantUseCase.execute.mockResolvedValue(makeTenant(TENANT_TYPE.CUSTOMER));
            const result = await tenantApi.isPlatformTenant("tenant-id");
            expect(result).toBe(false);
            expect(getTenantUseCase.execute).toHaveBeenCalledTimes(1);
            expect(getTenantUseCase.execute).toHaveBeenCalledWith("tenant-id");
        });

        it("should propagate tenant retrieval errors", async () => {
            const { tenantApi, getTenantUseCase } = makeSut();
            getTenantUseCase.execute.mockRejectedValue(new Error("Tenant not found"));
            await expect(tenantApi.isPlatformTenant("tenant-id")).rejects.toThrow("Tenant not found");
            expect(getTenantUseCase.execute).toHaveBeenCalledTimes(1);
            expect(getTenantUseCase.execute).toHaveBeenCalledWith("tenant-id");
        });
    });
});
