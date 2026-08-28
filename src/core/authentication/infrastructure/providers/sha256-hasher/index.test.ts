import { Sha256Hasher } from "./index";

describe("Sha256Hasher", () => {
    const makeSut = () => {
        const sut = new Sha256Hasher();
        return { sut };
    };

    describe("hash", () => {
        it("should hash a value using SHA-256", () => {
            const { sut } = makeSut();
            const result = sut.hash("hello");
            expect(result).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
        });

        it("should return a hexadecimal string", () => {
            const { sut } = makeSut();
            const result = sut.hash("value");
            expect(result).toEqual(expect.any(String));
            expect(result).toMatch(/^[a-f0-9]{64}$/);
        });

        it("should return the same hash for the same value", () => {
            const { sut } = makeSut();
            const firstHash = sut.hash("same-value");
            const secondHash = sut.hash("same-value");
            expect(firstHash).toBe(secondHash);
        });

        it("should return different hashes for different values", () => {
            const { sut } = makeSut();
            const firstHash = sut.hash("first-value");
            const secondHash = sut.hash("second-value");
            expect(firstHash).not.toBe(secondHash);
        });

        it("should hash an empty string", () => {
            const { sut } = makeSut();
            const result = sut.hash("");
            expect(result).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
        });

        it("should be sensitive to case", () => {
            const { sut } = makeSut();
            const lowercaseHash = sut.hash("password");
            const uppercaseHash = sut.hash("Password");
            expect(lowercaseHash).not.toBe(uppercaseHash);
        });

        it("should produce different hashes when whitespace changes", () => {
            const { sut } = makeSut();
            const hashWithoutWhitespace = sut.hash("value");
            const hashWithWhitespace = sut.hash(" value ");
            expect(hashWithoutWhitespace).not.toBe(hashWithWhitespace);
        });
    });
});
