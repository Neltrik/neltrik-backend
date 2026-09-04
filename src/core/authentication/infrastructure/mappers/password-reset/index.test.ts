import type { PasswordReset as PrismaPasswordReset } from "@prisma/client";

import { PasswordReset } from "../../../domain/entities";
import { ExpirationDate, TokenHash } from "../../../domain/value-objects";
import { PasswordResetMapper } from "./index";

const createProps = () => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "password-reset-id",
        authenticationAccountId: "authentication-account-id",
        tokenHash: TokenHash.create("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"),
        expiresAt: ExpirationDate.create(new Date("2030-01-01T00:00:00.000Z")),
        usedAt: null,
        createdAt,
        updatedAt: createdAt,
    };
};

describe("PasswordResetMapper", () => {
    it("should map a domain password reset to persistence", () => {
        const props = createProps();
        const reset = PasswordReset.restore(props);
        const persistence = PasswordResetMapper.toPersistence(reset);
        expect(persistence).toEqual({
            id: reset.id,
            authenticationAccountId: reset.authenticationAccountId,
            tokenHash: reset.tokenHash.value,
            expiresAt: reset.expiresAt.value,
            usedAt: reset.usedAt,
            createdAt: reset.createdAt,
            updatedAt: reset.updatedAt,
        });
    });

    it("should map a persistence password reset to domain", () => {
        const props = createProps();
        const persistence: PrismaPasswordReset = {
            ...props,
            tokenHash: props.tokenHash.value,
            expiresAt: props.expiresAt.value,
        };
        const reset = PasswordResetMapper.toDomain(persistence);
        expect(reset).toBeInstanceOf(PasswordReset);
        expect(reset.id).toBe(persistence.id);
        expect(reset.authenticationAccountId).toBe(persistence.authenticationAccountId);
        expect(reset.tokenHash.value).toBe(persistence.tokenHash);
        expect(reset.expiresAt.value).toEqual(persistence.expiresAt);
        expect(reset.usedAt).toBe(persistence.usedAt);
        expect(reset.createdAt).toEqual(persistence.createdAt);
        expect(reset.updatedAt).toEqual(persistence.updatedAt);
    });

    it("should map a used password reset to domain", () => {
        const props = createProps();
        const usedAt = new Date("2025-01-02T00:00:00.000Z");
        const persistence: PrismaPasswordReset = {
            ...props,
            tokenHash: props.tokenHash.value,
            expiresAt: props.expiresAt.value,
            usedAt,
        };
        const reset = PasswordResetMapper.toDomain(persistence);
        expect(reset.usedAt).toEqual(usedAt);
    });

    it("should preserve null usedAt when mapping to persistence", () => {
        const reset = PasswordReset.restore(createProps());
        const persistence = PasswordResetMapper.toPersistence(reset);
        expect(persistence.usedAt).toBeNull();
    });

    it("should preserve null usedAt when mapping to domain", () => {
        const props = createProps();
        const persistence: PrismaPasswordReset = {
            ...props,
            tokenHash: props.tokenHash.value,
            expiresAt: props.expiresAt.value,
            usedAt: null,
        };
        const reset = PasswordResetMapper.toDomain(persistence);
        expect(reset.usedAt).toBeNull();
    });

    it("should map token hash value object to a string in persistence", () => {
        const reset = PasswordReset.restore(createProps());
        const persistence = PasswordResetMapper.toPersistence(reset);
        expect(typeof persistence.tokenHash).toBe("string");
        expect(persistence.tokenHash).toBe(reset.tokenHash.value);
    });

    it("should recreate token hash value object when mapping to domain", () => {
        const props = createProps();
        const persistence: PrismaPasswordReset = {
            ...props,
            tokenHash: props.tokenHash.value,
            expiresAt: props.expiresAt.value,
        };
        const reset = PasswordResetMapper.toDomain(persistence);
        expect(reset.tokenHash).toBeInstanceOf(TokenHash);
        expect(reset.tokenHash.value).toBe(persistence.tokenHash);
    });

    it("should map expiration date as a Date value to persistence", () => {
        const reset = PasswordReset.restore(createProps());
        const persistence = PasswordResetMapper.toPersistence(reset);
        expect(persistence.expiresAt).toBeInstanceOf(Date);
        expect(persistence.expiresAt).toEqual(reset.expiresAt.value);
    });

    it("should recreate expiration date value object when mapping to domain", () => {
        const props = createProps();
        const persistence: PrismaPasswordReset = {
            ...props,
            tokenHash: props.tokenHash.value,
            expiresAt: props.expiresAt.value,
        };
        const reset = PasswordResetMapper.toDomain(persistence);
        expect(reset.expiresAt).toBeInstanceOf(ExpirationDate);
        expect(reset.expiresAt.value).toEqual(persistence.expiresAt);
    });
});
