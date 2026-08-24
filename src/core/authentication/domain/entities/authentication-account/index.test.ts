import { EmailAlreadyVerifiedError, EmptyEmailError, EmptyProviderError, EmptyUserIdError } from "../../errors";
import { type AuthenticationAccountProps } from "../../types";
import { PasswordHash } from "../../value-objects/password-hash";
import { AuthenticationAccount } from "./index";

const createProps = (): Omit<AuthenticationAccountProps, "emailVerified"> => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");

    return {
        id: "authentication-account-id",
        userId: "user-id",
        provider: "local",
        email: "omar@gmail.com",
        passwordHash: PasswordHash.create("hashed-password"),
        createdAt,
        updatedAt: createdAt,
    };
};

const restoreProps = (): AuthenticationAccountProps => ({
    ...createProps(),
    emailVerified: true,
});

describe("AuthenticationAccount", () => {
    it("should restore an authentication account preserving its persisted email verification status", () => {
        const account = AuthenticationAccount.restore(restoreProps());
        expect(account.emailVerified).toBe(true);
    });

    it("should create an authentication account with email not verified", () => {
        const account = AuthenticationAccount.create(createProps());
        expect(account.emailVerified).toBe(false);
    });

    it("should throw EmptyUserIdError when user id is empty", () => {
        const props = createProps();
        props.userId = "";
        expect(() => AuthenticationAccount.create(props)).toThrow(EmptyUserIdError);
    });

    it("should throw EmptyUserIdError when user id contains only spaces", () => {
        const props = createProps();
        props.userId = "   ";
        expect(() => AuthenticationAccount.create(props)).toThrow(EmptyUserIdError);
    });

    it("should throw EmptyProviderError when provider is empty", () => {
        const props = createProps();
        props.provider = "";
        expect(() => AuthenticationAccount.create(props)).toThrow(EmptyProviderError);
    });

    it("should throw EmptyProviderError when provider contains only spaces", () => {
        const props = createProps();
        props.provider = "   ";
        expect(() => AuthenticationAccount.create(props)).toThrow(EmptyProviderError);
    });

    it("should throw EmptyEmailError when email is empty", () => {
        const props = createProps();
        props.email = "";
        expect(() => AuthenticationAccount.create(props)).toThrow(EmptyEmailError);
    });

    it("should throw EmptyEmailError when email contains only spaces", () => {
        const props = createProps();
        props.email = "   ";
        expect(() => AuthenticationAccount.create(props)).toThrow(EmptyEmailError);
    });

    it("should expose all properties through getters", () => {
        const props = createProps();
        const account = AuthenticationAccount.create(props);

        expect(account.id).toBe(props.id);
        expect(account.userId).toBe(props.userId);
        expect(account.provider).toBe(props.provider);
        expect(account.email).toBe(props.email);
        expect(account.emailVerified).toBe(false);
        expect(account.passwordHash).toBe(props.passwordHash);
        expect(account.createdAt).toEqual(props.createdAt);
        expect(account.updatedAt).toEqual(props.updatedAt);
    });

    it("should update the password hash successfully", () => {
        const account = AuthenticationAccount.create(createProps());
        const passwordHash = PasswordHash.create("new-hashed-password");

        account.update({ passwordHash });

        expect(account.passwordHash).toBe(passwordHash);
        expect(account.updatedAt).toBeInstanceOf(Date);
        expect(account.updatedAt.getTime()).toBeGreaterThanOrEqual(account.createdAt.getTime());
    });

    it("should not change the password hash when no password hash is provided", () => {
        const props = createProps();
        const account = AuthenticationAccount.create(props);
        const originalPasswordHash = account.passwordHash;

        account.update({});

        expect(account.passwordHash).toBe(originalPasswordHash);
        expect(account.updatedAt).toBeInstanceOf(Date);
    });

    it("should verify an unverified email", () => {
        const account = AuthenticationAccount.create(createProps());

        account.verifyEmail();

        expect(account.emailVerified).toBe(true);
        expect(account.updatedAt).toBeInstanceOf(Date);
        expect(account.updatedAt.getTime()).toBeGreaterThanOrEqual(account.createdAt.getTime());
    });

    it("should throw EmailAlreadyVerifiedError when email is already verified", () => {
        const account = AuthenticationAccount.restore(restoreProps());

        expect(() => account.verifyEmail()).toThrow(EmailAlreadyVerifiedError);
    });

    it("should preserve the existing properties when updating the password hash", () => {
        const account = AuthenticationAccount.create(createProps());
        const originalUserId = account.userId;
        const originalProvider = account.provider;
        const originalEmail = account.email;

        account.update({
            passwordHash: PasswordHash.create("new-hashed-password"),
        });

        expect(account.userId).toBe(originalUserId);
        expect(account.provider).toBe(originalProvider);
        expect(account.email).toBe(originalEmail);
    });
});
