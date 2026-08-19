import { EmptyPasswordError, PasswordTooLongError, PasswordTooShortError } from "../../errors/password";
import { Password } from "./index";

describe("Password", () => {
    it("should create a valid password", () => {
        const password = Password.create("Password1234567");
        expect(password.value).toBe("Password1234567");
    });

    it("should throw EmptyPasswordError when password is empty", () => {
        expect(() => Password.create("")).toThrow(EmptyPasswordError);
    });

    it("should throw PasswordTooShortError when password has less than 15 characters", () => {
        const shortPassword = "Password12345";
        expect(shortPassword.length).toBe(13);
        expect(() => Password.create(shortPassword)).toThrow(PasswordTooShortError);
    });

    it("should accept a password with exactly 15 characters", () => {
        const passwordValue = "Password1234567";
        expect(passwordValue.length).toBe(15);
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

    it("should preserve leading and trailing spaces", () => {
        const passwordValue = "  Password1234567  ";
        const password = Password.create(passwordValue);
        expect(password.value).toBe(passwordValue);
    });

    it("should preserve uppercase and lowercase characters", () => {
        const passwordValue = "PaSsWoRd1234567";
        const password = Password.create(passwordValue);
        expect(password.value).toBe(passwordValue);
    });

    it("should return true when comparing equal passwords", () => {
        const password1 = Password.create("Password1234567");
        const password2 = Password.create("Password1234567");
        expect(password1.equals(password2)).toBe(true);
    });

    it("should return false when comparing different passwords", () => {
        const password1 = Password.create("Password1234567");
        const password2 = Password.create("Password1234578");
        expect(password1.equals(password2)).toBe(false);
    });
});
