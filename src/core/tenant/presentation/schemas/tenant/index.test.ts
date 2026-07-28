import { createTenantSchema } from "./";

describe("createTenantSchema", () => {
    const validPayload = {
        name: "Acme Corporation",
    };

    it("should validate a correct payload", () => {
        const result = createTenantSchema.safeParse(validPayload);
        expect(result.success).toBe(true);
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
        expect(result.success).toBe(true);
    });
});
