import { UnsupportedProviderError } from "../../../../domain/errors";
import { EmailPasswordProviderStrategy } from "../email-password";
import { ProviderAuthenticationStrategyFactory } from "./index";

describe("ProviderAuthenticationStrategyFactory", () => {
    const makeSut = () => {
        const emailPasswordStrategy = new EmailPasswordProviderStrategy();
        const factory = new ProviderAuthenticationStrategyFactory(emailPasswordStrategy);
        return { factory, emailPasswordStrategy };
    };

    it("should return the email password strategy for email-password provider", () => {
        const { factory, emailPasswordStrategy } = makeSut();
        const result = factory.create("email-password");
        expect(result).toBe(emailPasswordStrategy);
    });

    it("should throw UnsupportedProviderError for unsupported provider", () => {
        const { factory } = makeSut();
        expect(() => factory.create("google")).toThrow(UnsupportedProviderError);
    });

    it("should throw UnsupportedProviderError for empty provider", () => {
        const { factory } = makeSut();
        expect(() => factory.create("")).toThrow(UnsupportedProviderError);
    });
});
