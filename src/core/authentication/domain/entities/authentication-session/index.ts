import { InvalidRefreshTokenError, SessionExpiredError, SessionRevokedError } from "../../errors";
import type { AuthenticationSessionProps } from "../../types";
import type { ExpirationDate } from "../../value-objects";

export class AuthenticationSession {
    private readonly props: AuthenticationSessionProps;

    private constructor(props: AuthenticationSessionProps) {
        this.ensureRefreshTokenHashIsNotEmpty(props.refreshTokenHash);
        this.props = props;
    }

    public static create(props: Omit<AuthenticationSessionProps, "revokedAt" | "lastUsedAt">): AuthenticationSession {
        return new AuthenticationSession({ ...props, revokedAt: null, lastUsedAt: null });
    }

    public static restore(props: AuthenticationSessionProps): AuthenticationSession {
        return new AuthenticationSession(props);
    }

    public renew(
        newRefreshTokenHash: string,
        newExpiresAt: ExpirationDate,
        newRefreshTokenExpiresAt: ExpirationDate,
    ): void {
        this.ensureCanBeRenewed();
        this.props.refreshTokenHash = newRefreshTokenHash;
        this.props.expiresAt = newExpiresAt;
        this.props.refreshTokenExpiresAt = newRefreshTokenExpiresAt;
        this.props.lastUsedAt = new Date();
        this.props.updatedAt = new Date();
    }

    public revoke(): void {
        if (this.isRevoked()) {
            throw new SessionRevokedError();
        }
        this.props.revokedAt = new Date();
        this.props.updatedAt = new Date();
    }

    public isExpired(): boolean {
        return this.props.expiresAt.isExpired();
    }

    public isRevoked(): boolean {
        return this.props.revokedAt !== null;
    }

    public isRefreshTokenExpired(): boolean {
        return this.props.refreshTokenExpiresAt.isExpired();
    }

    public canBeRenewed(): boolean {
        return !this.isExpired() && !this.isRevoked() && !this.isRefreshTokenExpired();
    }

    private ensureCanBeRenewed(): void {
        if (this.isExpired()) {
            throw new SessionExpiredError();
        }
        if (this.isRevoked()) {
            throw new SessionRevokedError();
        }
        if (this.isRefreshTokenExpired()) {
            throw new InvalidRefreshTokenError();
        }
    }

    private ensureRefreshTokenHashIsNotEmpty(refreshTokenHash: string): void {
        if (!refreshTokenHash || refreshTokenHash.trim() === "") {
            throw new InvalidRefreshTokenError();
        }
    }

    public get id(): string {
        return this.props.id;
    }

    public get authenticationAccountId(): string {
        return this.props.authenticationAccountId;
    }

    public get refreshTokenHash(): string {
        return this.props.refreshTokenHash;
    }

    public get expiresAt(): ExpirationDate {
        return this.props.expiresAt;
    }

    public get refreshTokenExpiresAt(): ExpirationDate {
        return this.props.refreshTokenExpiresAt;
    }

    public get revokedAt(): Date | null {
        return this.props.revokedAt;
    }

    public get lastUsedAt(): Date | null {
        return this.props.lastUsedAt;
    }

    public get ipAddress(): string | null {
        return this.props.ipAddress;
    }

    public get userAgent(): string | null {
        return this.props.userAgent;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}
