import { DomainError } from "../../exceptions";
import { DomainExceptionHandlingStrategy } from "./index";

class TestDomainError extends DomainError {
    public constructor() {
        super("TEST_DOMAIN_ERROR", "Test domain error");
    }
}

describe("DomainExceptionHandlingStrategy", () => {
    const makeSut = () => {
        return new DomainExceptionHandlingStrategy();
    };

    describe("supports", () => {
        it("should support domain errors", () => {
            const strategy = makeSut();
            const error = new TestDomainError();
            const result = strategy.supports(error);
            expect(result).toBe(true);
        });

        it("should not support non domain errors", () => {
            const strategy = makeSut();
            const error = new Error("Unexpected error");
            const result = strategy.supports(error);
            expect(result).toBe(false);
        });
    });

    describe("handle", () => {
        it("should return the domain error details", () => {
            const strategy = makeSut();
            const error = new TestDomainError();
            const result = strategy.handle(error);
            expect(result).toEqual([{ code: "Test domain error", message: "TEST_DOMAIN_ERROR" }]);
        });
    });
});
