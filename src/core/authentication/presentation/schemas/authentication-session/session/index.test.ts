import { revokeSessionParamsSchema } from "./";

describe("revokeSessionParamsSchema", () => {
    const makeInput = () => ({
        id: "550e8400-e29b-41d4-a716-446655440000",
    });

    it("should validate a valid session ID", () => {
        expect(() => revokeSessionParamsSchema.parse(makeInput())).not.toThrow();
    });

    it("should reject an invalid session ID", () => {
        expect(() => revokeSessionParamsSchema.parse({ id: "invalid-session-id" })).toThrow(
            "Invalid session ID format",
        );
    });

    it("should reject an empty session ID", () => {
        expect(() => revokeSessionParamsSchema.parse({ id: "" })).toThrow("Invalid session ID format");
    });
});
