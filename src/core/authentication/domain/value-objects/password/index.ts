import { PasswordTooLongError, PasswordTooShortError } from "../../errors";

export class Password {
    private static readonly MIN_LENGTH = 8;
    private static readonly MAX_LENGTH = 64;

    private constructor(private readonly password: string) {}

    public static create(value: string): Password {
        const normalizedValue = value.trim();
        this.ensureIsValidLength(normalizedValue);
        return new Password(normalizedValue);
    }

    private static ensureIsValidLength(value: string): void {
        if (value.length < this.MIN_LENGTH) {
            throw new PasswordTooShortError();
        }
        if (value.length > this.MAX_LENGTH) {
            throw new PasswordTooLongError();
        }
    }

    public get value(): string {
        return this.password;
    }

    public equals(other: Password): boolean {
        return this.password === other.password;
    }
}
