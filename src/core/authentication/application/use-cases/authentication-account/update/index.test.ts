import { AuthenticationAccount } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError } from "../../../../domain/errors";
import { AuthenticationProvider, Password, PasswordHash } from "../../../../domain/value-objects";
import { AuthenticationAccountRepositorySpy, PasswordHasherSpy } from "../../../../test-doubles";
import { ChangeAuthenticationAccountPasswordUseCase } from "./index";
import type { ChangeAuthenticationAccountPasswordInput } from "./input";

const makeInput = (): ChangeAuthenticationAccountPasswordInput => ({
    userId: "user-id",
    password: Password.create("a-secure-password"),
});

describe("ChangeAuthenticationAccountPasswordUseCase", () => {
    const makeSut = () => {
        const authenticationAccountRepository = new AuthenticationAccountRepositorySpy();
        const account = AuthenticationAccount.create({
            id: "authentication-account-id",
            userId: "user-id",
            provider: AuthenticationProvider.create("email-password"),
            email: "foo@example.com",
            passwordHash: PasswordHash.create("old-hashed-password"),
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        });
        authenticationAccountRepository.findByUserId.mockResolvedValue(account);
        authenticationAccountRepository.update.mockResolvedValue(undefined);
        const passwordHasher = new PasswordHasherSpy();
        const passwordHash = PasswordHash.create("new-hashed-password");
        passwordHasher.hash.mockResolvedValue(passwordHash);
        const useCase = new ChangeAuthenticationAccountPasswordUseCase(authenticationAccountRepository, passwordHasher);
        return { useCase, authenticationAccountRepository, passwordHasher, account };
    };

    it("should change the authentication account password successfully", async () => {
        const { useCase, authenticationAccountRepository, passwordHasher } = makeSut();
        const input = makeInput();
        await useCase.execute(input);
        expect(authenticationAccountRepository.findByUserId).toHaveBeenCalledTimes(1);
        expect(authenticationAccountRepository.findByUserId).toHaveBeenCalledWith("user-id");
        expect(passwordHasher.hash).toHaveBeenCalledTimes(1);
        expect(passwordHasher.hash).toHaveBeenCalledWith(input.password);
        expect(authenticationAccountRepository.update).toHaveBeenCalledTimes(1);
    });

    it("should update the authentication account with the generated password hash", async () => {
        const { useCase, authenticationAccountRepository, passwordHasher } = makeSut();
        const input = makeInput();
        await useCase.execute(input);
        const account = authenticationAccountRepository.update.mock.calls[0]?.[0];
        expect(passwordHasher.hash).toHaveBeenCalledWith(input.password);
        expect(account?.passwordHash.value).toBe("new-hashed-password");
    });

    it("should throw AuthenticationAccountNotFoundError when the account does not exist", async () => {
        const { useCase, authenticationAccountRepository, passwordHasher } = makeSut();
        authenticationAccountRepository.findByUserId.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(AuthenticationAccountNotFoundError);
        expect(passwordHasher.hash).not.toHaveBeenCalled();
        expect(authenticationAccountRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate password hasher errors", async () => {
        const { useCase, authenticationAccountRepository, passwordHasher } = makeSut();
        passwordHasher.hash.mockRejectedValue(new Error("Hashing error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Hashing error");
        expect(authenticationAccountRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, authenticationAccountRepository } = makeSut();
        authenticationAccountRepository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});
