import { ExpirationDateInPastError, InvalidExpirationDateError } from "../../errors/invitation";
import { ExpirationDate } from "./";

describe("ExpirationDate", () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    describe("create", () => {
        it("should create a valid ExpirationDate with a future date", () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 7);
            const expirationDate = ExpirationDate.create(futureDate);
            expect(expirationDate).toBeInstanceOf(ExpirationDate);
            expect(expirationDate.value).toBe(futureDate);
        });

        it("should throw InvalidExpirationDateError when value is not a valid date", () => {
            expect(() => ExpirationDate.create(null as unknown as Date)).toThrow(InvalidExpirationDateError);
            expect(() => ExpirationDate.create("invalid" as unknown as Date)).toThrow(InvalidExpirationDateError);
            expect(() => ExpirationDate.create(new Date("invalid"))).toThrow(InvalidExpirationDateError);
        });

        it("should throw ExpirationDateInPastError when value is a past date", () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            expect(() => ExpirationDate.create(pastDate)).toThrow(ExpirationDateInPastError);
        });

        it("should throw ExpirationDateInPastError when value is today's date", () => {
            const today = new Date();
            expect(() => ExpirationDate.create(today)).toThrow(ExpirationDateInPastError);
        });
    });

    describe("isExpired", () => {
        it("should return true when the expiration date has passed", () => {
            jest.useFakeTimers();
            const now = new Date("2026-08-20T00:00:00.000Z");
            const futureDate = new Date("2026-08-21T00:00:00.000Z");
            jest.setSystemTime(now);
            const expirationDate = ExpirationDate.create(futureDate);
            jest.setSystemTime(new Date("2026-08-22T00:00:00.000Z"));
            expect(expirationDate.isExpired()).toBe(true);
        });

        it("should return false when date is in the future", () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 7);
            const expirationDate = ExpirationDate.create(futureDate);
            expect(expirationDate.isExpired()).toBe(false);
        });
    });

    describe("equals", () => {
        it("should return true when two ExpirationDates have the same date", () => {
            const date = new Date();
            date.setDate(date.getDate() + 7);
            const expirationDate1 = ExpirationDate.create(date);
            const expirationDate2 = ExpirationDate.create(date);
            expect(expirationDate1.equals(expirationDate2)).toBe(true);
        });

        it("should return false when two ExpirationDates have different dates", () => {
            const date1 = new Date();
            date1.setDate(date1.getDate() + 7);
            const date2 = new Date();
            date2.setDate(date2.getDate() + 14);
            const expirationDate1 = ExpirationDate.create(date1);
            const expirationDate2 = ExpirationDate.create(date2);
            expect(expirationDate1.equals(expirationDate2)).toBe(false);
        });
    });

    describe("value getter", () => {
        it("should return the raw Date value", () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 7);
            const expirationDate = ExpirationDate.create(futureDate);
            expect(expirationDate.value).toBe(futureDate);
        });
    });
});
