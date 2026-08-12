import { associateRolesToTenantSchema, disassociateRolesFromTenantSchema, roleTenantParamsSchema } from "./";

describe("associateRolesToTenantSchema", () => {
    const makeInput = () => ({
        roleIds: ["550e8400-e29b-41d4-a716-446655440000", "6ba7b810-9dad-41d1-80b4-00c04fd430c8"],
    });

    it("should validate a valid request", () => {
        expect(() => associateRolesToTenantSchema.parse(makeInput())).not.toThrow();
    });

    it("should validate a single role", () => {
        expect(() =>
            associateRolesToTenantSchema.parse({ roleIds: ["550e8400-e29b-41d4-a716-446655440000"] }),
        ).not.toThrow();
    });

    it("should reject an empty roleIds array", () => {
        expect(() => associateRolesToTenantSchema.parse({ roleIds: [] })).toThrow();
    });

    it("should reject an invalid role id", () => {
        expect(() => associateRolesToTenantSchema.parse({ roleIds: ["invalid-id"] })).toThrow();
    });

    it("should reject more than 100 roles", () => {
        const roleIds = Array.from({ length: 101 }, () => "550e8400-e29b-41d4-a716-446655440000");
        const result = associateRolesToTenantSchema.safeParse({ roleIds });
        expect(result.success).toBe(false);
    });
});

describe("disassociateRolesFromTenantSchema", () => {
    const makeInput = () => ({
        roleIds: ["550e8400-e29b-41d4-a716-446655440000", "6ba7b810-9dad-41d1-80b4-00c04fd430c8"],
    });

    it("should validate a valid request", () => {
        expect(() => disassociateRolesFromTenantSchema.parse(makeInput())).not.toThrow();
    });

    it("should validate a single role", () => {
        expect(() =>
            disassociateRolesFromTenantSchema.parse({ roleIds: ["550e8400-e29b-41d4-a716-446655440000"] }),
        ).not.toThrow();
    });

    it("should reject an empty roleIds array", () => {
        expect(() => disassociateRolesFromTenantSchema.parse({ roleIds: [] })).toThrow();
    });

    it("should reject an invalid role id", () => {
        expect(() => disassociateRolesFromTenantSchema.parse({ roleIds: ["invalid-id"] })).toThrow();
    });

    it("should reject more than 100 roles", () => {
        const roleIds = Array.from({ length: 101 }, () => "550e8400-e29b-41d4-a716-446655440000");
        const result = disassociateRolesFromTenantSchema.safeParse({ roleIds });
        expect(result.success).toBe(false);
    });
});

describe("roleTenantParamsSchema", () => {
    it("should validate a valid tenant id", () => {
        expect(() => roleTenantParamsSchema.parse({ tenantId: "550e8400-e29b-41d4-a716-446655440000" })).not.toThrow();
    });

    it("should reject an invalid tenant id", () => {
        expect(() => roleTenantParamsSchema.parse({ tenantId: "invalid-id" })).toThrow();
    });
});
