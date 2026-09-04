import {
    EmptyAccountIdError,
    InvalidTokenError,
    PasswordResetAlreadyUsedError,
    PasswordResetExpiredError,
} from "../../errors";
import type { PasswordResetProps } from "../../types";
import type { ExpirationDate } from "../../value-objects";
import { type TokenHash } from "../../value-objects";

export class PasswordReset {
    private readonly props: PasswordResetProps;

    private constructor(props: PasswordResetProps) {
        this.ensureAuthenticationAccountIdIsNotEmpty(props.authenticationAccountId);
        this.props = props;
    }

    public static create(props: Omit<PasswordResetProps, "usedAt">): PasswordReset {
        return new PasswordReset({ ...props, usedAt: null });
    }

    public static restore(props: PasswordResetProps): PasswordReset {
        return new PasswordReset(props);
    }

    public use(token: string): void {
        this.ensureCanBeUsed();
        this.ensureTokenIsValid(token);
        const now = new Date();
        this.props.usedAt = now;
        this.props.updatedAt = now;
    }

    public isPending(): boolean {
        return this.props.usedAt === null && !this.isExpired();
    }

    public isExpired(): boolean {
        return this.props.expiresAt.isExpired();
    }

    public isUsed(): boolean {
        return this.props.usedAt !== null;
    }

    public canBeUsed(): boolean {
        return !this.isExpired() && !this.isUsed();
    }

    private ensureCanBeUsed(): void {
        if (this.isExpired()) {
            throw new PasswordResetExpiredError();
        }
        if (this.isUsed()) {
            throw new PasswordResetAlreadyUsedError();
        }
    }

    private ensureTokenIsValid(token: string): void {
        if (!this.props.tokenHash.verify(token)) {
            throw new InvalidTokenError();
        }
    }

    private ensureAuthenticationAccountIdIsNotEmpty(authenticationAccountId: string): void {
        if (!authenticationAccountId || authenticationAccountId.trim() === "") {
            throw new EmptyAccountIdError();
        }
    }

    public get id(): string {
        return this.props.id;
    }

    public get authenticationAccountId(): string {
        return this.props.authenticationAccountId;
    }

    public get tokenHash(): TokenHash {
        return this.props.tokenHash;
    }

    public get expiresAt(): ExpirationDate {
        return this.props.expiresAt;
    }

    public get usedAt(): Date | null {
        return this.props.usedAt;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}
