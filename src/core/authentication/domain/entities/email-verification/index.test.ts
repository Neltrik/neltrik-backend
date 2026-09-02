import { createHash } from "crypto";

import {
    EmailVerificationAlreadyCompletedError,
    EmailVerificationExpiredError,
    EmptyAccountIdError,
    EmptyEmailError,
    InvalidTokenError,
} from "../../errors";
import type { EmailVerificationProps } from "../../types";
import { ExpirationDate, TokenHash } from "../../value-objects";
import { EmailVerification } from "./index";

const createTokenHash = (token: string): TokenHash =>
    TokenHash.create(createHash("sha256").update(token).digest("hex"));

const createProps = (): Omit<EmailVerificationProps, "verifiedAt"> => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "email-verification-id",
        authenticationAccountId: "authentication-account-id",
        email: "user@example.com",
        tokenHash: TokenHash.create("a".repeat(64)),
        expiresAt: ExpirationDate.create(new Date("2030-01-01T00:00:00.000Z")),
        createdAt,
        updatedAt: createdAt,
    };
};

const restoreProps = (): EmailVerificationProps => ({ ...createProps(), verifiedAt: null });

describe("EmailVerification", () => {
    it("should create an email verification with verifiedAt as null", () => {
        const verification = EmailVerification.create(createProps());
        expect(verification.verifiedAt).toBeNull();
    });

    it("should restore an email verification preserving its persisted properties", () => {
        const verifiedAt = new Date("2025-01-02T00:00:00.000Z");
        const verification = EmailVerification.restore({ ...restoreProps(), verifiedAt });
        expect(verification.verifiedAt).toBe(verifiedAt);
    });

    it("should throw EmptyEmailError when email is empty", () => {
        const props = createProps();
        props.email = "";
        expect(() => EmailVerification.create(props)).toThrow(EmptyEmailError);
    });

    it("should throw EmptyEmailError when email contains only spaces", () => {
        const props = createProps();
        props.email = "   ";
        expect(() => EmailVerification.create(props)).toThrow(EmptyEmailError);
    });

    it("should throw EmptyAccountIdError when authentication account ID is empty", () => {
        const props = createProps();
        props.authenticationAccountId = "";
        expect(() => EmailVerification.create(props)).toThrow(EmptyAccountIdError);
    });

    it("should throw EmptyAccountIdError when authentication account ID contains only spaces", () => {
        const props = createProps();
        props.authenticationAccountId = "   ";
        expect(() => EmailVerification.create(props)).toThrow(EmptyAccountIdError);
    });

    it("should expose all properties through getters", () => {
        const props = createProps();
        const verification = EmailVerification.create(props);
        expect(verification.id).toBe(props.id);
        expect(verification.authenticationAccountId).toBe(props.authenticationAccountId);
        expect(verification.email).toBe(props.email);
        expect(verification.tokenHash).toBe(props.tokenHash);
        expect(verification.expiresAt).toBe(props.expiresAt);
        expect(verification.verifiedAt).toBeNull();
        expect(verification.createdAt).toBe(props.createdAt);
        expect(verification.updatedAt).toBe(props.updatedAt);
    });

    it("should return false when the email verification is expired", () => {
        const verification = EmailVerification.create(createProps());
        expect(verification.isExpired()).toBe(false);
    });

    it("should return true when the email verification is expired", () => {
        jest.useFakeTimers();
        try {
            jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
            const verification = EmailVerification.create({
                ...createProps(),
                expiresAt: ExpirationDate.create(new Date("2025-01-02T00:00:00.000Z")),
            });
            jest.setSystemTime(new Date("2025-01-03T00:00:00.000Z"));
            expect(verification.isExpired()).toBe(true);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should return true when the email verification is pending", () => {
        const verification = EmailVerification.create(createProps());
        expect(verification.isPending()).toBe(true);
    });

    it("should return false when the email verification is completed", () => {
        const verification = EmailVerification.restore({
            ...restoreProps(),
            verifiedAt: new Date("2025-01-02T00:00:00.000Z"),
        });
        expect(verification.isPending()).toBe(false);
    });

    it("should return false when the email verification is expired", () => {
        jest.useFakeTimers();
        try {
            jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
            const verification = EmailVerification.create({
                ...createProps(),
                expiresAt: ExpirationDate.create(new Date("2025-01-02T00:00:00.000Z")),
            });
            jest.setSystemTime(new Date("2025-01-03T00:00:00.000Z"));
            expect(verification.isPending()).toBe(false);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should return false when the email verification is not completed", () => {
        const verification = EmailVerification.create(createProps());
        expect(verification.isCompleted()).toBe(false);
    });

    it("should return true when the email verification is completed", () => {
        const verification = EmailVerification.restore({
            ...restoreProps(),
            verifiedAt: new Date("2025-01-02T00:00:00.000Z"),
        });
        expect(verification.isCompleted()).toBe(true);
    });

    it("should return true when the email verification can be completed", () => {
        const verification = EmailVerification.create(createProps());
        expect(verification.canBeCompleted()).toBe(true);
    });

    it("should return false when the email verification is expired", () => {
        jest.useFakeTimers();
        try {
            jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
            const verification = EmailVerification.create({
                ...createProps(),
                expiresAt: ExpirationDate.create(new Date("2025-01-02T00:00:00.000Z")),
            });
            jest.setSystemTime(new Date("2025-01-03T00:00:00.000Z"));
            expect(verification.canBeCompleted()).toBe(false);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should return false when the email verification is already completed", () => {
        const verification = EmailVerification.restore({
            ...restoreProps(),
            verifiedAt: new Date("2025-01-02T00:00:00.000Z"),
        });
        expect(verification.canBeCompleted()).toBe(false);
    });

    it("should complete an email verification with a valid token", () => {
        const token = "verification-token";
        const tokenHash = createTokenHash(token);
        const verification = EmailVerification.create({ ...createProps(), tokenHash });
        verification.complete(token);
        expect(verification.isCompleted()).toBe(true);
        expect(verification.verifiedAt).toBeInstanceOf(Date);
        expect(verification.updatedAt).toBeInstanceOf(Date);
    });

    it("should preserve the verification properties when completing", () => {
        const token = "verification-token";
        const tokenHash = createTokenHash(token);
        const verification = EmailVerification.create({ ...createProps(), tokenHash });
        const originalId = verification.id;
        const originalAuthenticationAccountId = verification.authenticationAccountId;
        const originalEmail = verification.email;
        const originalTokenHash = verification.tokenHash;
        const originalExpiresAt = verification.expiresAt;
        const originalCreatedAt = verification.createdAt;
        verification.complete(token);
        expect(verification.id).toBe(originalId);
        expect(verification.authenticationAccountId).toBe(originalAuthenticationAccountId);
        expect(verification.email).toBe(originalEmail);
        expect(verification.tokenHash).toBe(originalTokenHash);
        expect(verification.expiresAt).toBe(originalExpiresAt);
        expect(verification.createdAt).toBe(originalCreatedAt);
    });

    it("should throw InvalidTokenError when completing with an invalid token", () => {
        const token = "verification-token";
        const tokenHash = createTokenHash(token);
        const verification = EmailVerification.create({ ...createProps(), tokenHash });
        expect(() => verification.complete("invalid-token")).toThrow(InvalidTokenError);
    });

    it("should throw EmailVerificationExpiredError when completing an expired verification", () => {
        jest.useFakeTimers();
        try {
            jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
            const token = "verification-token";
            const tokenHash = createTokenHash(token);
            const verification = EmailVerification.create({
                ...createProps(),
                tokenHash,
                expiresAt: ExpirationDate.create(new Date("2025-01-02T00:00:00.000Z")),
            });
            jest.setSystemTime(new Date("2025-01-03T00:00:00.000Z"));
            expect(() => verification.complete(token)).toThrow(EmailVerificationExpiredError);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should throw EmailVerificationAlreadyCompletedError when completing an already completed verification", () => {
        const token = "verification-token";
        const tokenHash = createTokenHash(token);
        const verification = EmailVerification.restore({
            ...restoreProps(),
            tokenHash,
            verifiedAt: new Date("2025-01-02T00:00:00.000Z"),
        });
        expect(() => verification.complete(token)).toThrow(EmailVerificationAlreadyCompletedError);
    });

    it("should not set verifiedAt when completing with an invalid token", () => {
        const token = "verification-token";
        const tokenHash = createTokenHash(token);
        const verification = EmailVerification.create({ ...createProps(), tokenHash });
        expect(() => verification.complete("invalid-token")).toThrow(InvalidTokenError);
        expect(verification.verifiedAt).toBeNull();
    });
});
