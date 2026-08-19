import type { PasswordHasher } from "../../interfaces";
import { Password, PasswordHash } from "../../value-objects";
import { EmailPasswordAuthenticationStrategy } from "./index";

describe("EmailPasswordAuthenticationStrategy", () => {
    const password = Password.create("password-valid-123");
    const passwordHash = PasswordHash.create("hashed-password");

    const createPasswordHasher = (compare: jest.MockedFunction<PasswordHasher["compare"]>): PasswordHasher => ({
        hash: jest.fn(),
        compare,
    });

    it("should return authenticated true when credentials are valid", async () => {
        const compare = jest.fn().mockResolvedValue(true);
        const passwordHasher = createPasswordHasher(compare);
        const strategy = new EmailPasswordAuthenticationStrategy(passwordHasher);
        const result = await strategy.authenticate({
            provider: "email-password",
            credentials: { password, passwordHash },
        });
        expect(result).toEqual({ authenticated: true });
        expect(compare).toHaveBeenCalledWith(password, passwordHash);
    });

    it("should return authenticated false when credentials are invalid", async () => {
        const compare = jest.fn().mockResolvedValue(false);
        const passwordHasher = createPasswordHasher(compare);
        const strategy = new EmailPasswordAuthenticationStrategy(passwordHasher);
        const result = await strategy.authenticate({
            provider: "email-password",
            credentials: { password, passwordHash },
        });
        expect(result).toEqual({ authenticated: false });
        expect(compare).toHaveBeenCalledWith(password, passwordHash);
    });

    it("should delegate password verification to PasswordHasher", async () => {
        const compare = jest.fn().mockResolvedValue(true);
        const passwordHasher = createPasswordHasher(compare);
        const strategy = new EmailPasswordAuthenticationStrategy(passwordHasher);
        await strategy.authenticate({ provider: "email-password", credentials: { password, passwordHash } });
        expect(compare).toHaveBeenCalledTimes(1);
        expect(compare).toHaveBeenCalledWith(password, passwordHash);
    });
});
