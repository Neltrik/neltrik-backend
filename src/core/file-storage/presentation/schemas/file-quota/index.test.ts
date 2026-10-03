import { adjustQuotaLimitParamsSchema, adjustQuotaLimitSchema } from "./";

describe("adjustQuotaLimitParamsSchema", () => {
    const validPayload = {
        tenantId: "550e8400-e29b-41d4-a716-446655440000",
    };

    it("should validate a correct payload", () => {
        const result = adjustQuotaLimitParamsSchema.safeParse(validPayload);
        expect(result.success).toBe(true);
    });

    it("should reject an invalid tenantId", () => {
        const result = adjustQuotaLimitParamsSchema.safeParse({ ...validPayload, tenantId: "invalid-id" });
        expect(result.success).toBe(false);
    });

    it("should reject an empty tenantId", () => {
        const result = adjustQuotaLimitParamsSchema.safeParse({ ...validPayload, tenantId: "" });
        expect(result.success).toBe(false);
    });

    it("should reject a missing tenantId", () => {
        const result = adjustQuotaLimitParamsSchema.safeParse({});
        expect(result.success).toBe(false);
    });

    it("should reject a non-string tenantId", () => {
        const result = adjustQuotaLimitParamsSchema.safeParse({ ...validPayload, tenantId: 123 });
        expect(result.success).toBe(false);
    });
});

describe("adjustQuotaLimitSchema", () => {
    const validPayload = {
        newLimitBytes: 1024,
    };

    it("should validate a correct payload", () => {
        const result = adjustQuotaLimitSchema.safeParse(validPayload);
        expect(result.success).toBe(true);
    });

    it("should validate a positive integer", () => {
        const result = adjustQuotaLimitSchema.safeParse({ newLimitBytes: 1 });
        expect(result.success).toBe(true);
    });

    it("should reject zero", () => {
        const result = adjustQuotaLimitSchema.safeParse({ ...validPayload, newLimitBytes: 0 });
        expect(result.success).toBe(false);
    });

    it("should reject a negative number", () => {
        const result = adjustQuotaLimitSchema.safeParse({ ...validPayload, newLimitBytes: -1 });
        expect(result.success).toBe(false);
    });

    it("should reject a decimal number", () => {
        const result = adjustQuotaLimitSchema.safeParse({ ...validPayload, newLimitBytes: 1024.5 });
        expect(result.success).toBe(false);
    });

    it("should reject a missing newLimitBytes", () => {
        const result = adjustQuotaLimitSchema.safeParse({});
        expect(result.success).toBe(false);
    });

    it("should reject a non-number newLimitBytes", () => {
        const result = adjustQuotaLimitSchema.safeParse({ ...validPayload, newLimitBytes: "1024" });
        expect(result.success).toBe(false);
    });
});
