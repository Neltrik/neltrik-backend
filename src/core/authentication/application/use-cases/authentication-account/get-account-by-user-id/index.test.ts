import { AuthenticationAccount } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError } from "../../../../domain/errors";
import { PasswordHash } from "../../../../domain/value-objects";
import { AuthenticationAccountRepositorySpy } from "../../../../test-doubles";
import { GetAccountByUserIdUseCase } from "./index";

describe("GetAccountByUserIdUseCase", () => {
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
        accountRepository.findByUserId.mockResolvedValue(account);
        const useCase = new GetAccountByUserIdUseCase(accountRepository);
        return { useCase, accountRepository, account };
    };

    it("should get an account successfully", async () => {
        const { useCase, accountRepository, account } = makeSut();
        const result = await useCase.execute("user-id");
        expect(accountRepository.findByUserId).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
        expect(result).toBe(account);
    });

    it("should throw AuthenticationAccountNotFoundError when account does not exist", async () => {
        const { useCase, accountRepository } = makeSut();
        accountRepository.findByUserId.mockResolvedValue(null);
        await expect(useCase.execute("user-id")).rejects.toThrow(AuthenticationAccountNotFoundError);
        expect(accountRepository.findByUserId).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
    });

    it("should propagate repository errors", async () => {
        const { useCase, accountRepository } = makeSut();
        accountRepository.findByUserId.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("user-id")).rejects.toThrow("Database error");
        expect(accountRepository.findByUserId).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
    });
});
