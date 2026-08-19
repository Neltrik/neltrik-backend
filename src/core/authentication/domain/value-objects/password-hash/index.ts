import { EmptyPasswordHashError } from "../../errors";

export class PasswordHash {
    private constructor(private readonly hash: string) {}

    public static create(value: string): PasswordHash {
        this.ensureIsNotEmpty(value);
        return new PasswordHash(value);
    }

    private static ensureIsNotEmpty(value: string): void {
        if (value === "") {
            throw new EmptyPasswordHashError();
        }
    }

    public get value(): string {
        return this.hash;
    }

    public equals(other: PasswordHash): boolean {
        return this.hash === other.hash;
    }
}
