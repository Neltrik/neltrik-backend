import { EmptyPasswordError, PasswordTooLongError, PasswordTooShortError } from "../../errors/password";

export class Password {
    private static readonly MIN_LENGTH = 15;
    private static readonly MAX_LENGTH = 64;

    private constructor(private readonly password: string) {}

    public static create(value: string): Password {
        this.ensureIsNotEmpty(value);
        this.ensureMinLength(value);
        this.ensureMaxLength(value);
        return new Password(value);
    }

    private static ensureIsNotEmpty(value: string): void {
        if (value === "") {
            throw new EmptyPasswordError();
        }
    }

    private static ensureMinLength(value: string): void {
        if (value.length < this.MIN_LENGTH) {
            throw new PasswordTooShortError();
        }
    }

    private static ensureMaxLength(value: string): void {
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
