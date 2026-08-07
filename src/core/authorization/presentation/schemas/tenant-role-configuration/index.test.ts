import {
    createTenantRoleConfigurationSchema,
    tenantRoleConfigurationParamsSchema,
    updateTenantRoleConfigurationSchema,
} from "./index";

describe("TenantRoleConfigurationSchema", () => {
    describe("createTenantRoleConfigurationSchema", () => {
        it("should validate a valid payload", () => {
            const result = createTenantRoleConfigurationSchema.safeParse({
                tenantId: "550e8400-e29b-41d4-a716-446655440001",
                roleId: "550e8400-e29b-41d4-a716-446655440002",
                displayName: "Administrator",
            });
            expect(result.success).toBe(true);
        });

        it("should fail when tenantId is invalid", () => {
            const result = createTenantRoleConfigurationSchema.safeParse({
                tenantId: "invalid-id",
                roleId: "550e8400-e29b-41d4-a716-446655440002",
                displayName: "Administrator",
            });
            expect(result.success).toBe(false);
        });

        it("should fail when roleId is invalid", () => {
            const result = createTenantRoleConfigurationSchema.safeParse({
                tenantId: "550e8400-e29b-41d4-a716-446655440001",
                roleId: "invalid-id",
                displayName: "Administrator",
            });
            expect(result.success).toBe(false);
        });

        it("should fail when displayName is empty", () => {
            const result = createTenantRoleConfigurationSchema.safeParse({
                tenantId: "550e8400-e29b-41d4-a716-446655440001",
                roleId: "550e8400-e29b-41d4-a716-446655440002",
                displayName: "",
            });
            expect(result.success).toBe(false);
        });

        it("should fail when displayName exceeds 100 characters", () => {
            const result = createTenantRoleConfigurationSchema.safeParse({
                tenantId: "550e8400-e29b-41d4-a716-446655440001",
                roleId: "550e8400-e29b-41d4-a716-446655440002",
                displayName: "a".repeat(101),
            });
            expect(result.success).toBe(false);
        });
    });

    describe("updateTenantRoleConfigurationSchema", () => {
        it("should validate a valid payload", () => {
            const result = updateTenantRoleConfigurationSchema.safeParse({
                displayName: "Platform Administrator",
            });
            expect(result.success).toBe(true);
        });

        it("should fail when displayName is empty", () => {
            const result = updateTenantRoleConfigurationSchema.safeParse({
                displayName: "",
            });
            expect(result.success).toBe(false);
        });

        it("should fail when displayName exceeds 100 characters", () => {
            const result = updateTenantRoleConfigurationSchema.safeParse({
                displayName: "a".repeat(101),
            });
            expect(result.success).toBe(false);
        });
    });

    describe("tenantRoleConfigurationParamsSchema", () => {
        it("should validate a valid id", () => {
            const result = tenantRoleConfigurationParamsSchema.safeParse({
                id: "550e8400-e29b-41d4-a716-446655440000",
            });
            expect(result.success).toBe(true);
        });

        it("should fail when id is invalid", () => {
            const result = tenantRoleConfigurationParamsSchema.safeParse({ id: "invalid-id" });
            expect(result.success).toBe(false);
        });
    });
});
