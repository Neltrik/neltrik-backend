import type { AuthenticationAccount as PrismaAuthenticationAccount } from "@prisma/client";

import { AuthenticationAccount } from "../../../domain/entities";
import { PasswordHash } from "../../../domain/value-objects";
import { AuthenticationAccountMapper } from "./index";

const createProps = () => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "authentication-account-id",
        userId: "user-id",
        provider: "local",
        email: "omar@gmail.com",
        emailVerified: true,
        passwordHash: PasswordHash.create("hashed-password"),
        createdAt,
        updatedAt: createdAt,
    };
};

describe("AuthenticationAccountMapper", () => {
    it("should map a domain authentication account to persistence", () => {
        const props = createProps();
        const account = AuthenticationAccount.restore(props);
        const persistence = AuthenticationAccountMapper.toPersistence(account);
        expect(persistence).toEqual({
            id: account.id,
            userId: account.userId,
            provider: account.provider,
            email: account.email,
            emailVerified: account.emailVerified,
            passwordHash: account.passwordHash?.value ?? null,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
        });
    });

    it("should map a persistence authentication account to domain", () => {
        const props = createProps();
        const persistence: PrismaAuthenticationAccount = { ...props, passwordHash: props.passwordHash.value };
        const account = AuthenticationAccountMapper.toDomain(persistence);
        expect(account).toBeInstanceOf(AuthenticationAccount);
        expect(account.id).toBe(persistence.id);
        expect(account.userId).toBe(persistence.userId);
        expect(account.provider).toBe(persistence.provider);
        expect(account.email).toBe(persistence.email);
        expect(account.emailVerified).toBe(persistence.emailVerified);
        expect(account.passwordHash?.value).toBe(persistence.passwordHash);
        expect(account.createdAt).toEqual(persistence.createdAt);
        expect(account.updatedAt).toEqual(persistence.updatedAt);
    });

    it("should map a null password hash to a null domain value", () => {
        const props = createProps();
        const persistence: PrismaAuthenticationAccount = { ...props, passwordHash: null };
        const account = AuthenticationAccountMapper.toDomain(persistence);
        expect(account.passwordHash).toBeNull();
    });

    it("should map a null domain password hash to a null persistence value", () => {
        const props = createProps();
        const account = AuthenticationAccount.restore({ ...props, passwordHash: null });
        const persistence = AuthenticationAccountMapper.toPersistence(account);
        expect(persistence.passwordHash).toBeNull();
    });

    it("should preserve an unverified email when mapping to domain", () => {
        const props = createProps();
        const persistence: PrismaAuthenticationAccount = {
            ...props,
            emailVerified: false,
            passwordHash: props.passwordHash.value,
        };
        const account = AuthenticationAccountMapper.toDomain(persistence);
        expect(account.emailVerified).toBe(false);
    });
});
