import { AuthenticationAccount } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError } from "../../../../domain/errors";
import { PasswordHash } from "../../../../domain/value-objects";
import {
    AuthenticationAccountRepositorySpy,
    AuthenticationSessionRepositorySpy,
    TransactionManagerSpy,
} from "../../../../test-doubles";
import { RevokeAllSessionsUseCase } from "./index";
import type { RevokeAllSessionsInput } from "./input";

const makeInput = (): RevokeAllSessionsInput => ({
    userId: "user-id",
    currentSessionId: "session-id",
});

describe("RevokeAllSessionsUseCase", () => {
    const makeSut = () => {
        const account = AuthenticationAccount.create({
            id: "account-id",
            userId: "user-id",
            email: "john@company.com",
            provider: "email-password",
            createdAt: new Date(),
            passwordHash: PasswordHash.create("hashed-password"),
            updatedAt: new Date(),
        });
        const accountRepository = new AuthenticationAccountRepositorySpy();
        accountRepository.findByUserId.mockResolvedValue(account);
        const sessionRepository = new AuthenticationSessionRepositorySpy();
        const transactionManager = new TransactionManagerSpy();
        const useCase = new RevokeAllSessionsUseCase(transactionManager, accountRepository, sessionRepository);
        return { useCase, accountRepository, sessionRepository, transactionManager, account };
    };

    it("should revoke all sessions except the current session successfully", async () => {
        const { useCase, accountRepository, sessionRepository, transactionManager } = makeSut();
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(accountRepository.findByUserId).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
        expect(transactionManager.executeCalls).toBe(1);
        expect(sessionRepository.revokeAllExcept).toHaveBeenCalledTimes(1);
        expect(sessionRepository.revokeAllExcept).toHaveBeenCalledWith("account-id", "session-id", expect.anything());
    });

    it("should throw AuthenticationAccountNotFoundError when account does not exist", async () => {
        const { useCase, accountRepository, sessionRepository, transactionManager } = makeSut();
        accountRepository.findByUserId.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(AuthenticationAccountNotFoundError);
        expect(accountRepository.findByUserId).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
        expect(transactionManager.executeCalls).toBe(0);
        expect(sessionRepository.revokeAllExcept).not.toHaveBeenCalled();
    });

    it("should pass the authentication account id to revokeAllExcept", async () => {
        const { useCase, sessionRepository } = makeSut();
        await useCase.execute(makeInput());
        expect(sessionRepository.revokeAllExcept).toHaveBeenCalledWith("account-id", "session-id", expect.anything());
    });

    it("should pass the current session id to revokeAllExcept", async () => {
        const { useCase, sessionRepository } = makeSut();
        await useCase.execute({ userId: "user-id", currentSessionId: "current-session-id" });
        expect(sessionRepository.revokeAllExcept).toHaveBeenCalledWith(
            "account-id",
            "current-session-id",
            expect.anything(),
        );
    });

    it("should execute revokeAllExcept inside a transaction", async () => {
        const { useCase, sessionRepository, transactionManager } = makeSut();
        await useCase.execute(makeInput());
        expect(transactionManager.executeCalls).toBe(1);
        expect(sessionRepository.revokeAllExcept).toHaveBeenCalledTimes(1);
    });

    it("should propagate account repository errors", async () => {
        const { useCase, accountRepository, sessionRepository, transactionManager } = makeSut();
        accountRepository.findByUserId.mockRejectedValue(new Error("Account lookup failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Account lookup failed");
        expect(accountRepository.findByUserId).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
        expect(transactionManager.executeCalls).toBe(0);
        expect(sessionRepository.revokeAllExcept).not.toHaveBeenCalled();
    });

    it("should propagate session repository errors", async () => {
        const { useCase, sessionRepository, transactionManager } = makeSut();
        sessionRepository.revokeAllExcept.mockImplementation(() => {
            throw new Error("Session revoke failed");
        });
        await expect(useCase.execute(makeInput())).rejects.toThrow("Session revoke failed");
        expect(transactionManager.executeCalls).toBe(1);
        expect(sessionRepository.revokeAllExcept).toHaveBeenCalledTimes(1);
        expect(sessionRepository.revokeAllExcept).toHaveBeenCalledWith("account-id", "session-id", expect.anything());
    });

    it("should propagate transaction manager errors", async () => {
        const { useCase, transactionManager, sessionRepository } = makeSut();
        transactionManager.shouldFail = true;
        await expect(useCase.execute(makeInput())).rejects.toThrow("Transaction failed");
        expect(transactionManager.executeCalls).toBe(1);
        expect(sessionRepository.revokeAllExcept).not.toHaveBeenCalled();
    });

    it("should not execute a transaction when account lookup fails", async () => {
        const { useCase, accountRepository, transactionManager } = makeSut();
        accountRepository.findByUserId.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(transactionManager.executeCalls).toBe(0);
    });
});
