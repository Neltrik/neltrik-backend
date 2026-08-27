import { ExpirationDateInPastError } from "../../errors";
import { ExpirationDate } from "./index";

describe("ExpirationDate", () => {
    it("should create a valid expiration date in the future", () => {
        const expirationDate = new Date(Date.now() + 60_000);
        const result = ExpirationDate.create(expirationDate);
        expect(result.value).toBe(expirationDate);
    });

    it("should throw ExpirationDateInPastError when expiration date is in the past", () => {
        const expirationDate = new Date(Date.now() - 60_000);
        expect(() => ExpirationDate.create(expirationDate)).toThrow(ExpirationDateInPastError);
    });

    it("should throw ExpirationDateInPastError when expiration date is exactly now", () => {
        const now = new Date();
        expect(() => ExpirationDate.create(now)).toThrow(ExpirationDateInPastError);
    });

    it("should return the original expiration date through value", () => {
        const expirationDate = new Date(Date.now() + 60_000);
        const result = ExpirationDate.create(expirationDate);
        expect(result.value).toBe(expirationDate);
    });

    it("should return false when expiration date is in the future", () => {
        const expirationDate = new Date(Date.now() + 60_000);
        const result = ExpirationDate.create(expirationDate);
        expect(result.isExpired()).toBe(false);
    });

    it("should return true when expiration date has passed", () => {
        const expirationDate = new Date(Date.now() + 10);
        const result = ExpirationDate.create(expirationDate);
        jest.useFakeTimers();
        jest.setSystemTime(new Date(expirationDate.getTime() + 1));
        expect(result.isExpired()).toBe(true);
        jest.useRealTimers();
    });

    it("should return true when expiration date is exactly now", () => {
        const expirationDate = new Date(Date.now() + 60_000);
        const result = ExpirationDate.create(expirationDate);
        jest.useFakeTimers();
        jest.setSystemTime(expirationDate);
        expect(result.isExpired()).toBe(true);
        jest.useRealTimers();
    });

    it("should return true when comparing equal expiration dates", () => {
        const expirationDate = new Date(Date.now() + 60_000);
        const expirationDate1 = ExpirationDate.create(expirationDate);
        const expirationDate2 = ExpirationDate.create(new Date(expirationDate.getTime()));
        expect(expirationDate1.equals(expirationDate2)).toBe(true);
    });

    it("should return false when comparing different expiration dates", () => {
        const expirationDate1 = ExpirationDate.create(new Date(Date.now() + 60_000));
        const expirationDate2 = ExpirationDate.create(new Date(Date.now() + 120_000));
        expect(expirationDate1.equals(expirationDate2)).toBe(false);
    });
});
