import { RESOURCE_STATUS } from "@/types/index";

import { Tenant } from "../../domain/entities";
import { TENANT_TYPE } from "../../domain/types";
import { GetTenantOhsUseCaseSpy, ListTenantsOhsUseCaseSpy } from "../../test-doubles";
import { TenantApiImpl, TenantResultDto } from "./index";

const makeTenant = (type: "PLATFORM" | "CUSTOMER" = "CUSTOMER") =>
    Tenant.restore({
        id: "tenant-id",
        name: "Acme Corporation",
        slug: "acme-corporation",
        type,
        status: RESOURCE_STATUS.ACTIVE,
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
        suspendedAt: null,
    });

describe("TenantApiImpl", () => {
    const makeSut = () => {
        const getTenantOhsUseCase = new GetTenantOhsUseCaseSpy();
        const listTenantsOhsUseCase = new ListTenantsOhsUseCaseSpy();
        const tenantApi = new TenantApiImpl(getTenantOhsUseCase, listTenantsOhsUseCase);

        return { tenantApi, getTenantOhsUseCase, listTenantsOhsUseCase };
    };

    describe("validate", () => {
        it("should validate the tenant successfully", async () => {
            const { tenantApi, getTenantOhsUseCase } = makeSut();
            getTenantOhsUseCase.execute.mockResolvedValue(makeTenant());

            await expect(tenantApi.validate("tenant-id")).resolves.toBeUndefined();

            expect(getTenantOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(getTenantOhsUseCase.execute).toHaveBeenCalledWith("tenant-id");
        });

        it("should propagate tenant validation errors", async () => {
            const { tenantApi, getTenantOhsUseCase } = makeSut();
            getTenantOhsUseCase.execute.mockRejectedValue(new Error("Tenant not found"));

            await expect(tenantApi.validate("tenant-id")).rejects.toThrow("Tenant not found");
        });
    });

    describe("getById", () => {
        it("should return the tenant by id", async () => {
            const { tenantApi, getTenantOhsUseCase } = makeSut();
            const tenant = makeTenant();

            getTenantOhsUseCase.execute.mockResolvedValue(tenant);

            await expect(tenantApi.getById("tenant-id")).resolves.toBe(tenant);

            expect(getTenantOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(getTenantOhsUseCase.execute).toHaveBeenCalledWith("tenant-id");
        });

        it("should propagate tenant retrieval errors", async () => {
            const { tenantApi, getTenantOhsUseCase } = makeSut();
            getTenantOhsUseCase.execute.mockRejectedValue(new Error("Tenant not found"));

            await expect(tenantApi.getById("tenant-id")).rejects.toThrow("Tenant not found");
        });
    });

    describe("isPlatformTenant", () => {
        it("should return true when the tenant is PLATFORM", async () => {
            const { tenantApi, getTenantOhsUseCase } = makeSut();
            getTenantOhsUseCase.execute.mockResolvedValue(makeTenant(TENANT_TYPE.PLATFORM));

            await expect(tenantApi.isPlatformTenant("tenant-id")).resolves.toBe(true);

            expect(getTenantOhsUseCase.execute).toHaveBeenCalledWith("tenant-id");
        });

        it("should return false when the tenant is CUSTOMER", async () => {
            const { tenantApi, getTenantOhsUseCase } = makeSut();
            getTenantOhsUseCase.execute.mockResolvedValue(makeTenant(TENANT_TYPE.CUSTOMER));

            await expect(tenantApi.isPlatformTenant("tenant-id")).resolves.toBe(false);

            expect(getTenantOhsUseCase.execute).toHaveBeenCalledWith("tenant-id");
        });

        it("should propagate tenant retrieval errors", async () => {
            const { tenantApi, getTenantOhsUseCase } = makeSut();
            getTenantOhsUseCase.execute.mockRejectedValue(new Error("Tenant not found"));

            await expect(tenantApi.isPlatformTenant("tenant-id")).rejects.toThrow("Tenant not found");
        });
    });

    describe("list", () => {
        it("should return tenants mapped to the expected result shape", async () => {
            const { tenantApi, listTenantsOhsUseCase } = makeSut();
            const platformTenant = makeTenant(TENANT_TYPE.PLATFORM);
            const customerTenant = Tenant.restore({
                id: "customer-tenant-id",
                name: "Customer Corporation",
                slug: "customer-corporation",
                type: TENANT_TYPE.CUSTOMER,
                status: RESOURCE_STATUS.ACTIVE,
                createdAt: new Date("2025-02-01T00:00:00.000Z"),
                updatedAt: new Date("2025-02-02T00:00:00.000Z"),
                suspendedAt: null,
            });

            listTenantsOhsUseCase.execute.mockResolvedValue([platformTenant, customerTenant]);

            await expect(tenantApi.list()).resolves.toEqual([
                {
                    id: "tenant-id",
                    name: "Acme Corporation",
                    slug: "acme-corporation",
                    type: TENANT_TYPE.PLATFORM,
                    status: RESOURCE_STATUS.ACTIVE,
                    createdAt: new Date("2025-01-01T00:00:00.000Z"),
                    updatedAt: new Date("2025-01-01T00:00:00.000Z"),
                    suspendedAt: null,
                },
                {
                    id: "customer-tenant-id",
                    name: "Customer Corporation",
                    slug: "customer-corporation",
                    type: TENANT_TYPE.CUSTOMER,
                    status: RESOURCE_STATUS.ACTIVE,
                    createdAt: new Date("2025-02-01T00:00:00.000Z"),
                    updatedAt: new Date("2025-02-02T00:00:00.000Z"),
                    suspendedAt: null,
                },
            ]);

            expect(listTenantsOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(listTenantsOhsUseCase.execute).toHaveBeenCalledWith();
        });

        it("should return an empty array when there are no tenants", async () => {
            const { tenantApi, listTenantsOhsUseCase } = makeSut();
            listTenantsOhsUseCase.execute.mockResolvedValue([]);

            await expect(tenantApi.list()).resolves.toEqual([]);

            expect(listTenantsOhsUseCase.execute).toHaveBeenCalledTimes(1);
        });

        it("should propagate tenant listing errors", async () => {
            const { tenantApi, listTenantsOhsUseCase } = makeSut();
            listTenantsOhsUseCase.execute.mockRejectedValue(new Error("Failed to list tenants"));

            await expect(tenantApi.list()).rejects.toThrow("Failed to list tenants");
        });
    });

    describe("TenantResultDto", () => {
        it("should represent a tenant result", () => {
            const dto = new TenantResultDto();
            dto.id = "tenant-id";
            dto.name = "Acme Corporation";
            dto.slug = "acme-corporation";
            dto.type = TENANT_TYPE.CUSTOMER;
            dto.status = RESOURCE_STATUS.ACTIVE;
            dto.createdAt = new Date("2025-01-01T00:00:00.000Z");
            dto.updatedAt = new Date("2025-01-01T00:00:00.000Z");
            dto.suspendedAt = null;

            expect(dto).toEqual({
                id: "tenant-id",
                name: "Acme Corporation",
                slug: "acme-corporation",
                type: TENANT_TYPE.CUSTOMER,
                status: RESOURCE_STATUS.ACTIVE,
                createdAt: new Date("2025-01-01T00:00:00.000Z"),
                updatedAt: new Date("2025-01-01T00:00:00.000Z"),
                suspendedAt: null,
            });
        });
    });
});
