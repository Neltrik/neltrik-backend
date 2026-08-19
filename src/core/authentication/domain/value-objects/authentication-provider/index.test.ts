import { AuthenticationProviderTooLongError, EmptyAuthenticationProviderError } from "../../errors";
import { AuthenticationProvider } from "./index";

describe("AuthenticationProvider", () => {
    it("should create a valid authentication provider", () => {
        const provider = AuthenticationProvider.create("email-password");
        expect(provider.value).toBe("email-password");
    });

    it("should trim leading and trailing spaces", () => {
        const provider = AuthenticationProvider.create("   email-password   ");
        expect(provider.value).toBe("email-password");
    });

    it("should throw EmptyAuthenticationProviderError when provider is empty", () => {
        expect(() => AuthenticationProvider.create("")).toThrow(EmptyAuthenticationProviderError);
    });

    it("should throw EmptyAuthenticationProviderError when provider contains only spaces", () => {
        expect(() => AuthenticationProvider.create("     ")).toThrow(EmptyAuthenticationProviderError);
    });

    it("should throw AuthenticationProviderTooLongError when provider exceeds 100 characters", () => {
        const longProvider = "A".repeat(101);
        expect(() => AuthenticationProvider.create(longProvider)).toThrow(AuthenticationProviderTooLongError);
    });

    it("should allow providers other than email-password", () => {
        const provider = AuthenticationProvider.create("google");
        expect(provider.value).toBe("google");
    });

    it("should return true when comparing equal authentication providers", () => {
        const provider1 = AuthenticationProvider.create("email-password");
        const provider2 = AuthenticationProvider.create("email-password");
        expect(provider1.equals(provider2)).toBe(true);
    });

    it("should return false when comparing different authentication providers", () => {
        const provider1 = AuthenticationProvider.create("email-password");
        const provider2 = AuthenticationProvider.create("google");
        expect(provider1.equals(provider2)).toBe(false);
    });
});
