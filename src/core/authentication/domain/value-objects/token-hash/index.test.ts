import { createHash } from "crypto";

import { InvalidTokenHashError } from "../../errors";
import { TokenHash } from "./index";

describe("TokenHash", () => {
    it("should create a valid token hash", () => {
        const tokenHashValue = "a".repeat(64);
        const tokenHash = TokenHash.create(tokenHashValue);
        expect(tokenHash.value).toBe(tokenHashValue);
    });

    it("should throw InvalidTokenHashError when token hash is empty", () => {
        expect(() => TokenHash.create("")).toThrow(InvalidTokenHashError);
    });

    it("should throw InvalidTokenHashError when token hash is invalid", () => {
        expect(() => TokenHash.create("invalid-token-hash")).toThrow(InvalidTokenHashError);
    });

    it("should throw InvalidTokenHashError when token hash is shorter than 64 characters", () => {
        const tokenHashValue = "a".repeat(63);
        expect(() => TokenHash.create(tokenHashValue)).toThrow(InvalidTokenHashError);
    });

    it("should throw InvalidTokenHashError when token hash is longer than 64 characters", () => {
        const tokenHashValue = "a".repeat(65);
        expect(() => TokenHash.create(tokenHashValue)).toThrow(InvalidTokenHashError);
    });

    it("should throw InvalidTokenHashError when token hash contains uppercase characters", () => {
        const tokenHashValue = "A".repeat(64);
        expect(() => TokenHash.create(tokenHashValue)).toThrow(InvalidTokenHashError);
    });

    it("should throw InvalidTokenHashError when token hash contains non-hexadecimal characters", () => {
        const tokenHashValue = `${"a".repeat(63)}g`;
        expect(() => TokenHash.create(tokenHashValue)).toThrow(InvalidTokenHashError);
    });

    it("should preserve the token hash value", () => {
        const tokenHashValue = "abcdef0123456789".repeat(4);
        const tokenHash = TokenHash.create(tokenHashValue);
        expect(tokenHash.value).toBe(tokenHashValue);
    });

    it("should generate a token and its corresponding hash", () => {
        const { token, hash } = TokenHash.generate();
        const expectedHash = createHash("sha256").update(token).digest("hex");
        expect(token).toHaveLength(64);
        expect(hash.value).toBe(expectedHash);
    });

    it("should generate different tokens", () => {
        const first = TokenHash.generate();
        const second = TokenHash.generate();
        expect(first.token).not.toBe(second.token);
        expect(first.hash.value).not.toBe(second.hash.value);
    });

    it("should return true when comparing equal token hashes", () => {
        const tokenHashValue = "a".repeat(64);
        const tokenHash1 = TokenHash.create(tokenHashValue);
        const tokenHash2 = TokenHash.create(tokenHashValue);
        expect(tokenHash1.equals(tokenHash2)).toBe(true);
    });

    it("should return false when comparing different token hashes", () => {
        const tokenHash1 = TokenHash.create("a".repeat(64));
        const tokenHash2 = TokenHash.create("b".repeat(64));
        expect(tokenHash1.equals(tokenHash2)).toBe(false);
    });

    it("should return true when verifying the correct token", () => {
        const token = "verification-token";
        const hash = createHash("sha256").update(token).digest("hex");
        const tokenHash = TokenHash.create(hash);
        expect(tokenHash.verify(token)).toBe(true);
    });

    it("should return false when verifying an incorrect token", () => {
        const token = "verification-token";
        const hash = createHash("sha256").update(token).digest("hex");
        const tokenHash = TokenHash.create(hash);
        expect(tokenHash.verify("different-token")).toBe(false);
    });

    it("should verify a generated token against its hash", () => {
        const { token, hash } = TokenHash.generate();
        expect(hash.verify(token)).toBe(true);
    });

    it("should return false when verifying an empty token", () => {
        const token = "verification-token";
        const hash = createHash("sha256").update(token).digest("hex");
        const tokenHash = TokenHash.create(hash);
        expect(tokenHash.verify("")).toBe(false);
    });
});
