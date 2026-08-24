import { EmailAlreadyVerifiedError, EmptyEmailError, EmptyProviderError, EmptyUserIdError } from "../../errors";
import type { AuthenticationAccountProps } from "../../types";
import { type PasswordHash } from "../../value-objects";

export class AuthenticationAccount {
    private readonly props: AuthenticationAccountProps;

    private constructor(props: AuthenticationAccountProps) {
        this.ensureUserIdIsNotEmpty(props.userId);
        this.ensureProviderIsNotEmpty(props.provider);
        this.ensureEmailIsNotEmpty(props.email);
        this.props = props;
    }

    public static create(props: Omit<AuthenticationAccountProps, "emailVerified">): AuthenticationAccount {
        return new AuthenticationAccount({ ...props, emailVerified: false });
    }

    public static restore(props: AuthenticationAccountProps): AuthenticationAccount {
        return new AuthenticationAccount(props);
    }

    public update(props: { passwordHash?: PasswordHash }): void {
        if (props.passwordHash !== undefined) {
            this.props.passwordHash = props.passwordHash;
        }
        this.props.updatedAt = new Date();
    }

    public verifyEmail(): void {
        if (this.props.emailVerified) {
            throw new EmailAlreadyVerifiedError();
        }
        this.props.emailVerified = true;
        this.props.updatedAt = new Date();
    }

    private ensureUserIdIsNotEmpty(userId: string): void {
        if (userId.trim() === "") {
            throw new EmptyUserIdError();
        }
    }

    private ensureProviderIsNotEmpty(provider: string): void {
        if (provider.trim() === "") {
            throw new EmptyProviderError();
        }
    }

    private ensureEmailIsNotEmpty(email: string): void {
        if (email.trim() === "") {
            throw new EmptyEmailError();
        }
    }

    public get id(): string {
        return this.props.id;
    }

    public get userId(): string {
        return this.props.userId;
    }

    public get provider(): string {
        return this.props.provider;
    }

    public get email(): string {
        return this.props.email;
    }

    public get emailVerified(): boolean {
        return this.props.emailVerified;
    }

    public get passwordHash(): PasswordHash | null {
        return this.props.passwordHash;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}
