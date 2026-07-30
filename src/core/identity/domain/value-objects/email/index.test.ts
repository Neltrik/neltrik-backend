import { InvalidEmailError } from "../../errors";
import { Email } from "./index";

describe("Email", () => {
    it("should create a valid email", () => {
        const email = Email.create("omar@gmail.com");
        expect(email.value).toBe("omar@gmail.com");
    });

    it("should normalize email to lowercase", () => {
        const email = Email.create("OMAR@GMAIL.COM");
        expect(email.value).toBe("omar@gmail.com");
    });

    it("should trim leading and trailing spaces", () => {
        const email = Email.create("   omar@gmail.com   ");
        expect(email.value).toBe("omar@gmail.com");
    });

    it("should throw InvalidEmailError when email is empty", () => {
        expect(() => Email.create("")).toThrow(InvalidEmailError);
    });

    it("should throw InvalidEmailError when email contains only spaces", () => {
        expect(() => Email.create("     ")).toThrow(InvalidEmailError);
    });

    it("should throw InvalidEmailError when email format is invalid", () => {
        expect(() => Email.create("invalid-email")).toThrow(InvalidEmailError);
    });

    it("should return true when comparing equal emails", () => {
        const email1 = Email.create("OMAR@GMAIL.COM");
        const email2 = Email.create("omar@gmail.com");
        expect(email1.equals(email2)).toBe(true);
    });

    it("should return false when comparing different emails", () => {
        const email1 = Email.create("omar@gmail.com");
        const email2 = Email.create("john@gmail.com");
        expect(email1.equals(email2)).toBe(false);
    });
});
