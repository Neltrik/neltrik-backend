import { registerUserSchema, updateUserSchema } from "./";

describe("registerUserSchema", () => {
    const makeInput = () => ({
        firstName: "John",
        lastName: "Doe",
        email: "john@company.com",
        roleId: "550e8400-e29b-41d4-a716-446655440002",
    });

    it("should validate a valid request", () => {
        expect(() => registerUserSchema.parse(makeInput())).not.toThrow();
    });

    it("should reject empty firstName", () => {
        expect(() => registerUserSchema.parse({ ...makeInput(), firstName: "" })).toThrow();
    });

    it("should reject empty lastName", () => {
        expect(() => registerUserSchema.parse({ ...makeInput(), lastName: "" })).toThrow();
    });

    it("should reject an invalid email", () => {
        expect(() => registerUserSchema.parse({ ...makeInput(), email: "invalid-email" })).toThrow();
    });

    it("should reject an invalid roleId", () => {
        expect(() => registerUserSchema.parse({ ...makeInput(), roleId: "invalid-id" })).toThrow();
    });

    it("should reject when no fields are provided", () => {
        const result = updateUserSchema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues).toHaveLength(1);
            expect(result.error.issues[0]?.message).toBe("At least one field must be provided.");
        }
    });
});
