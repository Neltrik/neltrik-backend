import { ExpirationDateInPastError } from "../../errors";

export class ExpirationDate {
    private constructor(private readonly expirationDate: Date) {}

    public static create(value: Date): ExpirationDate {
        this.ensureIsFuture(value);
        return new ExpirationDate(value);
    }

    private static ensureIsFuture(value: Date): void {
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
