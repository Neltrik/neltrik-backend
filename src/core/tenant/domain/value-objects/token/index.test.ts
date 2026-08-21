import { EmptyTokenError, InvalidTokenFormatError } from "../../errors/invitation";
import { Token } from "./";

describe("Token", () => {
    describe("create", () => {
        it("should create a valid Token with a valid UUID", () => {
            const token = Token.create("123e4567-e89b-12d3-a456-426614174000");
            expect(token).toBeInstanceOf(Token);
            expect(token.value).toBe("123e4567-e89b-12d3-a456-426614174000");
        });

        it("should trim whitespace from the value", () => {
            const token = Token.create("  123e4567-e89b-12d3-a456-426614174000  ");
            expect(token.value).toBe("123e4567-e89b-12d3-a456-426614174000");
        });

        it("should throw EmptyTokenError when value is an empty string", () => {
            expect(() => Token.create("")).toThrow(EmptyTokenError);
        });

        it("should throw EmptyTokenError when value contains only whitespace", () => {
            expect(() => Token.create("   ")).toThrow(EmptyTokenError);
        });

        it("should throw InvalidTokenFormatError when value is not a valid UUID", () => {
            expect(() => Token.create("invalid")).toThrow(InvalidTokenFormatError);
            expect(() => Token.create("123")).toThrow(InvalidTokenFormatError);
            expect(() => Token.create("123e4567-e89b-12d3-a456")).toThrow(InvalidTokenFormatError);
        });
    });

    describe("equals", () => {
        it("should return true when two Tokens have the same value", () => {
            const token1 = Token.create("123e4567-e89b-12d3-a456-426614174000");
            const token2 = Token.create("123e4567-e89b-12d3-a456-426614174000");
            expect(token1.equals(token2)).toBe(true);
        });

        it("should return false when two Tokens have different values", () => {
            const token1 = Token.create("123e4567-e89b-12d3-a456-426614174000");
            const token2 = Token.create("987fcdeb-51a2-43d7-9b8c-426614174000");
            expect(token1.equals(token2)).toBe(false);
        });
    });

    describe("value getter", () => {
        it("should return the raw value", () => {
            const token = Token.create("123e4567-e89b-12d3-a456-426614174000");
            expect(token.value).toBe("123e4567-e89b-12d3-a456-426614174000");
        });
    });
});
