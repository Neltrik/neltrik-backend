import type { IdGenerator } from "@/shared/id-generator";

import { AuthenticationAccount } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError, EmailAlreadyVerifiedError } from "../../../../domain/errors";
import { ExpirationDate, PasswordHash } from "../../../../domain/value-objects";
import {
    AuthenticationAccountRepositorySpy,
    EmailVerificationRepositorySpy,
    TransactionManagerSpy,
} from "../../../../test-doubles";
import { RequestEmailVerificationUseCase } from "./index";

describe("RequestEmailVerificationUseCase", () => {
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
        const idGenerator = {
            generate: jest.fn().mockReturnValue("email-verification-id"),
        } satisfies IdGenerator;
        const transactionManager = new TransactionManagerSpy();
        const accountRepository = new AuthenticationAccountRepositorySpy();
        accountRepository.findByUserId.mockResolvedValue(account);
        const emailVerificationRepository = new EmailVerificationRepositorySpy();
        const emailSender = {
            sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
        };
        const useCase = new RequestEmailVerificationUseCase(
            idGenerator,
            transactionManager,
            accountRepository,
            emailVerificationRepository,
            emailSender,
        );
        return {
            useCase,
            account,
            idGenerator,
            transactionManager,
            accountRepository,
            emailVerificationRepository,
            emailSender,
        };
    };

    describe("execute", () => {
        it("should request email verification successfully", async () => {
            const sut = makeSut();
            await sut.useCase.execute("user-id");
            expect(sut.accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
            expect(sut.transactionManager.executeCalls).toBe(1);
            expect(sut.emailVerificationRepository.invalidatePendingByAccount).toHaveBeenCalledTimes(1);
            expect(sut.emailVerificationRepository.create).toHaveBeenCalledTimes(1);
            expect(sut.idGenerator.generate).toHaveBeenCalledTimes(1);
            expect(sut.emailSender.sendVerificationEmail).toHaveBeenCalledTimes(1);
        });

        it("should throw AuthenticationAccountNotFoundError when account does not exist", async () => {
            const sut = makeSut();
            sut.accountRepository.findByUserId.mockResolvedValue(null);
            await expect(sut.useCase.execute("user-id")).rejects.toThrow(AuthenticationAccountNotFoundError);
            expect(sut.accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
            expect(sut.transactionManager.executeCalls).toBe(0);
            expect(sut.emailVerificationRepository.invalidatePendingByAccount).not.toHaveBeenCalled();
            expect(sut.emailVerificationRepository.create).not.toHaveBeenCalled();
            expect(sut.emailSender.sendVerificationEmail).not.toHaveBeenCalled();
        });

        it("should throw EmailAlreadyVerifiedError when email is already verified", async () => {
            const sut = makeSut();
            const verifiedAccount = AuthenticationAccount.restore({
                id: "account-id",
                userId: "user-id",
                email: "john@company.com",
                provider: "email-password",
                createdAt: new Date(),
                passwordHash: PasswordHash.create("hashed-password"),
                emailVerified: true,
                updatedAt: new Date(),
            });
            sut.accountRepository.findByUserId.mockResolvedValue(verifiedAccount);
            await expect(sut.useCase.execute("user-id")).rejects.toThrow(EmailAlreadyVerifiedError);
            expect(sut.accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
            expect(sut.transactionManager.executeCalls).toBe(0);
            expect(sut.emailVerificationRepository.invalidatePendingByAccount).not.toHaveBeenCalled();
            expect(sut.emailVerificationRepository.create).not.toHaveBeenCalled();
            expect(sut.emailSender.sendVerificationEmail).not.toHaveBeenCalled();
        });

        it("should invalidate pending verifications before creating a new one", async () => {
            const sut = makeSut();
            await sut.useCase.execute("user-id");
            expect(sut.emailVerificationRepository.invalidatePendingByAccount).toHaveBeenCalledTimes(1);
            expect(sut.emailVerificationRepository.create).toHaveBeenCalledTimes(1);
            const invalidateContext = sut.emailVerificationRepository.invalidatePendingByAccount.mock.calls[0]?.[1];
            const createContext = sut.emailVerificationRepository.create.mock.calls[0]?.[1];
            expect(invalidateContext).toBe(createContext);
        });

        it("should invalidate pending verifications for the account", async () => {
            const sut = makeSut();
            await sut.useCase.execute("user-id");
            expect(sut.emailVerificationRepository.invalidatePendingByAccount).toHaveBeenCalledWith(
                "account-id",
                expect.anything(),
            );
        });

        it("should create an email verification with the expected values", async () => {
            const sut = makeSut();
            await sut.useCase.execute("user-id");
            const [verification] = sut.emailVerificationRepository.create.mock.calls[0] ?? [];
            expect(verification).toBeDefined();
            expect(verification?.id).toBe("email-verification-id");
            expect(verification?.authenticationAccountId).toBe("account-id");
            expect(verification?.email).toBe("john@company.com");
            expect(verification?.tokenHash).toBeDefined();
            expect(verification?.expiresAt).toBeInstanceOf(ExpirationDate);
            expect(verification?.verifiedAt).toBeNull();
        });

        it("should create an email verification with an expiration date 24 hours in the future", async () => {
            const sut = makeSut();
            const before = Date.now();
            await sut.useCase.execute("user-id");
            const after = Date.now();
            const [verification] = sut.emailVerificationRepository.create.mock.calls[0] ?? [];
            expect(verification).toBeDefined();
            const expirationTime = verification?.expiresAt.value.getTime() ?? 0;
            expect(expirationTime).toBeGreaterThanOrEqual(before + 24 * 60 * 60 * 1000);
            expect(expirationTime).toBeLessThanOrEqual(after + 24 * 60 * 60 * 1000);
        });

        it("should send the verification email using the account email and generated token", async () => {
            const sut = makeSut();
            await sut.useCase.execute("user-id");
            expect(sut.emailSender.sendVerificationEmail).toHaveBeenCalledTimes(1);
            const calls = sut.emailSender.sendVerificationEmail.mock.calls as [string, string][];
            const call = calls[0];
            if (call === undefined) {
                throw new Error("Expected sendVerificationEmail to be called");
            }
            const [email, token] = call;
            expect(email).toBe("john@company.com");
            expect(typeof token).toBe("string");
            expect(token).not.toHaveLength(0);
        });

        it("should use the generated id when creating the verification", async () => {
            const sut = makeSut();
            await sut.useCase.execute("user-id");
            expect(sut.idGenerator.generate).toHaveBeenCalledTimes(1);
            const [verification] = sut.emailVerificationRepository.create.mock.calls[0] ?? [];
            expect(verification?.id).toBe("email-verification-id");
        });

        it("should use the same timestamp for createdAt and updatedAt", async () => {
            const sut = makeSut();
            await sut.useCase.execute("user-id");
            const [verification] = sut.emailVerificationRepository.create.mock.calls[0] ?? [];
            expect(verification).toBeDefined();
            expect(verification?.createdAt).toEqual(verification?.updatedAt);
        });

        it("should execute the verification persistence inside a transaction", async () => {
            const sut = makeSut();
            await sut.useCase.execute("user-id");
            expect(sut.transactionManager.executeCalls).toBe(1);
            expect(sut.emailVerificationRepository.invalidatePendingByAccount).toHaveBeenCalledTimes(1);
            expect(sut.emailVerificationRepository.create).toHaveBeenCalledTimes(1);
        });

        it("should not send the verification email when the transaction fails", async () => {
            const sut = makeSut();
            sut.transactionManager.shouldFail = true;
            await expect(sut.useCase.execute("user-id")).rejects.toThrow("Transaction failed");
            expect(sut.emailVerificationRepository.invalidatePendingByAccount).not.toHaveBeenCalled();
            expect(sut.emailVerificationRepository.create).not.toHaveBeenCalled();
            expect(sut.emailSender.sendVerificationEmail).not.toHaveBeenCalled();
        });

        it("should propagate account repository errors", async () => {
            const sut = makeSut();
            sut.accountRepository.findByUserId.mockRejectedValue(new Error("Database error"));
            await expect(sut.useCase.execute("user-id")).rejects.toThrow("Database error");
            expect(sut.accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
            expect(sut.transactionManager.executeCalls).toBe(0);
            expect(sut.emailSender.sendVerificationEmail).not.toHaveBeenCalled();
        });

        it("should propagate verification invalidation errors", async () => {
            const sut = makeSut();
            sut.emailVerificationRepository.invalidatePendingByAccount.mockRejectedValue(
                new Error("Invalidation failed"),
            );
            await expect(sut.useCase.execute("user-id")).rejects.toThrow("Invalidation failed");
            expect(sut.emailVerificationRepository.create).not.toHaveBeenCalled();
            expect(sut.emailSender.sendVerificationEmail).not.toHaveBeenCalled();
        });

        it("should propagate verification creation errors", async () => {
            const sut = makeSut();
            sut.emailVerificationRepository.create.mockRejectedValue(new Error("Creation failed"));
            await expect(sut.useCase.execute("user-id")).rejects.toThrow("Creation failed");
            expect(sut.emailVerificationRepository.create).toHaveBeenCalledTimes(1);
            expect(sut.emailSender.sendVerificationEmail).not.toHaveBeenCalled();
        });

        it("should propagate email sending errors", async () => {
            const sut = makeSut();
            sut.emailSender.sendVerificationEmail.mockRejectedValue(new Error("Email sending failed"));
            await expect(sut.useCase.execute("user-id")).rejects.toThrow("Email sending failed");
            expect(sut.emailVerificationRepository.create).toHaveBeenCalledTimes(1);
            expect(sut.emailSender.sendVerificationEmail).toHaveBeenCalledTimes(1);
        });
    });
});
