import { createHash } from "crypto";

import {
    EmptyAccountIdError,
    InvalidTokenError,
    PasswordResetAlreadyUsedError,
    PasswordResetExpiredError,
} from "../../errors";
import type { PasswordResetProps } from "../../types";
import { ExpirationDate, TokenHash } from "../../value-objects";
import { PasswordReset } from "./index";

const createTokenHash = (token: string): TokenHash =>
    TokenHash.create(createHash("sha256").update(token).digest("hex"));

const createProps = (): Omit<PasswordResetProps, "usedAt"> => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "password-reset-id",
        authenticationAccountId: "authentication-account-id",
        tokenHash: TokenHash.create("a".repeat(64)),
        expiresAt: ExpirationDate.create(new Date("2030-01-01T00:00:00.000Z")),
        createdAt,
        updatedAt: createdAt,
    };
};

const restoreProps = (): PasswordResetProps => ({ ...createProps(), usedAt: null });

describe("PasswordReset", () => {
    it("should create a password reset with usedAt as null", () => {
        const passwordReset = PasswordReset.create(createProps());
        expect(passwordReset.usedAt).toBeNull();
    });

    it("should restore a password reset preserving its persisted properties", () => {
        const usedAt = new Date("2025-01-02T00:00:00.000Z");
        const passwordReset = PasswordReset.restore({ ...restoreProps(), usedAt });
        expect(passwordReset.usedAt).toBe(usedAt);
    });

    it("should throw EmptyAccountIdError when authentication account ID is empty", () => {
        const props = createProps();
        props.authenticationAccountId = "";
        expect(() => PasswordReset.create(props)).toThrow(EmptyAccountIdError);
    });

    it("should throw EmptyAccountIdError when authentication account ID contains only spaces", () => {
        const props = createProps();
        props.authenticationAccountId = "   ";
        expect(() => PasswordReset.create(props)).toThrow(EmptyAccountIdError);
    });

    it("should expose all properties through getters", () => {
        const props = createProps();
        const passwordReset = PasswordReset.create(props);
        expect(passwordReset.id).toBe(props.id);
        expect(passwordReset.authenticationAccountId).toBe(props.authenticationAccountId);
        expect(passwordReset.tokenHash).toBe(props.tokenHash);
        expect(passwordReset.expiresAt).toBe(props.expiresAt);
        expect(passwordReset.usedAt).toBeNull();
        expect(passwordReset.createdAt).toBe(props.createdAt);
        expect(passwordReset.updatedAt).toBe(props.updatedAt);
    });

    it("should return false when the password reset is not expired", () => {
        const passwordReset = PasswordReset.create(createProps());
        expect(passwordReset.isExpired()).toBe(false);
    });

    it("should return true when the password reset is expired", () => {
        jest.useFakeTimers();
        try {
            jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
            const passwordReset = PasswordReset.create({
                ...createProps(),
                expiresAt: ExpirationDate.create(new Date("2025-01-02T00:00:00.000Z")),
            });
            jest.setSystemTime(new Date("2025-01-03T00:00:00.000Z"));
            expect(passwordReset.isExpired()).toBe(true);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should return true when the password reset is pending", () => {
        const passwordReset = PasswordReset.create(createProps());
        expect(passwordReset.isPending()).toBe(true);
    });

    it("should return false when the password reset is used", () => {
        const passwordReset = PasswordReset.restore({
            ...restoreProps(),
            usedAt: new Date("2025-01-02T00:00:00.000Z"),
        });
        expect(passwordReset.isPending()).toBe(false);
    });

    it("should return false when the password reset is expired", () => {
        jest.useFakeTimers();
        try {
            jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
            const passwordReset = PasswordReset.create({
                ...createProps(),
                expiresAt: ExpirationDate.create(new Date("2025-01-02T00:00:00.000Z")),
            });
            jest.setSystemTime(new Date("2025-01-03T00:00:00.000Z"));
            expect(passwordReset.isPending()).toBe(false);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should return false when the password reset is not used", () => {
        const passwordReset = PasswordReset.create(createProps());
        expect(passwordReset.isUsed()).toBe(false);
    });

    it("should return true when the password reset is used", () => {
        const passwordReset = PasswordReset.restore({
            ...restoreProps(),
            usedAt: new Date("2025-01-02T00:00:00.000Z"),
        });
        expect(passwordReset.isUsed()).toBe(true);
    });

    it("should return true when the password reset can be used", () => {
        const passwordReset = PasswordReset.create(createProps());
        expect(passwordReset.canBeUsed()).toBe(true);
    });

    it("should return false when the password reset is expired", () => {
        jest.useFakeTimers();
        try {
            jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
            const passwordReset = PasswordReset.create({
                ...createProps(),
                expiresAt: ExpirationDate.create(new Date("2025-01-02T00:00:00.000Z")),
            });
            jest.setSystemTime(new Date("2025-01-03T00:00:00.000Z"));
            expect(passwordReset.canBeUsed()).toBe(false);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should return false when the password reset is already used", () => {
        const passwordReset = PasswordReset.restore({
            ...restoreProps(),
            usedAt: new Date("2025-01-02T00:00:00.000Z"),
        });
        expect(passwordReset.canBeUsed()).toBe(false);
    });

    it("should use a password reset with a valid token", () => {
        const token = "password-reset-token";
        const tokenHash = createTokenHash(token);
        const passwordReset = PasswordReset.create({ ...createProps(), tokenHash });
        passwordReset.use(token);
        expect(passwordReset.isUsed()).toBe(true);
        expect(passwordReset.usedAt).toBeInstanceOf(Date);
        expect(passwordReset.updatedAt).toBeInstanceOf(Date);
    });

    it("should preserve the password reset properties when using it", () => {
        const token = "password-reset-token";
        const tokenHash = createTokenHash(token);
        const passwordReset = PasswordReset.create({ ...createProps(), tokenHash });
        const originalId = passwordReset.id;
        const originalAuthenticationAccountId = passwordReset.authenticationAccountId;
        const originalTokenHash = passwordReset.tokenHash;
        const originalExpiresAt = passwordReset.expiresAt;
        const originalCreatedAt = passwordReset.createdAt;
        passwordReset.use(token);
        expect(passwordReset.id).toBe(originalId);
        expect(passwordReset.authenticationAccountId).toBe(originalAuthenticationAccountId);
        expect(passwordReset.tokenHash).toBe(originalTokenHash);
        expect(passwordReset.expiresAt).toBe(originalExpiresAt);
        expect(passwordReset.createdAt).toBe(originalCreatedAt);
    });

    it("should throw InvalidTokenError when using an invalid token", () => {
        const token = "password-reset-token";
        const tokenHash = createTokenHash(token);
        const passwordReset = PasswordReset.create({ ...createProps(), tokenHash });
        expect(() => passwordReset.use("invalid-token")).toThrow(InvalidTokenError);
    });

    it("should throw PasswordResetExpiredError when using an expired password reset", () => {
        jest.useFakeTimers();

        try {
            jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
            const token = "password-reset-token";
            const tokenHash = createTokenHash(token);
            const passwordReset = PasswordReset.create({
                ...createProps(),
                tokenHash,
                expiresAt: ExpirationDate.create(new Date("2025-01-02T00:00:00.000Z")),
            });
            jest.setSystemTime(new Date("2025-01-03T00:00:00.000Z"));
            expect(() => passwordReset.use(token)).toThrow(PasswordResetExpiredError);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should throw PasswordResetAlreadyUsedError when using an already used password reset", () => {
        const token = "password-reset-token";
        const tokenHash = createTokenHash(token);
        const passwordReset = PasswordReset.restore({
            ...restoreProps(),
            tokenHash,
            usedAt: new Date("2025-01-02T00:00:00.000Z"),
        });
        expect(() => passwordReset.use(token)).toThrow(PasswordResetAlreadyUsedError);
    });

    it("should not mark the password reset as used when using an invalid token", () => {
        const token = "password-reset-token";
        const tokenHash = createTokenHash(token);
        const passwordReset = PasswordReset.create({ ...createProps(), tokenHash });
        expect(() => passwordReset.use("invalid-token")).toThrow(InvalidTokenError);
        expect(passwordReset.usedAt).toBeNull();
    });
});
