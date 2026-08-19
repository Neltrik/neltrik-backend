import { EmptyAuthenticationAccountEmailError, EmptyAuthenticationAccountUserIdError } from "../../errors";
import type { AuthenticationAccountProps } from "../../types";
import { AuthenticationProvider, PasswordHash } from "../../value-objects";
import { AuthenticationAccount } from "./index";

const createProps = (): AuthenticationAccountProps => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "authentication-account-id",
        userId: "user-id",
        provider: AuthenticationProvider.create("email-password"),
        email: "user@example.com",
        emailVerified: false,
        passwordHash: PasswordHash.create("hashed-password"),
        createdAt,
        updatedAt: createdAt,
    };
};

const createAccountProps = (): Omit<AuthenticationAccountProps, "emailVerified"> => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "authentication-account-id",
        userId: "user-id",
        provider: AuthenticationProvider.create("email-password"),
        email: "user@example.com",
        passwordHash: PasswordHash.create("hashed-password"),
        createdAt,
        updatedAt: createdAt,
    };
};

describe("AuthenticationAccount", () => {
    it("should restore an authentication account", () => {
        const account = AuthenticationAccount.restore(createProps());
        expect(account.id).toBe("authentication-account-id");
    });

    it("should create an authentication account", () => {
        const account = AuthenticationAccount.create(createAccountProps());
        expect(account.id).toBe("authentication-account-id");
        expect(account.emailVerified).toBe(false);
    });

    it("should throw EmptyAuthenticationAccountUserIdError when userId is empty", () => {
        const props = createAccountProps();
        props.userId = "";
        expect(() => AuthenticationAccount.create(props)).toThrow(EmptyAuthenticationAccountUserIdError);
    });

    it("should throw EmptyAuthenticationAccountUserIdError when userId contains only spaces", () => {
        const props = createAccountProps();
        props.userId = "   ";
        expect(() => AuthenticationAccount.create(props)).toThrow(EmptyAuthenticationAccountUserIdError);
    });

    it("should throw EmptyAuthenticationAccountEmailError when email is empty for email-password provider", () => {
        const props = createAccountProps();
        props.email = "";
        expect(() => AuthenticationAccount.create(props)).toThrow(EmptyAuthenticationAccountEmailError);
    });

    it("should throw EmptyAuthenticationAccountEmailError when email contains only spaces for email-password provider", () => {
        const props = createAccountProps();
        props.email = "   ";
        expect(() => AuthenticationAccount.create(props)).toThrow(EmptyAuthenticationAccountEmailError);
    });

    it("should expose all properties through getters", () => {
        const props = createProps();
        const account = AuthenticationAccount.restore(props);
        expect(account.id).toBe(props.id);
        expect(account.userId).toBe(props.userId);
        expect(account.provider).toBe(props.provider);
        expect(account.email).toBe(props.email);
        expect(account.emailVerified).toBe(props.emailVerified);
        expect(account.passwordHash).toBe(props.passwordHash);
        expect(account.createdAt).toBe(props.createdAt);
        expect(account.updatedAt).toBe(props.updatedAt);
    });

    it("should update password hash", () => {
        const account = AuthenticationAccount.create(createAccountProps());
        const passwordHash = PasswordHash.create("new-hashed-password");
        account.update({ passwordHash });
        expect(account.passwordHash).toBe(passwordHash);
        expect(account.updatedAt).toBeInstanceOf(Date);
    });

    it("should not update userId", () => {
        const account = AuthenticationAccount.create(createAccountProps());
        account.update({});
        expect(account.userId).toBe("user-id");
    });

    it("should not update provider", () => {
        const account = AuthenticationAccount.create(createAccountProps());
        account.update({});
        expect(account.provider.value).toBe("email-password");
    });

    it("should not update emailVerified through update", () => {
        const account = AuthenticationAccount.create(createAccountProps());
        account.update({});
        expect(account.emailVerified).toBe(false);
    });

    it("should verify email", () => {
        const account = AuthenticationAccount.create(createAccountProps());
        account.verifyEmail();
        expect(account.emailVerified).toBe(true);
        expect(account.updatedAt).toBeInstanceOf(Date);
    });

    it("should restore an already verified authentication account", () => {
        const props = createProps();
        props.emailVerified = true;
        const account = AuthenticationAccount.restore(props);
        expect(account.emailVerified).toBe(true);
    });

    it("should preserve createdAt when updating password hash", () => {
        const props = createProps();
        const account = AuthenticationAccount.restore(props);
        const passwordHash = PasswordHash.create("new-hashed-password");
        account.update({ passwordHash });
        expect(account.createdAt).toBe(props.createdAt);
    });
});
