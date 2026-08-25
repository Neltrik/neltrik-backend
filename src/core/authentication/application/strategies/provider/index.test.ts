import { isEmailPasswordCredentials } from "./index";

describe("isEmailPasswordCredentials", () => {
    it("should return true when credentials have a valid password", () => {
        const credentials = { password: "Password123" };
        expect(isEmailPasswordCredentials(credentials)).toBe(true);
    });

    it("should return false when password is empty", () => {
        const credentials = { password: "" };
        expect(isEmailPasswordCredentials(credentials)).toBe(false);
    });

    it("should return false when password is not a string", () => {
        const credentials = { password: 123456 };
        expect(isEmailPasswordCredentials(credentials)).toBe(false);
    });

    it("should return false when credentials do not contain a password", () => {
        const credentials = { email: "john@company.com" };
        expect(isEmailPasswordCredentials(credentials)).toBe(false);
    });

    it("should return false when credentials are null", () => {
        expect(isEmailPasswordCredentials(null)).toBe(false);
    });

    it("should return false when credentials are undefined", () => {
        expect(isEmailPasswordCredentials(undefined)).toBe(false);
    });

    it("should return false when credentials are a primitive value", () => {
        expect(isEmailPasswordCredentials("Password123")).toBe(false);
        expect(isEmailPasswordCredentials(123)).toBe(false);
        expect(isEmailPasswordCredentials(true)).toBe(false);
    });
});
