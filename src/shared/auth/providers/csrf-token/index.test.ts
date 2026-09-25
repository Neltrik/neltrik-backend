import { CsrfTokenProvider } from "./";

jest.mock("@/config/env", () => ({
    env: {
        CSRF_SECRET: "test-secret-key",
    },
}));

describe("CsrfTokenProvider", () => {
    let provider: CsrfTokenProvider;

    beforeEach(() => {
        provider = new CsrfTokenProvider();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should generate a valid token string", () => {
        const sessionId = "session-123";
        const token = provider.generate(sessionId);

        expect(typeof token).toBe("string");
        const parts = token.split(".");
        expect(parts).toHaveLength(2);
        expect(parts[0]?.length).toBe(64);
        expect(parts[1]).toBeDefined();
    });

    it("should generate unique tokens for the same session", () => {
        const sessionId = "session-123";
        const token1 = provider.generate(sessionId);
        const token2 = provider.generate(sessionId);

        expect(token1).not.toBe(token2);
    });

    it("should verify a valid token successfully", () => {
        const sessionId = "session-123";
        const token = provider.generate(sessionId);

        const isValid = provider.verify(token, sessionId);
        expect(isValid).toBe(true);
    });

    it("should return false if token is undefined", () => {
        const sessionId = "session-123";
        const isValid = provider.verify(undefined, sessionId);
        expect(isValid).toBe(false);
    });

    it("should return false if token does not contain a dot separator", () => {
        const sessionId = "session-123";
        const isValid = provider.verify("invalidtokenformat", sessionId);
        expect(isValid).toBe(false);
    });

    it("should return false if token has multiple dot separators (invalid structure)", () => {
        const sessionId = "session-123";
        const isValid = provider.verify("part1.part2.part3", sessionId);
        expect(isValid).toBe(false);
    });

    it("should return false if HMAC length is not 64 characters", () => {
        const sessionId = "session-123";
        const token = provider.generate(sessionId);
        const [, randomValue] = token.split(".");
        const invalidToken = `short_hmac.${randomValue}`;

        const isValid = provider.verify(invalidToken, sessionId);
        expect(isValid).toBe(false);
    });

    it("should return false if session ID does not match", () => {
        const sessionId = "session-123";
        const token = provider.generate(sessionId);

        const isValid = provider.verify(token, "wrong-session-id");
        expect(isValid).toBe(false);
    });

    it("should return false if HMAC is tampered with", () => {
        const sessionId = "session-123";
        const token = provider.generate(sessionId);
        const [, randomValue] = token.split(".");
        const tamperedHmac = "a".repeat(64);
        const tamperedToken = `${tamperedHmac}.${randomValue}`;

        const isValid = provider.verify(tamperedToken, sessionId);
        expect(isValid).toBe(false);
    });
});
