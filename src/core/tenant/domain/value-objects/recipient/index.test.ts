import { EmptyRecipientError, InvalidRecipientError } from "../../errors/invitation";
import { Recipient } from "./";

describe("Recipient", () => {
    describe("create", () => {
        it("should create a valid Recipient with a valid email", () => {
            const recipient = Recipient.create("test@example.com");
            expect(recipient).toBeInstanceOf(Recipient);
            expect(recipient.value).toBe("test@example.com");
        });

        it("should create a valid Recipient with a valid phone number", () => {
            const recipient = Recipient.create("+573001234567");
            expect(recipient).toBeInstanceOf(Recipient);
            expect(recipient.value).toBe("+573001234567");
        });

        it("should trim whitespace from the value", () => {
            const recipient = Recipient.create("  test@example.com  ");
            expect(recipient.value).toBe("test@example.com");
        });

        it("should throw EmptyRecipientError when value is an empty string", () => {
            expect(() => Recipient.create("")).toThrow(EmptyRecipientError);
        });

        it("should throw EmptyRecipientError when value contains only whitespace", () => {
            expect(() => Recipient.create("   ")).toThrow(EmptyRecipientError);
        });

        it("should throw InvalidRecipientError when value is not a valid email or phone", () => {
            expect(() => Recipient.create("invalid")).toThrow(InvalidRecipientError);
            expect(() => Recipient.create("test@")).toThrow(InvalidRecipientError);
            expect(() => Recipient.create("@example.com")).toThrow(InvalidRecipientError);
            expect(() => Recipient.create("123")).toThrow(InvalidRecipientError);
            expect(() => Recipient.create("+57300abc")).toThrow(InvalidRecipientError);
        });
    });

    describe("equals", () => {
        it("should return true when two Recipients have the same value", () => {
            const recipient1 = Recipient.create("test@example.com");
            const recipient2 = Recipient.create("test@example.com");
            expect(recipient1.equals(recipient2)).toBe(true);
        });

        it("should return false when two Recipients have different values", () => {
            const recipient1 = Recipient.create("test@example.com");
            const recipient2 = Recipient.create("other@example.com");
            expect(recipient1.equals(recipient2)).toBe(false);
        });
    });

    describe("value getter", () => {
        it("should return the raw value", () => {
            const recipient = Recipient.create("test@example.com");
            expect(recipient.value).toBe("test@example.com");
        });
    });
});
