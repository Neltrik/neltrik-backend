import { updateUserSchema } from "./";

describe("schemas", () => {
    it("should reject when no fields are provided", () => {
        const result = updateUserSchema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues).toHaveLength(1);
            expect(result.error.issues[0]?.message).toBe("At least one field must be provided.");
        }
    });
});
