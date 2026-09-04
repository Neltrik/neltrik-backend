import { AuthenticationAccount, PasswordReset } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError, PasswordResetNotFoundError } from "../../../../domain/errors";
import { ExpirationDate, PasswordHash, TokenHash } from "../../../../domain/value-objects";
import { PasswordHasher } from "../../../../infrastructure/providers";
import {
    AuthenticationAccountRepositorySpy,
    AuthenticationSessionRepositorySpy,
    PasswordResetRepositorySpy,
    TransactionManagerSpy,
} from "../../../../test-doubles";
import { ResetPasswordUseCase } from "./index";

describe("ResetPasswordUseCase", () => {
    const makeSut = () => {
        const account = AuthenticationAccount.create({
            id: "account-id",
            userId: "user-id",
            email: "john@company.com",
            provider: "email-password",
            createdAt: new Date(),
            passwordHash: PasswordHash.create("old-hashed-password"),
            updatedAt: new Date(),
        });
        const token = "password-reset-token";
        const passwordReset = PasswordReset.restore({
            id: "password-reset-id",
            authenticationAccountId: account.id,
            tokenHash: TokenHash.create(TokenHash.hash(token)),
            expiresAt: ExpirationDate.create(new Date(Date.now() + 86400000)),
            usedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const transactionManager = new TransactionManagerSpy();
        const accountRepository = new AuthenticationAccountRepositorySpy();
        const sessionRepository = new AuthenticationSessionRepositorySpy();
        const passwordResetRepository = new PasswordResetRepositorySpy();
        const passwordHasher = new PasswordHasher();
        accountRepository.findById.mockResolvedValue(account);
        passwordResetRepository.findByTokenHash.mockResolvedValue(passwordReset);
        const useCase = new ResetPasswordUseCase(
            transactionManager,
            accountRepository,
            sessionRepository,
            passwordResetRepository,
            passwordHasher,
        );
        return {
            useCase,
            account,
            token,
            passwordReset,
            transactionManager,
            accountRepository,
            sessionRepository,
            passwordResetRepository,
            passwordHasher,
        };
    };

    describe("execute", () => {
        it("should reset the password successfully", async () => {
            const sut = makeSut();
            await sut.useCase.execute({ token: sut.token, newPassword: "new-secure-password" });
            expect(sut.transactionManager.executeCalls).toBe(1);
            expect(sut.passwordResetRepository.update).toHaveBeenCalledTimes(1);
            expect(sut.accountRepository.update).toHaveBeenCalledTimes(1);
            expect(sut.sessionRepository.invalidateByAccount).toHaveBeenCalledTimes(1);
            expect(sut.passwordReset.usedAt).toBeInstanceOf(Date);
        });

        it("should find the password reset using the hashed token", async () => {
            const sut = makeSut();
            await sut.useCase.execute({ token: sut.token, newPassword: "new-secure-password" });
            expect(sut.passwordResetRepository.findByTokenHash).toHaveBeenCalledWith(TokenHash.hash(sut.token));
        });

        it("should throw PasswordResetNotFoundError when reset does not exist", async () => {
            const sut = makeSut();
            sut.passwordResetRepository.findByTokenHash.mockResolvedValue(null);
            await expect(sut.useCase.execute({ token: sut.token, newPassword: "new-secure-password" })).rejects.toThrow(
                PasswordResetNotFoundError,
            );
            expect(sut.accountRepository.findById).not.toHaveBeenCalled();
            expect(sut.transactionManager.executeCalls).toBe(0);
        });

        it("should throw AuthenticationAccountNotFoundError when account does not exist", async () => {
            const sut = makeSut();
            sut.accountRepository.findById.mockResolvedValue(null);
            await expect(sut.useCase.execute({ token: sut.token, newPassword: "new-secure-password" })).rejects.toThrow(
                AuthenticationAccountNotFoundError,
            );
            expect(sut.transactionManager.executeCalls).toBe(0);
            expect(sut.passwordResetRepository.update).not.toHaveBeenCalled();
        });

        it("should hash and update the new password", async () => {
            const sut = makeSut();
            const newPassword = "new-secure-password";
            const hashSpy = jest.spyOn(sut.passwordHasher, "hash");
            await sut.useCase.execute({ token: sut.token, newPassword });
            expect(hashSpy).toHaveBeenCalledWith(newPassword);
            expect(sut.account.passwordHash).toBeInstanceOf(PasswordHash);
            const passwordHash = sut.account.passwordHash;
            expect(passwordHash).not.toBeNull();
            expect(passwordHash?.value).not.toBe("old-hashed-password");
            expect(sut.accountRepository.update).toHaveBeenCalledWith(sut.account, expect.anything());
        });

        it("should update the password reset inside the transaction", async () => {
            const sut = makeSut();
            await sut.useCase.execute({ token: sut.token, newPassword: "new-secure-password" });
            expect(sut.passwordResetRepository.update).toHaveBeenCalledWith(sut.passwordReset, expect.anything());
        });

        it("should invalidate all sessions for the account", async () => {
            const sut = makeSut();
            await sut.useCase.execute({ token: sut.token, newPassword: "new-secure-password" });
            expect(sut.sessionRepository.invalidateByAccount).toHaveBeenCalledWith(sut.account.id, expect.anything());
        });

        it("should use the same transaction context for all operations", async () => {
            const sut = makeSut();
            await sut.useCase.execute({ token: sut.token, newPassword: "new-secure-password" });
            const resetCall = sut.passwordResetRepository.update.mock.calls[0] as
                [typeof sut.passwordReset, unknown] | undefined;
            const accountCall = sut.accountRepository.update.mock.calls[0] as [typeof sut.account, unknown] | undefined;
            const sessionCall = sut.sessionRepository.invalidateByAccount.mock.calls[0] as
                [string, unknown] | undefined;
            expect(resetCall).toBeDefined();
            expect(accountCall).toBeDefined();
            expect(sessionCall).toBeDefined();
            const resetContext = resetCall?.[1];
            const accountContext = accountCall?.[1];
            const sessionContext = sessionCall?.[1];
            expect(resetContext).toBeDefined();
            expect(accountContext).toBe(resetContext);
            expect(sessionContext).toBe(resetContext);
        });

        it("should not persist changes when the transaction fails", async () => {
            const sut = makeSut();
            sut.transactionManager.shouldFail = true;
            await expect(sut.useCase.execute({ token: sut.token, newPassword: "new-secure-password" })).rejects.toThrow(
                "Transaction failed",
            );
            expect(sut.passwordResetRepository.update).not.toHaveBeenCalled();
            expect(sut.accountRepository.update).not.toHaveBeenCalled();
            expect(sut.sessionRepository.invalidateByAccount).not.toHaveBeenCalled();
        });

        it("should propagate password reset repository errors", async () => {
            const sut = makeSut();
            sut.passwordResetRepository.findByTokenHash.mockRejectedValue(new Error("Database error"));
            await expect(sut.useCase.execute({ token: sut.token, newPassword: "new-secure-password" })).rejects.toThrow(
                "Database error",
            );
            expect(sut.transactionManager.executeCalls).toBe(0);
        });

        it("should propagate account repository errors", async () => {
            const sut = makeSut();
            sut.accountRepository.findById.mockRejectedValue(new Error("Database error"));
            await expect(sut.useCase.execute({ token: sut.token, newPassword: "new-secure-password" })).rejects.toThrow(
                "Database error",
            );
            expect(sut.transactionManager.executeCalls).toBe(0);
        });

        it("should propagate password reset update errors", async () => {
            const sut = makeSut();
            sut.passwordResetRepository.update.mockRejectedValue(new Error("Reset update failed"));
            await expect(sut.useCase.execute({ token: sut.token, newPassword: "new-secure-password" })).rejects.toThrow(
                "Reset update failed",
            );
            expect(sut.accountRepository.update).not.toHaveBeenCalled();
            expect(sut.sessionRepository.invalidateByAccount).not.toHaveBeenCalled();
        });

        it("should propagate account update errors", async () => {
            const sut = makeSut();
            sut.accountRepository.update.mockRejectedValue(new Error("Account update failed"));
            await expect(sut.useCase.execute({ token: sut.token, newPassword: "new-secure-password" })).rejects.toThrow(
                "Account update failed",
            );
            expect(sut.sessionRepository.invalidateByAccount).not.toHaveBeenCalled();
        });

        it("should propagate session invalidation errors", async () => {
            const sut = makeSut();
            sut.sessionRepository.invalidateByAccount.mockRejectedValue(new Error("Session invalidation failed"));
            await expect(sut.useCase.execute({ token: sut.token, newPassword: "new-secure-password" })).rejects.toThrow(
                "Session invalidation failed",
            );
        });
    });
});
