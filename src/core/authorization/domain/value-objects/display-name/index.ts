import { DisplayNameTooLongError, EmptyDisplayNameError } from "../../errors";

export class DisplayName {
    private constructor(private readonly displayName: string) {}

    public static create(value: string): DisplayName {
        const normalizedValue = value.trim();
        DisplayName.ensureIsNotEmpty(normalizedValue);
        DisplayName.ensureMaxLength(normalizedValue);
        return new DisplayName(normalizedValue);
    }

    private static ensureIsNotEmpty(value: string): void {
        if (value === "") {
            throw new EmptyDisplayNameError();
        }
    }

    private static ensureMaxLength(value: string): void {
        if (value.length > 100) {
            throw new DisplayNameTooLongError();
        }
    }

    public get value(): string {
        return this.displayName;
    }

    public equals(other: DisplayName): boolean {
        return this.displayName === other.displayName;
    }
}
