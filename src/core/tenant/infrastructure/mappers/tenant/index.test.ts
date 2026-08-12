import { Tenant } from "../../../domain/entities";
import { TENANT_STATUS, type TenantState } from "../../../domain/types";
import { TenantMapper } from "./index";

const createProps = (): TenantState => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "tenant-id",
        name: "Neltrik",
        slug: "neltrik",
        type: "PLATFORM",
        status: TENANT_STATUS.ACTIVE,
        createdAt,
        updatedAt: createdAt,
        suspendedAt: null,
    };
};

describe("TenantMapper", () => {
    it("should map a domain tenant to persistence", () => {
        const tenant = Tenant.restore(createProps());
        const persistence = TenantMapper.toPersistence(tenant);
        expect(persistence).toEqual({
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.status,
            createdAt: tenant.createdAt,
            type: "PLATFORM",
            updatedAt: tenant.updatedAt,
            suspendedAt: tenant.suspendedAt,
        });
    });

    it("should map a persistence tenant to domain", () => {
        const persistence = createProps();
        const tenant = TenantMapper.toDomain(persistence);
        expect(tenant).toBeInstanceOf(Tenant);
        expect(tenant.id).toBe(persistence.id);
        expect(tenant.name).toBe(persistence.name);
        expect(tenant.slug).toBe(persistence.slug);
        expect(tenant.status).toBe(persistence.status);
        expect(tenant.createdAt).toEqual(persistence.createdAt);
        expect(tenant.updatedAt).toEqual(persistence.updatedAt);
        expect(tenant.suspendedAt).toBeNull();
    });

    it("should preserve suspendedAt when mapping to domain", () => {
        const suspendedAt = new Date("2025-02-01T00:00:00.000Z");
        const persistence = {
            ...createProps(),
            status: TENANT_STATUS.SUSPENDED,
            suspendedAt,
        };
        const tenant = TenantMapper.toDomain(persistence);
        expect(tenant.status).toBe(TENANT_STATUS.SUSPENDED);
        expect(tenant.suspendedAt).toEqual(suspendedAt);
    });
});
