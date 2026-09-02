import type { EmailVerification as PrismaEmailVerification } from "@prisma/client";

import { EmailVerification } from "../../../domain/entities";
import { ExpirationDate, TokenHash } from "../../../domain/value-objects";
import { EmailVerificationMapper } from "./index";

const createProps = () => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "email-verification-id",
        authenticationAccountId: "authentication-account-id",
        email: "user@example.com",
        tokenHash: TokenHash.create("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"),
        expiresAt: ExpirationDate.create(new Date("2030-01-01T00:00:00.000Z")),
        verifiedAt: null,
        createdAt,
        updatedAt: createdAt,
    };
};

describe("EmailVerificationMapper", () => {
    it("should map a domain email verification to persistence", () => {
        const props = createProps();
        const verification = EmailVerification.restore(props);
        const persistence = EmailVerificationMapper.toPersistence(verification);
        expect(persistence).toEqual({
            id: verification.id,
            authenticationAccountId: verification.authenticationAccountId,
            email: verification.email,
            tokenHash: verification.tokenHash.value,
            expiresAt: verification.expiresAt.value,
            verifiedAt: verification.verifiedAt,
            createdAt: verification.createdAt,
            updatedAt: verification.updatedAt,
        });
    });

    it("should map a persistence email verification to domain", () => {
        const props = createProps();
        const persistence: PrismaEmailVerification = {
            ...props,
            tokenHash: props.tokenHash.value,
            expiresAt: props.expiresAt.value,
        };
        const verification = EmailVerificationMapper.toDomain(persistence);
        expect(verification).toBeInstanceOf(EmailVerification);
        expect(verification.id).toBe(persistence.id);
        expect(verification.authenticationAccountId).toBe(persistence.authenticationAccountId);
        expect(verification.email).toBe(persistence.email);
        expect(verification.tokenHash.value).toBe(persistence.tokenHash);
        expect(verification.expiresAt.value).toEqual(persistence.expiresAt);
        expect(verification.verifiedAt).toBe(persistence.verifiedAt);
        expect(verification.createdAt).toEqual(persistence.createdAt);
        expect(verification.updatedAt).toEqual(persistence.updatedAt);
    });

    it("should map a verified email verification to domain", () => {
        const props = createProps();
        const verifiedAt = new Date("2025-01-02T00:00:00.000Z");
        const persistence: PrismaEmailVerification = {
            ...props,
            tokenHash: props.tokenHash.value,
            expiresAt: props.expiresAt.value,
            verifiedAt,
        };
        const verification = EmailVerificationMapper.toDomain(persistence);
        expect(verification.verifiedAt).toEqual(verifiedAt);
    });

    it("should preserve null verifiedAt when mapping to persistence", () => {
        const verification = EmailVerification.restore(createProps());
        const persistence = EmailVerificationMapper.toPersistence(verification);
        expect(persistence.verifiedAt).toBeNull();
    });

    it("should preserve null verifiedAt when mapping to domain", () => {
        const props = createProps();
        const persistence: PrismaEmailVerification = {
            ...props,
            tokenHash: props.tokenHash.value,
            expiresAt: props.expiresAt.value,
            verifiedAt: null,
        };
        const verification = EmailVerificationMapper.toDomain(persistence);
        expect(verification.verifiedAt).toBeNull();
    });

    it("should map token hash value object to a string in persistence", () => {
        const verification = EmailVerification.restore(createProps());
        const persistence = EmailVerificationMapper.toPersistence(verification);
        expect(typeof persistence.tokenHash).toBe("string");
        expect(persistence.tokenHash).toBe(verification.tokenHash.value);
    });

    it("should recreate token hash value object when mapping to domain", () => {
        const props = createProps();
        const persistence: PrismaEmailVerification = {
            ...props,
            tokenHash: props.tokenHash.value,
            expiresAt: props.expiresAt.value,
        };
        const verification = EmailVerificationMapper.toDomain(persistence);
        expect(verification.tokenHash).toBeInstanceOf(TokenHash);
        expect(verification.tokenHash.value).toBe(persistence.tokenHash);
    });

    it("should map expiration date as a Date value to persistence", () => {
        const verification = EmailVerification.restore(createProps());
        const persistence = EmailVerificationMapper.toPersistence(verification);
        expect(persistence.expiresAt).toBeInstanceOf(Date);
        expect(persistence.expiresAt).toEqual(verification.expiresAt.value);
    });

    it("should recreate expiration date value object when mapping to domain", () => {
        const props = createProps();
        const persistence: PrismaEmailVerification = {
            ...props,
            tokenHash: props.tokenHash.value,
            expiresAt: props.expiresAt.value,
        };
        const verification = EmailVerificationMapper.toDomain(persistence);
        expect(verification.expiresAt).toBeInstanceOf(ExpirationDate);
        expect(verification.expiresAt.value).toEqual(persistence.expiresAt);
    });
});
