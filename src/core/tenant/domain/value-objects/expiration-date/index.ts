import { ExpirationDateInPastError, InvalidExpirationDateError } from "../../errors/invitation";

export class ExpirationDate {
    private constructor(private readonly expirationDate: Date) {}

    public static create(value: Date): ExpirationDate {
        this.ensureIsValidDate(value);
        this.ensureIsFutureDate(value);
        return new ExpirationDate(value);
    }

    public static restore(value: Date): ExpirationDate {
        this.ensureIsValidDate(value);
        return new ExpirationDate(value);
    }

    private static ensureIsValidDate(value: Date): void {
        if (!(value instanceof Date) || isNaN(value.getTime())) {
            throw new InvalidExpirationDateError();
        }
    }

    private static ensureIsFutureDate(value: Date): void {
        const now = new Date();
        if (value.getTime() <= now.getTime()) {
            throw new ExpirationDateInPastError();
        }
    }

    public get value(): Date {
        return this.expirationDate;
    }

    public isExpired(): boolean {
        const now = new Date();
        return this.expirationDate.getTime() <= now.getTime();
    }

    public equals(other: ExpirationDate): boolean {
        return this.expirationDate.getTime() === other.expirationDate.getTime();
    }
}
