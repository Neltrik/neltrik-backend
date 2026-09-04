import * as bcrypt from "bcrypt";

import { PasswordHasher } from "./index";

describe("PasswordHasher", () => {
    const makeSut = () => {
        return new PasswordHasher();
    };

    describe("hash", () => {
        it("should hash a password", async () => {
            const sut = makeSut();
            const password = "my-secure-password";
            const hash = await sut.hash(password);
            expect(hash).toBeDefined();
            expect(typeof hash).toBe("string");
            expect(hash).not.toBe(password);
        });

        it("should generate a valid bcrypt hash", async () => {
            const sut = makeSut();
            const hash = await sut.hash("my-secure-password");
            expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
            await expect(bcrypt.compare("my-secure-password", hash)).resolves.toBe(true);
        });

        it("should generate different hashes for the same password", async () => {
            const sut = makeSut();
            const password = "my-secure-password";
            const firstHash = await sut.hash(password);
            const secondHash = await sut.hash(password);
            expect(firstHash).not.toBe(secondHash);
        });

        it("should not return the original password as the hash", async () => {
            const sut = makeSut();
            const password = "my-secure-password";
            const hash = await sut.hash(password);
            expect(hash).not.toBe(password);
        });
    });

    describe("compare", () => {
        it("should return true when the password matches the hash", async () => {
            const sut = makeSut();
            const password = "my-secure-password";
            const hash = await sut.hash(password);
            await expect(sut.compare(password, hash)).resolves.toBe(true);
        });

        it("should return false when the password does not match the hash", async () => {
            const sut = makeSut();
            const hash = await sut.hash("my-secure-password");
            await expect(sut.compare("wrong-password", hash)).resolves.toBe(false);
        });

        it("should return false when comparing a password with a different hash", async () => {
            const sut = makeSut();
            const firstHash = await sut.hash("first-password");
            const secondHash = await sut.hash("second-password");
            await expect(sut.compare("first-password", secondHash)).resolves.toBe(false);
            await expect(sut.compare("second-password", firstHash)).resolves.toBe(false);
        });

        it("should return true when comparing the same password against its hash", async () => {
            const sut = makeSut();
            const password = "another-secure-password";
            const hash = await sut.hash(password);
            const result = await sut.compare(password, hash);
            expect(result).toBe(true);
        });
    });
});
