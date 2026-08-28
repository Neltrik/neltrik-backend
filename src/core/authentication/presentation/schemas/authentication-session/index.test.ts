import { loginSchema, logoutSchema, revokeSessionBodySchema, revokeSessionParamsSchema } from "./";

describe("loginSchema", () => {
    const makeInput = () => ({
        email: "user@example.com",
        password: "password123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
    });

    it("should validate a valid request", () => {
        expect(() => loginSchema.parse(makeInput())).not.toThrow();
    });

    it("should validate a request without ipAddress", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { ipAddress, ...input } = makeInput();
        expect(() => loginSchema.parse(input)).not.toThrow();
    });

    it("should validate a request without userAgent", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { userAgent, ...input } = makeInput();
        expect(() => loginSchema.parse(input)).not.toThrow();
    });

    it("should validate a request without optional fields", () => {
        const { email, password } = makeInput();
        expect(() => loginSchema.parse({ email, password })).not.toThrow();
    });

    it("should reject an invalid email", () => {
        expect(() => loginSchema.parse({ ...makeInput(), email: "invalid-email" })).toThrow("Invalid email format");
    });

    it("should reject an empty email", () => {
        expect(() => loginSchema.parse({ ...makeInput(), email: "" })).toThrow();
    });

    it("should reject an empty password", () => {
        expect(() => loginSchema.parse({ ...makeInput(), password: "" })).toThrow("Password is required");
    });

    it("should reject an invalid IP address", () => {
        expect(() => loginSchema.parse({ ...makeInput(), ipAddress: "invalid-ip" })).toThrow(
            "Invalid IP address format",
        );
    });

    it("should reject an IPv6 address", () => {
        expect(() => loginSchema.parse({ ...makeInput(), ipAddress: "2001:db8::1" })).toThrow(
            "Invalid IP address format",
        );
    });

    it("should reject an empty user agent", () => {
        expect(() => loginSchema.parse({ ...makeInput(), userAgent: "" })).toThrow("User agent is required");
    });
});

describe("logoutSchema", () => {
    const makeInput = () => ({
        refreshToken: "550e8400-e29b-41d4-a716-446655440000",
    });

    it("should validate a valid request", () => {
        expect(() => logoutSchema.parse(makeInput())).not.toThrow();
    });

    it("should reject an invalid refresh token", () => {
        expect(() => logoutSchema.parse({ refreshToken: "invalid-refresh-token" })).toThrow(
            "Invalid refresh token format",
        );
    });

    it("should reject an empty refresh token", () => {
        expect(() => logoutSchema.parse({ refreshToken: "" })).toThrow("Invalid refresh token format");
    });
});

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

describe("revokeSessionBodySchema", () => {
    const makeInput = () => ({
        userId: "550e8400-e29b-41d4-a716-446655440000",
    });

    it("should validate a valid user ID", () => {
        expect(() => revokeSessionBodySchema.parse(makeInput())).not.toThrow();
    });

    it("should reject an invalid user ID", () => {
        expect(() => revokeSessionBodySchema.parse({ userId: "invalid-user-id" })).toThrow("Invalid user ID format");
    });

    it("should reject an empty user ID", () => {
        expect(() => revokeSessionBodySchema.parse({ userId: "" })).toThrow("Invalid user ID format");
    });
});
