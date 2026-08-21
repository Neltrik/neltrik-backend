import { EmptyTokenError, InvalidTokenFormatError } from "../../errors/invitation";

export class Token {
    private static readonly TOKEN_REGEX = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

    private constructor(private readonly token: string) {}

    public static create(value: string): Token {
        const normalizedValue = value.trim();
        this.ensureIsNotEmpty(normalizedValue);
        this.ensureIsValid(normalizedValue);
        return new Token(normalizedValue);
    }

    private static ensureIsNotEmpty(value: string): void {
        if (value === "") {
            throw new EmptyTokenError();
        }
    }

    private static ensureIsValid(value: string): void {
        if (!this.TOKEN_REGEX.test(value)) {
            throw new InvalidTokenFormatError();
        }
    }

    public get value(): string {
        return this.token;
    }

    public equals(other: Token): boolean {
        return this.token === other.token;
    }
}
