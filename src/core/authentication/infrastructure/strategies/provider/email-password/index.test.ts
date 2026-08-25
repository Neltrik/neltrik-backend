import { AuthenticationAccount } from "../../../../domain/entities";
import { PasswordHash } from "../../../../domain/value-objects";
import { EmailPasswordProviderStrategy } from "./index";

const compareMock = jest.fn<Promise<boolean>, [string, string]>();
const hashMock = jest.fn<Promise<string>, [string, number]>();

jest.mock("bcrypt", () => ({
    compare: (...args: [string, string]) => compareMock(...args),
    hash: (...args: [string, number]) => hashMock(...args),
}));

describe("EmailPasswordProviderStrategy", () => {
    const makeSut = () => {
        const strategy = new EmailPasswordProviderStrategy();
        return { strategy };
    };

    const createAccount = (passwordHash: string | null = "hashed-password") => {
        return AuthenticationAccount.restore({
            id: "authentication-account-id",
            userId: "user-id",
            provider: "email-password",
            email: "omar@gmail.com",
            emailVerified: false,
            passwordHash: passwordHash ? PasswordHash.create(passwordHash) : null,
            createdAt: new Date("2025-01-01T00:00:00.000Z"),
            updatedAt: new Date("2025-01-01T00:00:00.000Z"),
        });
    };

    beforeEach(() => {
        compareMock.mockReset();
        hashMock.mockReset();
    });

    describe("authenticate", () => {
        it("should authenticate successfully with valid credentials", async () => {
            const { strategy } = makeSut();
            const account = createAccount();
            compareMock.mockResolvedValue(true);
            const result = await strategy.authenticate(account, { email: "omar@gmail.com", password: "Password123" });
            expect(result).toEqual({ id: account.userId, email: account.email });
            expect(compareMock).toHaveBeenCalledWith("Password123", account.passwordHash?.value);
        });

        it("should return null when credentials are invalid", async () => {
            const { strategy } = makeSut();
            const account = createAccount();
            const result = await strategy.authenticate(account, { email: "omar@gmail.com" });
            expect(result).toBeNull();
            expect(compareMock).not.toHaveBeenCalled();
        });

        it("should return null when account has no password hash", async () => {
            const { strategy } = makeSut();
            const account = createAccount(null);
            const result = await strategy.authenticate(account, {
                email: "omar@gmail.com",
                password: "Password123",
            });
            expect(result).toBeNull();
            expect(compareMock).not.toHaveBeenCalled();
        });

        it("should return null when password is incorrect", async () => {
            const { strategy } = makeSut();
            const account = createAccount();
            compareMock.mockResolvedValue(false);
            const result = await strategy.authenticate(account, { email: "omar@gmail.com", password: "WrongPassword" });
            expect(result).toBeNull();
            expect(compareMock).toHaveBeenCalledWith("WrongPassword", account.passwordHash?.value);
        });
    });

    describe("register", () => {
        it("should register an account with valid credentials", async () => {
            const { strategy } = makeSut();
            hashMock.mockResolvedValue("hashed-password");
            const result = await strategy.register("user-id", "omar@gmail.com", {
                email: "omar@gmail.com",
                password: "Password123",
            });
            expect(result).toEqual({
                passwordHash: "hashed-password",
                emailVerified: false,
                profile: { id: "user-id", email: "omar@gmail.com" },
            });
            expect(hashMock).toHaveBeenCalledWith("Password123", 10);
        });

        it("should throw an error when credentials are invalid", async () => {
            const { strategy } = makeSut();
            await expect(strategy.register("user-id", "omar@gmail.com", { email: "omar@gmail.com" })).rejects.toThrow(
                "Invalid credentials",
            );
            expect(hashMock).not.toHaveBeenCalled();
        });

        it("should mark the email as unverified when registering", async () => {
            const { strategy } = makeSut();
            hashMock.mockResolvedValue("hashed-password");
            const result = await strategy.register("user-id", "omar@gmail.com", {
                email: "omar@gmail.com",
                password: "Password123",
            });
            expect(result.emailVerified).toBe(false);
        });

        it("should return the user profile when registering", async () => {
            const { strategy } = makeSut();
            hashMock.mockResolvedValue("hashed-password");
            const result = await strategy.register("user-id", "omar@gmail.com", {
                email: "omar@gmail.com",
                password: "Password123",
            });
            expect(result.profile).toEqual({ id: "user-id", email: "omar@gmail.com" });
        });
    });
});
