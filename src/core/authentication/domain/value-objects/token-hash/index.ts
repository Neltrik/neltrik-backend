import { createHash, randomBytes } from "crypto";

import { InvalidTokenHashError } from "../../errors";

export class TokenHash {
    private constructor(private readonly hash: string) {}

    public static create(value: string): TokenHash {
        this.ensureIsValidHash(value);
        return new TokenHash(value);
    }

    public static generate(): { token: string; hash: TokenHash } {
        const token = randomBytes(32).toString("hex");
        const hash = createHash("sha256").update(token).digest("hex");
        return { token, hash: new TokenHash(hash) };
    }

    private static ensureIsValidHash(value: string): void {
        if (!value || value.length === 0) {
            throw new InvalidTokenHashError();
        }
        const sha256Regex = /^[a-f0-9]{64}$/;
        if (!sha256Regex.test(value)) {
            throw new InvalidTokenHashError();
        }
    }

    public get value(): string {
        return this.hash;
    }

    public equals(other: TokenHash): boolean {
        return this.hash === other.hash;
    }

    public verify(token: string): boolean {
        const computedHash = createHash("sha256").update(token).digest("hex");
        return this.hash === computedHash;
    }
}
