import { InvalidRefreshTokenError, SessionExpiredError, SessionRevokedError } from "../../errors";
import type { AuthenticationSessionProps } from "../../types";
import { ExpirationDate } from "../../value-objects/expiration-date";
import { AuthenticationSession } from "./index";

const createProps = (): Omit<AuthenticationSessionProps, "revokedAt" | "lastUsedAt"> => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "authentication-session-id",
        authenticationAccountId: "authentication-account-id",
        refreshTokenHash: "refresh-token-hash",
        expiresAt: ExpirationDate.create(new Date("2030-01-01T00:00:00.000Z")),
        refreshTokenExpiresAt: ExpirationDate.create(new Date("2030-01-01T00:00:00.000Z")),
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0",
        createdAt,
        updatedAt: createdAt,
    };
};

const restoreProps = (): AuthenticationSessionProps => ({ ...createProps(), revokedAt: null, lastUsedAt: null });

describe("AuthenticationSession", () => {
    it("should create an authentication session with revokedAt and lastUsedAt as null", () => {
        const session = AuthenticationSession.create(createProps());
        expect(session.revokedAt).toBeNull();
        expect(session.lastUsedAt).toBeNull();
    });

    it("should restore an authentication session preserving its persisted properties", () => {
        const lastUsedAt = new Date("2025-01-02T00:00:00.000Z");
        const revokedAt = new Date("2025-01-03T00:00:00.000Z");
        const session = AuthenticationSession.restore({ ...restoreProps(), lastUsedAt, revokedAt });
        expect(session.lastUsedAt).toBe(lastUsedAt);
        expect(session.revokedAt).toBe(revokedAt);
    });

    it("should throw InvalidRefreshTokenError when refresh token hash is empty", () => {
        const props = createProps();
        props.refreshTokenHash = "";
        expect(() => AuthenticationSession.create(props)).toThrow(InvalidRefreshTokenError);
    });

    it("should throw InvalidRefreshTokenError when refresh token hash contains only spaces", () => {
        const props = createProps();
        props.refreshTokenHash = "   ";
        expect(() => AuthenticationSession.create(props)).toThrow(InvalidRefreshTokenError);
    });

    it("should expose all properties through getters", () => {
        const props = createProps();
        const session = AuthenticationSession.create(props);
        expect(session.id).toBe(props.id);
        expect(session.authenticationAccountId).toBe(props.authenticationAccountId);
        expect(session.refreshTokenHash).toBe(props.refreshTokenHash);
        expect(session.expiresAt).toBe(props.expiresAt);
        expect(session.refreshTokenExpiresAt).toBe(props.refreshTokenExpiresAt);
        expect(session.revokedAt).toBeNull();
        expect(session.lastUsedAt).toBeNull();
        expect(session.ipAddress).toBe(props.ipAddress);
        expect(session.userAgent).toBe(props.userAgent);
        expect(session.createdAt).toBe(props.createdAt);
        expect(session.updatedAt).toBe(props.updatedAt);
    });

    it("should return false when the session is not expired", () => {
        const session = AuthenticationSession.create(createProps());
        expect(session.isExpired()).toBe(false);
    });

    it("should return false when the session is not revoked", () => {
        const session = AuthenticationSession.create(createProps());
        expect(session.isRevoked()).toBe(false);
    });

    it("should return false when the refresh token is not expired", () => {
        const session = AuthenticationSession.create(createProps());
        expect(session.isRefreshTokenExpired()).toBe(false);
    });

    it("should return true when the session can be renewed", () => {
        const session = AuthenticationSession.create(createProps());
        expect(session.canBeRenewed()).toBe(true);
    });

    it("should renew an authentication session successfully", () => {
        const session = AuthenticationSession.create(createProps());
        const newRefreshTokenHash = "new-refresh-token-hash";
        const newExpiresAt = ExpirationDate.create(new Date("2031-01-01T00:00:00.000Z"));
        const newRefreshTokenExpiresAt = ExpirationDate.create(new Date("2031-01-01T00:00:00.000Z"));
        const originalUpdatedAt = session.updatedAt;
        session.renew(newRefreshTokenHash, newExpiresAt, newRefreshTokenExpiresAt);
        expect(session.refreshTokenHash).toBe(newRefreshTokenHash);
        expect(session.expiresAt).toBe(newExpiresAt);
        expect(session.refreshTokenExpiresAt).toBe(newRefreshTokenExpiresAt);
        expect(session.lastUsedAt).toBeInstanceOf(Date);
        expect(session.updatedAt).toBeInstanceOf(Date);
        expect(session.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it("should preserve the session properties when renewing", () => {
        const session = AuthenticationSession.create(createProps());
        const originalId = session.id;
        const originalAuthenticationAccountId = session.authenticationAccountId;
        const originalIpAddress = session.ipAddress;
        const originalUserAgent = session.userAgent;
        const originalCreatedAt = session.createdAt;
        session.renew(
            "new-refresh-token-hash",
            ExpirationDate.create(new Date("2031-01-01T00:00:00.000Z")),
            ExpirationDate.create(new Date("2031-01-01T00:00:00.000Z")),
        );
        expect(session.id).toBe(originalId);
        expect(session.authenticationAccountId).toBe(originalAuthenticationAccountId);
        expect(session.ipAddress).toBe(originalIpAddress);
        expect(session.userAgent).toBe(originalUserAgent);
        expect(session.createdAt).toBe(originalCreatedAt);
    });

    it("should revoke an active authentication session", () => {
        const session = AuthenticationSession.create(createProps());
        session.revoke();
        expect(session.isRevoked()).toBe(true);
        expect(session.revokedAt).toBeInstanceOf(Date);
        expect(session.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw SessionRevokedError when revoking an already revoked session", () => {
        const session = AuthenticationSession.restore({
            ...restoreProps(),
            revokedAt: new Date("2025-01-02T00:00:00.000Z"),
        });
        expect(() => session.revoke()).toThrow(SessionRevokedError);
    });

    it("should return false when session has not expired", () => {
        const session = AuthenticationSession.create(createProps());
        expect(session.isExpired()).toBe(false);
    });

    it("should return false when refresh token has not expired", () => {
        const session = AuthenticationSession.create(createProps());
        expect(session.isRefreshTokenExpired()).toBe(false);
    });

    it("should return false when session is revoked but expiration has not passed", () => {
        const session = AuthenticationSession.restore({
            ...restoreProps(),
            revokedAt: new Date("2025-01-02T00:00:00.000Z"),
        });
        expect(session.isExpired()).toBe(false);
        expect(session.isRevoked()).toBe(true);
        expect(session.canBeRenewed()).toBe(false);
    });

    it("should throw SessionRevokedError when renewing a revoked session", () => {
        const session = AuthenticationSession.restore({
            ...restoreProps(),
            revokedAt: new Date("2025-01-02T00:00:00.000Z"),
        });
        expect(() =>
            session.renew(
                "new-refresh-token-hash",
                ExpirationDate.create(new Date("2031-01-01T00:00:00.000Z")),
                ExpirationDate.create(new Date("2031-01-01T00:00:00.000Z")),
            ),
        ).toThrow(SessionRevokedError);
    });

    it("should throw SessionExpiredError when renewing an expired session", () => {
        jest.useFakeTimers();
        try {
            const now = new Date("2025-01-01T00:00:00.000Z");
            jest.setSystemTime(now);
            const session = AuthenticationSession.create({
                ...createProps(),
                expiresAt: ExpirationDate.create(new Date("2025-01-02T00:00:00.000Z")),
            });
            jest.setSystemTime(new Date("2025-01-03T00:00:00.000Z"));
            expect(() =>
                session.renew(
                    "new-refresh-token-hash",
                    ExpirationDate.create(new Date("2031-01-01T00:00:00.000Z")),
                    ExpirationDate.create(new Date("2031-01-01T00:00:00.000Z")),
                ),
            ).toThrow(SessionExpiredError);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should return false when session is expired", () => {
        jest.useFakeTimers();
        try {
            const now = new Date("2025-01-01T00:00:00.000Z");
            jest.setSystemTime(now);
            const session = AuthenticationSession.create({
                ...createProps(),
                expiresAt: ExpirationDate.create(new Date("2025-01-02T00:00:00.000Z")),
            });
            jest.setSystemTime(new Date("2025-01-03T00:00:00.000Z"));
            expect(session.isExpired()).toBe(true);
            expect(session.canBeRenewed()).toBe(false);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should throw InvalidRefreshTokenError when renewing with an expired refresh token", () => {
        jest.useFakeTimers();
        try {
            const now = new Date("2025-01-01T00:00:00.000Z");
            jest.setSystemTime(now);
            const session = AuthenticationSession.create({
                ...createProps(),
                refreshTokenExpiresAt: ExpirationDate.create(new Date("2025-01-02T00:00:00.000Z")),
            });
            jest.setSystemTime(new Date("2025-01-03T00:00:00.000Z"));
            expect(() =>
                session.renew(
                    "new-refresh-token-hash",
                    ExpirationDate.create(new Date("2031-01-01T00:00:00.000Z")),
                    ExpirationDate.create(new Date("2031-01-01T00:00:00.000Z")),
                ),
            ).toThrow(InvalidRefreshTokenError);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should return false when refresh token is expired", () => {
        jest.useFakeTimers();
        try {
            const now = new Date("2025-01-01T00:00:00.000Z");
            jest.setSystemTime(now);
            const session = AuthenticationSession.create({
                ...createProps(),
                refreshTokenExpiresAt: ExpirationDate.create(new Date("2025-01-02T00:00:00.000Z")),
            });
            jest.setSystemTime(new Date("2025-01-03T00:00:00.000Z"));
            expect(session.isRefreshTokenExpired()).toBe(true);
            expect(session.canBeRenewed()).toBe(false);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should not renew an expired session even when refresh token is valid", () => {
        jest.useFakeTimers();
        try {
            const now = new Date("2025-01-01T00:00:00.000Z");
            jest.setSystemTime(now);
            const session = AuthenticationSession.create({
                ...createProps(),
                expiresAt: ExpirationDate.create(new Date("2025-01-02T00:00:00.000Z")),
            });
            jest.setSystemTime(new Date("2025-01-03T00:00:00.000Z"));
            expect(() =>
                session.renew(
                    "new-refresh-token-hash",
                    ExpirationDate.create(new Date("2031-01-01T00:00:00.000Z")),
                    ExpirationDate.create(new Date("2031-01-01T00:00:00.000Z")),
                ),
            ).toThrow(SessionExpiredError);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should return false when session is revoked and refresh token is expired", () => {
        jest.useFakeTimers();
        try {
            const now = new Date("2025-01-01T00:00:00.000Z");
            jest.setSystemTime(now);
            const session = AuthenticationSession.create({
                ...createProps(),
                refreshTokenExpiresAt: ExpirationDate.create(new Date("2025-01-02T00:00:00.000Z")),
            });
            jest.setSystemTime(new Date("2025-01-03T00:00:00.000Z"));
            session.revoke();
            expect(session.canBeRenewed()).toBe(false);
        } finally {
            jest.useRealTimers();
        }
    });
});
