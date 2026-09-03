import { validateEmailVerificationQuerySchema } from "./";

describe("validateEmailVerificationQuerySchema", () => {
    const makeInput = () => ({ token: "valid-verification-token" });

    it("should validate a valid verification token", () => {
        expect(() => validateEmailVerificationQuerySchema.parse(makeInput())).not.toThrow();
    });

    it("should reject an empty verification token", () => {
        expect(() => validateEmailVerificationQuerySchema.parse({ token: "" })).toThrow("Token is required");
    });

    it("should reject a missing verification token", () => {
        expect(() => validateEmailVerificationQuerySchema.parse({})).toThrow();
    });
});
