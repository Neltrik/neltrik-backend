import { PasswordTooLongError, PasswordTooShortError } from "../../errors";
import { Password } from "./index";

describe("Password", () => {
    it("should create a valid password", () => {
        const password = Password.create("Password123");
        expect(password.value).toBe("Password123");
    });

    it("should throw PasswordTooShortError when password has less than 8 characters", () => {
        const shortPassword = "Pass123";
        expect(shortPassword.length).toBe(7);
        expect(() => Password.create(shortPassword)).toThrow(PasswordTooShortError);
    });

    it("should accept a password with exactly 8 characters", () => {
        const passwordValue = "Pass1234";
        expect(passwordValue.length).toBe(8);
        expect(Password.create(passwordValue).value).toBe(passwordValue);
    });

    it("should accept a password with exactly 64 characters", () => {
        const passwordValue = "A".repeat(64);
        expect(passwordValue.length).toBe(64);
        expect(Password.create(passwordValue).value).toBe(passwordValue);
    });

    it("should throw PasswordTooLongError when password exceeds 64 characters", () => {
        const longPassword = "A".repeat(65);
        expect(longPassword.length).toBe(65);
        expect(() => Password.create(longPassword)).toThrow(PasswordTooLongError);
    });

    it("should trim leading and trailing spaces", () => {
        const passwordValue = "  Password123  ";
        const password = Password.create(passwordValue);
        expect(password.value).toBe("Password123");
    });

    it("should preserve uppercase and lowercase characters", () => {
        const passwordValue = "PaSsWoRd123";
        const password = Password.create(passwordValue);
        expect(password.value).toBe(passwordValue);
    });

    it("should return true when comparing equal passwords", () => {
        const password1 = Password.create("Password123");
        const password2 = Password.create("Password123");
        expect(password1.equals(password2)).toBe(true);
    });

    it("should return false when comparing different passwords", () => {
        const password1 = Password.create("Password123");
        const password2 = Password.create("Password124");
        expect(password1.equals(password2)).toBe(false);
    });
});
