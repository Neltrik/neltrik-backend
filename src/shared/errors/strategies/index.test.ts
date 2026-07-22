import { DomainError } from "../exceptions";
import { DomainExceptionHandlingStrategy } from "./";

class FakeDomainError extends DomainError {
    constructor() {
        super("Invalid title.", "INVALID_TITLE");
    }
}

describe("DomainExceptionHandlingStrategy", () => {
    const makeSut = () => {
        return new DomainExceptionHandlingStrategy();
    };

    it("should not support non domain errors", () => {
        const strategy = makeSut();
        const result = strategy.supports(new Error("Unexpected error"));
        expect(result).toBe(false);
    });

    it("should return the error details", () => {
        const strategy = makeSut();
        const error = new FakeDomainError();
        const result = strategy.handle(error);
        expect(result).toEqual([
            {
                code: "INVALID_TITLE",
                message: "Invalid title.",
            },
        ]);
    });
});
