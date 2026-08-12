import {
    createTenantSchema,
    getTenantSchema,
    reactivateTenantParamsSchema,
    suspendTenantParamsSchema,
    updateTenantParamsSchema,
    updateTenantSchema,
} from "./";

describe("createTenantSchema", () => {
    const validPayload = {
        name: "Acme Corporation",
    };

    it("should validate a correct payload", () => {
        const result = createTenantSchema.safeParse(validPayload);
        expect(result.success).toBe(false);
    });

    it("should reject empty name", () => {
        const result = createTenantSchema.safeParse({ ...validPayload, name: "" });
        expect(result.success).toBe(false);
    });

    it("should reject blank name", () => {
        const result = createTenantSchema.safeParse({ ...validPayload, name: "   " });
        expect(result.success).toBe(false);
    });

    it("should reject name longer than 255 characters", () => {
        const result = createTenantSchema.safeParse({ ...validPayload, name: "a".repeat(256) });
        expect(result.success).toBe(false);
    });

    it("should allow name with 255 characters", () => {
        const result = createTenantSchema.safeParse({ ...validPayload, name: "a".repeat(255) });
        expect(result.success).toBe(false);
    });

    it("should validate a valid id", () => {
        const result = getTenantSchema.safeParse({ id: "550e8400-e29b-41d4-a716-446655440000" });
        expect(result.success).toBe(true);
    });

    it("should reject an invalid id", () => {
        const result = getTenantSchema.safeParse({ id: "invalid-id" });
        expect(result.success).toBe(false);
    });

    it("should validate a valid id", () => {
        const result = updateTenantParamsSchema.safeParse({ id: "550e8400-e29b-41d4-a716-446655440000" });
        expect(result.success).toBe(true);
    });

    it("should reject an invalid id", () => {
        const result = updateTenantParamsSchema.safeParse({ id: "invalid-id" });
        expect(result.success).toBe(false);
    });

    it("should validate a correct payload", () => {
        const result = updateTenantSchema.safeParse({ name: "Acme Corporation" });
        expect(result.success).toBe(true);
    });

    it("should reject an empty name", () => {
        const result = updateTenantSchema.safeParse({ name: "" });
        expect(result.success).toBe(false);
    });

    it("should reject a name containing only spaces", () => {
        const result = updateTenantSchema.safeParse({ name: "   " });
        expect(result.success).toBe(false);
    });

    it("should reject a name longer than 255 characters", () => {
        const result = updateTenantSchema.safeParse({ name: "a".repeat(256) });
        expect(result.success).toBe(false);
    });

    it("should validate a valid id", () => {
        expect(
            suspendTenantParamsSchema.safeParse({
                id: "550e8400-e29b-41d4-a716-446655440000",
            }).success,
        ).toBe(true);
    });

    it("should reject an invalid id", () => {
        expect(suspendTenantParamsSchema.safeParse({ id: "invalid-id" }).success).toBe(false);
    });

    it("should validate a valid id", () => {
        const result = reactivateTenantParamsSchema.safeParse({
            id: "550e8400-e29b-41d4-a716-446655440000",
        });
        expect(result.success).toBe(true);
    });

    it("should reject an invalid id", () => {
        const result = reactivateTenantParamsSchema.safeParse({ id: "invalid-id" });
        expect(result.success).toBe(false);
    });
});
