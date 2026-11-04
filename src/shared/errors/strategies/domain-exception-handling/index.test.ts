import { DomainError } from "../../exceptions";
import { DomainExceptionHandlingStrategy } from "./index";

class TestDomainError extends DomainError {
    public constructor() {
        super("TEST_DOMAIN_ERROR", "Test domain error");
    }
}

class TestDomainErrorWithDetails extends DomainError {
    public constructor() {
        super("TEST_DOMAIN_ERROR", "Test domain error", [
            { code: "DETAIL_ERROR_1", message: "First detail" },
            { code: "DETAIL_ERROR_2", message: "Second detail" },
        ]);
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

        it("should return the domain error details when details are provided", () => {
            const strategy = makeSut();
            const error = new TestDomainErrorWithDetails();
            const result = strategy.handle(error);
            expect(result).toEqual([
                { code: "Test domain error", message: "TEST_DOMAIN_ERROR" },
                { code: "DETAIL_ERROR_1", message: "First detail" },
                { code: "DETAIL_ERROR_2", message: "Second detail" },
            ]);
        });
    });
});
