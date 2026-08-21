import { EmptyRecipientError, InvalidRecipientError } from "../../errors/invitation";

export class Recipient {
    private constructor(private readonly recipient: string) {}

    public static create(value: string): Recipient {
        const normalizedValue = value.trim();
        this.ensureIsNotEmpty(normalizedValue);
        this.ensureIsValid(normalizedValue);
        return new Recipient(normalizedValue);
    }

    private static ensureIsNotEmpty(value: string): void {
        if (value === "") {
            throw new EmptyRecipientError();
        }
    }

    private static ensureIsValid(value: string): void {
        const isEmail = this.isValidEmail(value);
        const isPhone = this.isValidPhone(value);
        if (!isEmail && !isPhone) {
            throw new InvalidRecipientError();
        }
    }

    private static isValidEmail(value: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }

    private static isValidPhone(value: string): boolean {
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        return phoneRegex.test(value);
    }

    public get value(): string {
        return this.recipient;
    }

    public equals(other: Recipient): boolean {
        return this.recipient === other.recipient;
    }
}
