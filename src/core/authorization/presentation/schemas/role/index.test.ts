import { createRoleSchema, updateRoleSchema } from "./";

describe("createRoleSchema", () => {
    const makeInput = () => ({
        code: "TENANT_ADMIN",
        defaultDisplayName: "Tenant Administrator",
        description: "Tenant administrator role.",
    });

    it("should validate a valid request", () => {
        expect(() => createRoleSchema.parse(makeInput())).not.toThrow();
    });

    it("should reject empty code", () => {
        expect(() => createRoleSchema.parse({ ...makeInput(), code: "" })).toThrow();
    });

    it("should reject empty defaultDisplayName", () => {
        expect(() => createRoleSchema.parse({ ...makeInput(), defaultDisplayName: "" })).toThrow();
    });

    it("should reject empty description", () => {
        expect(() => createRoleSchema.parse({ ...makeInput(), description: "" })).toThrow();
    });

    it("should reject when no fields are provided", () => {
        const result = updateRoleSchema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues).toHaveLength(1);
            expect(result.error.issues[0]?.message).toBe("At least one field must be provided.");
        }
    });
});
