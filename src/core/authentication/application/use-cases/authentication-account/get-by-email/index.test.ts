import { AuthenticationAccount } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError } from "../../../../domain/errors";
import { AuthenticationProvider, PasswordHash } from "../../../../domain/value-objects";
import { AuthenticationAccountRepositorySpy } from "../../../../test-doubles";
import { GetAuthenticationAccountByEmailUseCase } from "./index";

describe("GetAuthenticationAccountByEmailUseCase", () => {
    const makeSut = () => {
        const authenticationAccountRepository = new AuthenticationAccountRepositorySpy();
        const account = AuthenticationAccount.create({
            id: "authentication-account-id",
            userId: "user-id",
            provider: AuthenticationProvider.create("email-password"),
            email: "foo@example.com",
            passwordHash: PasswordHash.create("hashed-password"),
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        });
        authenticationAccountRepository.findByEmail.mockResolvedValue(account);
        const useCase = new GetAuthenticationAccountByEmailUseCase(authenticationAccountRepository);
        return { useCase, authenticationAccountRepository, account };
    };

    it("should get an authentication account successfully", async () => {
        const { useCase, authenticationAccountRepository, account } = makeSut();
        const result = await useCase.execute("foo@example.com");
        expect(authenticationAccountRepository.findByEmail).toHaveBeenCalledTimes(1);
        expect(authenticationAccountRepository.findByEmail).toHaveBeenCalledWith("foo@example.com");
        expect(result).toEqual({
            id: account.id,
            userId: account.userId,
            provider: account.provider.value,
            email: account.email,
            emailVerified: account.emailVerified,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
        });
    });

    it("should throw AuthenticationAccountNotFoundError when the account does not exist", async () => {
        const { useCase, authenticationAccountRepository } = makeSut();
        authenticationAccountRepository.findByEmail.mockResolvedValue(null);
        await expect(useCase.execute("foo@example.com")).rejects.toThrow(AuthenticationAccountNotFoundError);
    });

    it("should propagate repository errors", async () => {
        const { useCase, authenticationAccountRepository } = makeSut();
        authenticationAccountRepository.findByEmail.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("foo@example.com")).rejects.toThrow("Database error");
    });
});
