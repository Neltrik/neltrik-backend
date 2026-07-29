import {
    InvalidTenantNameError,
    InvalidTenantSlugError,
    TenantAlreadyActiveError,
    TenantAlreadySuspendedError,
} from "../../errors";
import { TENANT_STATUS, type TenantState } from "../../types";
import { Tenant } from "./index";

const createProps = (): Omit<TenantState, "status"> => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "tenant-id",
        name: "Neltrik",
        slug: "neltrik",
        createdAt,
        updatedAt: createdAt,
        suspendedAt: null,
    };
};

const restoreProps = (): TenantState => ({
    ...createProps(),
    status: TENANT_STATUS.SUSPENDED,
});

describe("Tenant", () => {
    it("should restore a tenant preserving its persisted status", () => {
        const tenant = Tenant.restore(restoreProps());
        expect(tenant.status).toBe(TENANT_STATUS.SUSPENDED);
    });

    it("should create a tenant with active status", () => {
        const tenant = Tenant.create(createProps());
        expect(tenant.status).toBe(TENANT_STATUS.ACTIVE);
    });

    it("should throw InvalidTenantNameError when name is empty", () => {
        const props = createProps();
        props.name = "";
        expect(() => Tenant.create(props)).toThrow(InvalidTenantNameError);
    });

    it("should throw InvalidTenantNameError when name contains only spaces", () => {
        const props = createProps();
        props.name = "   ";
        expect(() => Tenant.create(props)).toThrow(InvalidTenantNameError);
    });

    it("should throw InvalidTenantSlugError when slug is empty", () => {
        const props = createProps();
        props.slug = "";
        expect(() => Tenant.create(props)).toThrow(InvalidTenantSlugError);
    });

    it("should throw InvalidTenantSlugError when slug contains only spaces", () => {
        const props = createProps();
        props.slug = "   ";
        expect(() => Tenant.create(props)).toThrow(InvalidTenantSlugError);
    });

    it("should expose all properties through getters", () => {
        const props = createProps();
        const tenant = Tenant.create(props);
        expect(tenant.id).toBe(props.id);
        expect(tenant.name).toBe(props.name);
        expect(tenant.slug).toBe(props.slug);
        expect(tenant.createdAt).toEqual(props.createdAt);
        expect(tenant.updatedAt).toEqual(props.updatedAt);
        expect(tenant.suspendedAt).toBeNull();
        expect(tenant.status).toBe(TENANT_STATUS.ACTIVE);
    });

    it("should update tenant name successfully", () => {
        const tenant = Tenant.create(createProps());
        tenant.update("Neltrik Updated");
        expect(tenant.name).toBe("Neltrik Updated");
    });

    it("should update updatedAt when tenant is updated", () => {
        const tenant = Tenant.create(createProps());
        const previousUpdatedAt = tenant.updatedAt;
        tenant.update("Neltrik Updated");
        expect(tenant.updatedAt.getTime()).toBeGreaterThan(previousUpdatedAt.getTime());
    });

    it("should throw InvalidTenantNameError when updating with empty name", () => {
        const tenant = Tenant.create(createProps());
        expect(() => tenant.update("")).toThrow(InvalidTenantNameError);
    });

    it("should suspend an active tenant", () => {
        const tenant = Tenant.create(createProps());
        tenant.suspend();
        expect(tenant.status).toBe(TENANT_STATUS.SUSPENDED);
        expect(tenant.suspendedAt).not.toBeNull();
        expect(tenant.updatedAt.getTime()).toBeGreaterThan(tenant.createdAt.getTime());
    });

    it("should throw TenantAlreadySuspendedError when tenant is already suspended", () => {
        const tenant = Tenant.restore(restoreProps());
        expect(() => tenant.suspend()).toThrow(TenantAlreadySuspendedError);
    });

    it("should reactivate a suspended tenant", () => {
        const tenant = Tenant.restore(restoreProps());
        tenant.reactivate();
        expect(tenant.status).toBe(TENANT_STATUS.ACTIVE);
        expect(tenant.suspendedAt).toBeNull();
        expect(tenant.updatedAt.getTime()).toBeGreaterThan(tenant.createdAt.getTime());
    });

    it("should throw TenantAlreadyActiveError when tenant is already active", () => {
        const tenant = Tenant.create(createProps());
        expect(() => tenant.reactivate()).toThrow(TenantAlreadyActiveError);
    });
});
