import { InvalidEmailError } from "../../errors";

export class Email {
    private constructor(private readonly email: string) {}

    public static create(value: string): Email {
        const normalizedValue = value.trim().toLowerCase();
        Email.ensureIsNotEmpty(normalizedValue);
        Email.ensureIsValid(normalizedValue);
        return new Email(normalizedValue);
    }

    private static ensureIsNotEmpty(value: string): void {
        if (value === "") {
            throw new InvalidEmailError();
        }
    }

    private static ensureIsValid(value: string): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            throw new InvalidEmailError();
        }
    }

    public get value(): string {
        return this.email;
    }

    public equals(other: Email): boolean {
        return this.email === other.email;
    }
}
