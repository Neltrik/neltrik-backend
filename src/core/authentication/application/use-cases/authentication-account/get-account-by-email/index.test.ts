import { AuthenticationAccount } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError } from "../../../../domain/errors";
import { PasswordHash } from "../../../../domain/value-objects";
import { AuthenticationAccountRepositorySpy } from "../../../../test-doubles";
import { GetAccountByEmailUseCase } from "./index";

describe("GetAccountByEmailUseCase", () => {
    const makeSut = () => {
        const accountRepository = new AuthenticationAccountRepositorySpy();
        const account = AuthenticationAccount.create({
            id: "account-id",
            userId: "user-id",
            provider: "email-password",
            email: "john@company.com",
            passwordHash: PasswordHash.create("hashed-password"),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        accountRepository.findByEmail.mockResolvedValue(account);
        const useCase = new GetAccountByEmailUseCase(accountRepository);
        return { useCase, accountRepository, account };
    };

    it("should get an account successfully", async () => {
        const { useCase, accountRepository, account } = makeSut();
        const result = await useCase.execute("john@company.com");
        expect(accountRepository.findByEmail).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByEmail).toHaveBeenCalledWith("john@company.com");
        expect(result).toBe(account);
    });

    it("should throw AuthenticationAccountNotFoundError when account does not exist", async () => {
        const { useCase, accountRepository } = makeSut();
        accountRepository.findByEmail.mockResolvedValue(null);
        await expect(useCase.execute("john@company.com")).rejects.toThrow(AuthenticationAccountNotFoundError);
        expect(accountRepository.findByEmail).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByEmail).toHaveBeenCalledWith("john@company.com");
    });

    it("should propagate repository errors", async () => {
        const { useCase, accountRepository } = makeSut();
        accountRepository.findByEmail.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("john@company.com")).rejects.toThrow("Database error");
        expect(accountRepository.findByEmail).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByEmail).toHaveBeenCalledWith("john@company.com");
    });
});
