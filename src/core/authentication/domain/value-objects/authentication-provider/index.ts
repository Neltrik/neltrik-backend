import { AuthenticationProviderTooLongError, EmptyAuthenticationProviderError } from "../../errors";

export class AuthenticationProvider {
    private constructor(private readonly provider: string) {}

    public static create(value: string): AuthenticationProvider {
        const normalizedValue = value.trim();
        this.ensureIsNotEmpty(normalizedValue);
        this.ensureMaxLength(normalizedValue);
        return new AuthenticationProvider(normalizedValue);
    }

    private static ensureIsNotEmpty(value: string): void {
        if (value === "") {
            throw new EmptyAuthenticationProviderError();
        }
    }

    private static ensureMaxLength(value: string): void {
        if (value.length > 100) {
            throw new AuthenticationProviderTooLongError();
        }
    }

    public get value(): string {
        return this.provider;
    }

    public equals(other: AuthenticationProvider): boolean {
        return this.provider === other.provider;
    }
}
