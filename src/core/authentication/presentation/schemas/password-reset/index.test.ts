import { requestPasswordResetSchema, resetPasswordSchema } from "./";

describe("requestPasswordResetSchema", () => {
    const makeInput = () => ({ email: "test@example.com" });

    it("should validate a valid email", () => {
        expect(() => requestPasswordResetSchema.parse(makeInput())).not.toThrow();
    });

    it("should reject an invalid email format", () => {
        expect(() => requestPasswordResetSchema.parse({ email: "invalid-email" })).toThrow("Invalid email format");
    });

    it("should reject a missing email", () => {
        expect(() => requestPasswordResetSchema.parse({})).toThrow();
    });
});

describe("resetPasswordSchema", () => {
    const makeInput = () => ({ token: "valid-reset-token", newPassword: "valid-password" });

    it("should validate a valid reset password input", () => {
        expect(() => resetPasswordSchema.parse(makeInput())).not.toThrow();
    });

    it("should reject an empty reset token", () => {
        expect(() => resetPasswordSchema.parse({ ...makeInput(), token: "" })).toThrow("Token is required");
    });

    it("should reject a missing reset token", () => {
        expect(() => resetPasswordSchema.parse({ newPassword: "valid-password" })).toThrow();
    });

    it("should reject a password shorter than 8 characters", () => {
        expect(() => resetPasswordSchema.parse({ ...makeInput(), newPassword: "1234567" })).toThrow(
            "Password must be at least 8 characters",
        );
    });

    it("should reject a missing new password", () => {
        expect(() => resetPasswordSchema.parse({ token: "valid-reset-token" })).toThrow();
    });
});
