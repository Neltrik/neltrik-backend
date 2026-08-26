import { getAccountQuerySchema, registerAccountSchema } from "./";

describe("registerAccountSchema", () => {
    const makeInput = () => ({
        invitationToken: "invitation-token",
        provider: "google",
        email: "user@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
    });

    it("should validate a valid request", () => {
        expect(() => registerAccountSchema.parse(makeInput())).not.toThrow();
    });

    it("should validate a request without password", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...input } = makeInput();
        expect(() => registerAccountSchema.parse(input)).not.toThrow();
    });

    it("should reject an empty invitation token", () => {
        expect(() => registerAccountSchema.parse({ ...makeInput(), invitationToken: "" })).toThrow(
            "Invitation token is required",
        );
    });

    it("should reject an empty provider", () => {
        expect(() => registerAccountSchema.parse({ ...makeInput(), provider: "" })).toThrow("Provider is required");
    });

    it("should reject an invalid email", () => {
        expect(() => registerAccountSchema.parse({ ...makeInput(), email: "invalid-email" })).toThrow(
            "Invalid email format",
        );
    });

    it("should reject an empty email", () => {
        expect(() => registerAccountSchema.parse({ ...makeInput(), email: "" })).toThrow();
    });

    it("should reject a password shorter than 8 characters", () => {
        expect(() => registerAccountSchema.parse({ ...makeInput(), password: "1234567" })).toThrow(
            "Password must be at least 8 characters",
        );
    });

    it("should validate a password with exactly 8 characters", () => {
        expect(() => registerAccountSchema.parse({ ...makeInput(), password: "12345678" })).not.toThrow();
    });

    it("should reject an empty first name", () => {
        expect(() => registerAccountSchema.parse({ ...makeInput(), firstName: "" })).toThrow("First name is required");
    });

    it("should reject an empty last name", () => {
        expect(() => registerAccountSchema.parse({ ...makeInput(), lastName: "" })).toThrow("Last name is required");
    });
});

describe("getAccountQuerySchema", () => {
    it("should validate a valid userId query", () => {
        expect(() => getAccountQuerySchema.parse({ userId: "550e8400-e29b-41d4-a716-446655440000" })).not.toThrow();
    });

    it("should validate a valid email query", () => {
        expect(() => getAccountQuerySchema.parse({ email: "user@example.com" })).not.toThrow();
    });

    it("should reject when no query parameter is provided", () => {
        const result = getAccountQuerySchema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues).toHaveLength(1);
            expect(result.error.issues[0]?.message).toBe("Exactly one of userId, email must be provided");
        }
    });

    it("should reject when both userId and email are provided", () => {
        const result = getAccountQuerySchema.safeParse({
            userId: "550e8400-e29b-41d4-a716-446655440000",
            email: "user@example.com",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues).toHaveLength(1);
            expect(result.error.issues[0]?.message).toBe("Only one of userId, email can be provided, not both");
        }
    });

    it("should reject an invalid userId", () => {
        expect(() => getAccountQuerySchema.parse({ userId: "invalid-user-id" })).toThrow("Invalid userId format");
    });

    it("should reject an invalid email", () => {
        expect(() => getAccountQuerySchema.parse({ email: "invalid-email" })).toThrow("Invalid email format");
    });

    it("should reject an empty userId even when email is provided", () => {
        const result = getAccountQuerySchema.safeParse({ userId: "", email: "user@example.com" });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues).toHaveLength(1);
            expect(result.error.issues[0]?.message).toBe("Invalid userId format");
        }
    });

    it("should reject when both query parameters are empty", () => {
        const result = getAccountQuerySchema.safeParse({ userId: "", email: "" });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues).toHaveLength(3);
            expect(result.error.issues[0]?.message).toBe("Invalid userId format");
            expect(result.error.issues[1]?.message).toBe("Invalid email format");
            expect(result.error.issues[2]?.message).toBe("Exactly one of userId, email must be provided");
        }
    });
});
