import type { AuthenticationAccount as PrismaAuthenticationAccount } from "@prisma/client";

import { AuthenticationAccount } from "../../../domain/entities";
import type { AuthenticationAccountProps } from "../../../domain/types";
import { AuthenticationProvider, PasswordHash } from "../../../domain/value-objects";
import { AuthenticationAccountMapper } from "./index";

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

describe("AuthenticationAccountMapper", () => {
    it("should map a domain authentication account to persistence", () => {
        const account = AuthenticationAccount.restore(createProps());
        const persistence = AuthenticationAccountMapper.toPersistence(account);
        expect(persistence).toEqual({
            id: account.id,
            userId: account.userId,
            provider: account.provider.value,
            email: account.email,
            emailVerified: account.emailVerified,
            passwordHash: account.passwordHash.value,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
        });
    });

    it("should map a persistence authentication account to domain", () => {
        const props = createProps();
        const persistence: PrismaAuthenticationAccount = {
            id: props.id,
            userId: props.userId,
            provider: props.provider.value,
            email: props.email,
            emailVerified: props.emailVerified,
            passwordHash: props.passwordHash.value,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
        const account = AuthenticationAccountMapper.toDomain(persistence);
        expect(account).toBeInstanceOf(AuthenticationAccount);
        expect(account.id).toBe(persistence.id);
        expect(account.userId).toBe(persistence.userId);
        expect(account.provider.value).toBe(persistence.provider);
        expect(account.email).toBe(persistence.email);
        expect(account.emailVerified).toBe(persistence.emailVerified);
        expect(account.passwordHash.value).toBe(persistence.passwordHash);
        expect(account.createdAt).toEqual(persistence.createdAt);
        expect(account.updatedAt).toEqual(persistence.updatedAt);
    });
});
