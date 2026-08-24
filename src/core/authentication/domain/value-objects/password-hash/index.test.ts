import { EmptyPasswordHashError } from "../../errors";
import { PasswordHash } from "./index";

describe("PasswordHash", () => {
    it("should create a valid password hash", () => {
        const passwordHash = PasswordHash.create("hashed-password-value");
        expect(passwordHash.value).toBe("hashed-password-value");
    });

    it("should throw EmptyPasswordHashError when password hash is empty", () => {
        expect(() => PasswordHash.create("")).toThrow(EmptyPasswordHashError);
    });

    it("should throw EmptyPasswordHashError when password hash contains only spaces", () => {
        expect(() => PasswordHash.create("   ")).toThrow(EmptyPasswordHashError);
    });

    it("should trim leading and trailing spaces", () => {
        const passwordHashValue = "  hashed-password-value  ";
        const passwordHash = PasswordHash.create(passwordHashValue);
        expect(passwordHash.value).toBe("hashed-password-value");
    });

    it("should preserve the password hash characters", () => {
        const passwordHashValue = "AbC123!@#xyz";
        const passwordHash = PasswordHash.create(passwordHashValue);
        expect(passwordHash.value).toBe(passwordHashValue);
    });

    it("should return true when comparing equal password hashes", () => {
        const passwordHash1 = PasswordHash.create("hashed-password-value");
        const passwordHash2 = PasswordHash.create("hashed-password-value");
        expect(passwordHash1.equals(passwordHash2)).toBe(true);
    });

    it("should return false when comparing different password hashes", () => {
        const passwordHash1 = PasswordHash.create("hashed-password-value");
        const passwordHash2 = PasswordHash.create("different-hash-value");
        expect(passwordHash1.equals(passwordHash2)).toBe(false);
    });
});
