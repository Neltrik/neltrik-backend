import type { AuthenticationSession as PrismaAuthenticationSession } from "@prisma/client";

import { AuthenticationSession } from "../../../domain/entities";
import { ExpirationDate } from "../../../domain/value-objects";
import { AuthenticationSessionMapper } from "./index";

const createProps = () => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "authentication-session-id",
        authenticationAccountId: "authentication-account-id",
        refreshTokenHash: "refresh-token-hash",
        expiresAt: ExpirationDate.create(new Date("2030-01-01T00:00:00.000Z")),
        refreshTokenExpiresAt: ExpirationDate.create(new Date("2030-01-01T00:00:00.000Z")),
        revokedAt: null,
        lastUsedAt: null,
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0",
        createdAt,
        updatedAt: createdAt,
    };
};

describe("AuthenticationSessionMapper", () => {
    it("should map a domain authentication session to persistence", () => {
        const props = createProps();
        const session = AuthenticationSession.restore(props);
        const persistence = AuthenticationSessionMapper.toPersistence(session);
        expect(persistence).toEqual({
            id: session.id,
            authenticationAccountId: session.authenticationAccountId,
            refreshTokenHash: session.refreshTokenHash,
            expiresAt: session.expiresAt.value,
            refreshTokenExpiresAt: session.refreshTokenExpiresAt.value,
            revokedAt: session.revokedAt,
            lastUsedAt: session.lastUsedAt,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
        });
    });

    it("should map a persistence authentication session to domain", () => {
        const props = createProps();
        const persistence: PrismaAuthenticationSession = {
            ...props,
            expiresAt: props.expiresAt.value,
            refreshTokenExpiresAt: props.refreshTokenExpiresAt.value,
        };
        const session = AuthenticationSessionMapper.toDomain(persistence);
        expect(session).toBeInstanceOf(AuthenticationSession);
        expect(session.id).toBe(persistence.id);
        expect(session.authenticationAccountId).toBe(persistence.authenticationAccountId);
        expect(session.refreshTokenHash).toBe(persistence.refreshTokenHash);
        expect(session.expiresAt.value).toEqual(persistence.expiresAt);
        expect(session.refreshTokenExpiresAt.value).toEqual(persistence.refreshTokenExpiresAt);
        expect(session.revokedAt).toBe(persistence.revokedAt);
        expect(session.lastUsedAt).toBe(persistence.lastUsedAt);
        expect(session.ipAddress).toBe(persistence.ipAddress);
        expect(session.userAgent).toBe(persistence.userAgent);
        expect(session.createdAt).toEqual(persistence.createdAt);
        expect(session.updatedAt).toEqual(persistence.updatedAt);
    });

    it("should map a revoked authentication session to domain", () => {
        const props = createProps();
        const revokedAt = new Date("2025-01-02T00:00:00.000Z");
        const persistence: PrismaAuthenticationSession = {
            ...props,
            expiresAt: props.expiresAt.value,
            refreshTokenExpiresAt: props.refreshTokenExpiresAt.value,
            revokedAt,
        };
        const session = AuthenticationSessionMapper.toDomain(persistence);
        expect(session.revokedAt).toEqual(revokedAt);
        expect(session.isRevoked()).toBe(true);
    });

    it("should map a used authentication session to domain", () => {
        const props = createProps();
        const lastUsedAt = new Date("2025-01-02T00:00:00.000Z");
        const persistence: PrismaAuthenticationSession = {
            ...props,
            expiresAt: props.expiresAt.value,
            refreshTokenExpiresAt: props.refreshTokenExpiresAt.value,
            lastUsedAt,
        };
        const session = AuthenticationSessionMapper.toDomain(persistence);
        expect(session.lastUsedAt).toEqual(lastUsedAt);
    });

    it("should preserve null optional fields when mapping to persistence", () => {
        const session = AuthenticationSession.restore(createProps());
        const persistence = AuthenticationSessionMapper.toPersistence(session);
        expect(persistence.revokedAt).toBeNull();
        expect(persistence.lastUsedAt).toBeNull();
        expect(persistence.ipAddress).toBe("127.0.0.1");
        expect(persistence.userAgent).toBe("Mozilla/5.0");
    });

    it("should preserve null optional fields when mapping to domain", () => {
        const props = createProps();
        const persistence: PrismaAuthenticationSession = {
            ...props,
            expiresAt: props.expiresAt.value,
            refreshTokenExpiresAt: props.refreshTokenExpiresAt.value,
            revokedAt: null,
            lastUsedAt: null,
            ipAddress: null,
            userAgent: null,
        };
        const session = AuthenticationSessionMapper.toDomain(persistence);
        expect(session.revokedAt).toBeNull();
        expect(session.lastUsedAt).toBeNull();
        expect(session.ipAddress).toBeNull();
        expect(session.userAgent).toBeNull();
    });

    it("should map expiration dates as Date values to persistence", () => {
        const session = AuthenticationSession.restore(createProps());
        const persistence = AuthenticationSessionMapper.toPersistence(session);
        expect(persistence.expiresAt).toBeInstanceOf(Date);
        expect(persistence.refreshTokenExpiresAt).toBeInstanceOf(Date);
        expect(persistence.expiresAt).toEqual(session.expiresAt.value);
        expect(persistence.refreshTokenExpiresAt).toEqual(session.refreshTokenExpiresAt.value);
    });

    it("should recreate expiration date value objects when mapping to domain", () => {
        const props = createProps();
        const persistence: PrismaAuthenticationSession = {
            ...props,
            expiresAt: props.expiresAt.value,
            refreshTokenExpiresAt: props.refreshTokenExpiresAt.value,
        };
        const session = AuthenticationSessionMapper.toDomain(persistence);
        expect(session.expiresAt).toBeInstanceOf(ExpirationDate);
        expect(session.refreshTokenExpiresAt).toBeInstanceOf(ExpirationDate);
        expect(session.expiresAt.value).toEqual(persistence.expiresAt);
        expect(session.refreshTokenExpiresAt.value).toEqual(persistence.refreshTokenExpiresAt);
    });
});
