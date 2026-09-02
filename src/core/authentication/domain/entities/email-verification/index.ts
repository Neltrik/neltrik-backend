import {
    EmailVerificationAlreadyCompletedError,
    EmailVerificationExpiredError,
    EmptyAccountIdError,
    EmptyEmailError,
    InvalidTokenError,
} from "../../errors";
import type { EmailVerificationProps } from "../../types";
import type { ExpirationDate } from "../../value-objects";
import { type TokenHash } from "../../value-objects";

export class EmailVerification {
    private readonly props: EmailVerificationProps;

    private constructor(props: EmailVerificationProps) {
        this.ensureEmailIsNotEmpty(props.email);
        this.ensureAuthenticationAccountIdIsNotEmpty(props.authenticationAccountId);
        this.props = props;
    }

    public static create(props: Omit<EmailVerificationProps, "verifiedAt">): EmailVerification {
        return new EmailVerification({ ...props, verifiedAt: null });
    }

    public static restore(props: EmailVerificationProps): EmailVerification {
        return new EmailVerification(props);
    }

    public complete(token: string): void {
        this.ensureCanBeCompleted();
        this.ensureTokenIsValid(token);
        const now = new Date();
        this.props.verifiedAt = now;
        this.props.updatedAt = now;
    }

    public isPending(): boolean {
        return this.props.verifiedAt === null && !this.isExpired();
    }

    public isExpired(): boolean {
        return this.props.expiresAt.isExpired();
    }

    public isCompleted(): boolean {
        return this.props.verifiedAt !== null;
    }

    public canBeCompleted(): boolean {
        return !this.isExpired() && !this.isCompleted();
    }

    private ensureCanBeCompleted(): void {
        if (this.isExpired()) {
            throw new EmailVerificationExpiredError();
        }
        if (this.isCompleted()) {
            throw new EmailVerificationAlreadyCompletedError();
        }
    }

    private ensureTokenIsValid(token: string): void {
        if (!this.props.tokenHash.verify(token)) {
            throw new InvalidTokenError();
        }
    }

    private ensureEmailIsNotEmpty(email: string): void {
        if (!email || email.trim() === "") {
            throw new EmptyEmailError();
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

    public get email(): string {
        return this.props.email;
    }

    public get tokenHash(): TokenHash {
        return this.props.tokenHash;
    }

    public get expiresAt(): ExpirationDate {
        return this.props.expiresAt;
    }

    public get verifiedAt(): Date | null {
        return this.props.verifiedAt;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}
