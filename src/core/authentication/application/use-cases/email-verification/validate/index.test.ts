import { AuthenticationAccount } from "../../../../domain/entities";
import { EmailVerification } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError, EmailVerificationNotFoundError } from "../../../../domain/errors";
import { ExpirationDate, PasswordHash, TokenHash } from "../../../../domain/value-objects";
import {
    AuthenticationAccountRepositorySpy,
    EmailVerificationRepositorySpy,
    TransactionManagerSpy,
} from "../../../../test-doubles";
import { ValidateEmailVerificationUseCase } from "./index";

describe("ValidateEmailVerificationUseCase", () => {
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
        const token = "verification-token";
        const verification = EmailVerification.restore({
            id: "email-verification-id",
            authenticationAccountId: "account-id",
            email: "john@company.com",
            tokenHash: TokenHash.create(TokenHash.hash(token)),
            expiresAt: ExpirationDate.create(new Date(Date.now() + 24 * 60 * 60 * 1000)),
            verifiedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const transactionManager = new TransactionManagerSpy();
        const accountRepository = new AuthenticationAccountRepositorySpy();
        accountRepository.findById.mockResolvedValue(account);
        const emailVerificationRepository = new EmailVerificationRepositorySpy();
        emailVerificationRepository.findByTokenHash.mockResolvedValue(verification);
        const useCase = new ValidateEmailVerificationUseCase(
            transactionManager,
            accountRepository,
            emailVerificationRepository,
        );
        return {
            useCase,
            token,
            verification,
            account,
            transactionManager,
            accountRepository,
            emailVerificationRepository,
        };
    };

    describe("execute", () => {
        it("should validate email verification successfully", async () => {
            const sut = makeSut();
            await sut.useCase.execute(sut.token);
            expect(sut.emailVerificationRepository.findByTokenHash).toHaveBeenCalledTimes(1);
            expect(sut.accountRepository.findById).toHaveBeenCalledWith("account-id");
            expect(sut.transactionManager.executeCalls).toBe(1);
            expect(sut.emailVerificationRepository.update).toHaveBeenCalledTimes(1);
            expect(sut.accountRepository.update).toHaveBeenCalledTimes(1);
        });

        it("should throw EmailVerificationNotFoundError when verification does not exist", async () => {
            const sut = makeSut();
            sut.emailVerificationRepository.findByTokenHash.mockResolvedValue(null);
            await expect(sut.useCase.execute(sut.token)).rejects.toThrow(EmailVerificationNotFoundError);
            expect(sut.emailVerificationRepository.findByTokenHash).toHaveBeenCalledTimes(1);
            expect(sut.accountRepository.findById).not.toHaveBeenCalled();
            expect(sut.transactionManager.executeCalls).toBe(0);
            expect(sut.emailVerificationRepository.update).not.toHaveBeenCalled();
            expect(sut.accountRepository.update).not.toHaveBeenCalled();
        });

        it("should throw AuthenticationAccountNotFoundError when account does not exist", async () => {
            const sut = makeSut();
            sut.accountRepository.findById.mockResolvedValue(null);
            await expect(sut.useCase.execute(sut.token)).rejects.toThrow(AuthenticationAccountNotFoundError);
            expect(sut.emailVerificationRepository.findByTokenHash).toHaveBeenCalledTimes(1);
            expect(sut.accountRepository.findById).toHaveBeenCalledWith("account-id");
            expect(sut.transactionManager.executeCalls).toBe(0);
            expect(sut.emailVerificationRepository.update).not.toHaveBeenCalled();
            expect(sut.accountRepository.update).not.toHaveBeenCalled();
        });

        it("should find verification using the hashed token", async () => {
            const sut = makeSut();
            await sut.useCase.execute(sut.token);
            expect(sut.emailVerificationRepository.findByTokenHash).toHaveBeenCalledWith(TokenHash.hash(sut.token));
        });

        it("should complete the email verification", async () => {
            const sut = makeSut();
            expect(sut.verification.verifiedAt).toBeNull();
            await sut.useCase.execute(sut.token);
            expect(sut.verification.verifiedAt).not.toBeNull();
        });

        it("should update the email verification inside the transaction", async () => {
            const sut = makeSut();
            await sut.useCase.execute(sut.token);
            expect(sut.transactionManager.executeCalls).toBe(1);
            expect(sut.emailVerificationRepository.update).toHaveBeenCalledTimes(1);
            const [verification, context] = sut.emailVerificationRepository.update.mock.calls[0] ?? [];
            expect(verification).toBe(sut.verification);
            expect(context).toBeDefined();
        });

        it("should verify the account email", async () => {
            const sut = makeSut();
            expect(sut.account.emailVerified).toBe(false);
            await sut.useCase.execute(sut.token);
            expect(sut.account.emailVerified).toBe(true);
        });

        it("should update the account inside the transaction", async () => {
            const sut = makeSut();
            await sut.useCase.execute(sut.token);
            expect(sut.accountRepository.update).toHaveBeenCalledTimes(1);
            const call = sut.accountRepository.update.mock.calls[0] as [AuthenticationAccount, unknown] | undefined;
            expect(call).toBeDefined();
            const [account, context] = call ?? [];
            expect(account).toBe(sut.account);
            expect(context).toBeDefined();
        });

        it("should use the same transaction context for both updates", async () => {
            const sut = makeSut();
            await sut.useCase.execute(sut.token);
            const verificationCall = sut.emailVerificationRepository.update.mock.calls[0] as
                [typeof sut.verification, unknown] | undefined;
            const accountCall = sut.accountRepository.update.mock.calls[0] as [typeof sut.account, unknown] | undefined;
            expect(verificationCall).toBeDefined();
            expect(accountCall).toBeDefined();
            const verificationContext = verificationCall?.[1];
            const accountContext = accountCall?.[1];
            expect(verificationContext).toBeDefined();
            expect(accountContext).toBe(verificationContext);
        });

        it("should execute verification and account updates inside a transaction", async () => {
            const sut = makeSut();
            await sut.useCase.execute(sut.token);
            expect(sut.transactionManager.executeCalls).toBe(1);
            expect(sut.emailVerificationRepository.update).toHaveBeenCalledTimes(1);
            expect(sut.accountRepository.update).toHaveBeenCalledTimes(1);
        });

        it("should not update anything when the transaction fails", async () => {
            const sut = makeSut();
            sut.transactionManager.shouldFail = true;
            await expect(sut.useCase.execute(sut.token)).rejects.toThrow("Transaction failed");
            expect(sut.transactionManager.executeCalls).toBe(1);
            expect(sut.emailVerificationRepository.update).not.toHaveBeenCalled();
            expect(sut.accountRepository.update).not.toHaveBeenCalled();
        });

        it("should propagate verification repository errors", async () => {
            const sut = makeSut();
            sut.emailVerificationRepository.findByTokenHash.mockRejectedValue(new Error("Database error"));
            await expect(sut.useCase.execute(sut.token)).rejects.toThrow("Database error");
            expect(sut.accountRepository.findById).not.toHaveBeenCalled();
            expect(sut.transactionManager.executeCalls).toBe(0);
        });

        it("should propagate account repository errors", async () => {
            const sut = makeSut();
            sut.accountRepository.findById.mockRejectedValue(new Error("Database error"));
            await expect(sut.useCase.execute(sut.token)).rejects.toThrow("Database error");
            expect(sut.transactionManager.executeCalls).toBe(0);
            expect(sut.emailVerificationRepository.update).not.toHaveBeenCalled();
            expect(sut.accountRepository.update).not.toHaveBeenCalled();
        });

        it("should propagate verification update errors", async () => {
            const sut = makeSut();
            sut.emailVerificationRepository.update.mockRejectedValue(new Error("Verification update failed"));
            await expect(sut.useCase.execute(sut.token)).rejects.toThrow("Verification update failed");
            expect(sut.emailVerificationRepository.update).toHaveBeenCalledTimes(1);
            expect(sut.accountRepository.update).not.toHaveBeenCalled();
        });

        it("should propagate account update errors", async () => {
            const sut = makeSut();
            sut.accountRepository.update.mockRejectedValue(new Error("Account update failed"));
            await expect(sut.useCase.execute(sut.token)).rejects.toThrow("Account update failed");
            expect(sut.emailVerificationRepository.update).toHaveBeenCalledTimes(1);
            expect(sut.accountRepository.update).toHaveBeenCalledTimes(1);
        });
    });
});
