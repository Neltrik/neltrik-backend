import { EmptyPasswordHashError } from "../../errors";

export class PasswordHash {
    private constructor(private readonly passwordHash: string) {}

    public static create(value: string): PasswordHash {
        const normalizedValue = value.trim();
        this.ensureIsNotEmpty(normalizedValue);
        return new PasswordHash(normalizedValue);
    }

    private static ensureIsNotEmpty(value: string): void {
        if (value === "") {
            throw new EmptyPasswordHashError();
        }
    }

    public get value(): string {
        return this.passwordHash;
    }

    public equals(other: PasswordHash): boolean {
        return this.passwordHash === other.passwordHash;
    }
}
