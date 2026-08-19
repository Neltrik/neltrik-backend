import { EmptyAuthenticationAccountEmailError, EmptyAuthenticationAccountUserIdError } from "../../errors";
import type { AuthenticationAccountProps } from "../../types";
import type { AuthenticationProvider, PasswordHash } from "../../value-objects";

export class AuthenticationAccount {
    private readonly props: AuthenticationAccountProps;

    private constructor(props: AuthenticationAccountProps) {
        this.ensureUserIdIsNotEmpty(props.userId);
        this.ensureEmailIsValidForProvider(props);
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
        this.props.emailVerified = true;
        this.props.updatedAt = new Date();
    }

    private ensureUserIdIsNotEmpty(userId: string): void {
        if (userId.trim() === "") {
            throw new EmptyAuthenticationAccountUserIdError();
        }
    }

    private ensureEmailIsValidForProvider(props: AuthenticationAccountProps): void {
        if (props.provider.value === "email-password" && props.email.trim() === "") {
            throw new EmptyAuthenticationAccountEmailError();
        }
    }

    public get id(): string {
        return this.props.id;
    }

    public get userId(): string {
        return this.props.userId;
    }

    public get provider(): AuthenticationProvider {
        return this.props.provider;
    }

    public get email(): string {
        return this.props.email;
    }

    public get emailVerified(): boolean {
        return this.props.emailVerified;
    }

    public get passwordHash(): PasswordHash {
        return this.props.passwordHash;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}
