import { AuthenticationAccount } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError } from "../../../../domain/errors";
import { AuthenticationProvider, PasswordHash } from "../../../../domain/value-objects";
import { AuthenticationAccountRepositorySpy } from "../../../../test-doubles";
import { GetAuthenticationAccountByUserIdUseCase } from "./index";

describe("GetAuthenticationAccountByUserIdUseCase", () => {
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
        authenticationAccountRepository.findByUserId.mockResolvedValue(account);
        const useCase = new GetAuthenticationAccountByUserIdUseCase(authenticationAccountRepository);
        return { useCase, authenticationAccountRepository, account };
    };

    it("should get an authentication account successfully", async () => {
        const { useCase, authenticationAccountRepository, account } = makeSut();
        const result = await useCase.execute("user-id");
        expect(authenticationAccountRepository.findByUserId).toHaveBeenCalledTimes(1);
        expect(authenticationAccountRepository.findByUserId).toHaveBeenCalledWith("user-id");
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
        authenticationAccountRepository.findByUserId.mockResolvedValue(null);
        await expect(useCase.execute("user-id")).rejects.toThrow(AuthenticationAccountNotFoundError);
    });

    it("should propagate repository errors", async () => {
        const { useCase, authenticationAccountRepository } = makeSut();
        authenticationAccountRepository.findByUserId.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("user-id")).rejects.toThrow("Database error");
    });
});
