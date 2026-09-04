import { AuthenticationAccount } from "../../../../domain/entities";
import { PasswordHash } from "../../../../domain/value-objects";
import { AuthenticationAccountRepositorySpy, PasswordResetRepositorySpy } from "../../../../test-doubles";
import { RequestPasswordResetUseCase } from "./index";

describe("RequestPasswordResetUseCase", () => {
    const makeSut = () => {
        const account = AuthenticationAccount.create({
            id: "account-id",
            userId: "user-id",
            email: "john@company.com",
            provider: "email-password",
            createdAt: new Date("2025-01-01T00:00:00.000Z"),
            passwordHash: PasswordHash.create("hashed-password"),
            updatedAt: new Date("2025-01-01T00:00:00.000Z"),
        });
        const accountRepository = new AuthenticationAccountRepositorySpy();
        accountRepository.findByEmail.mockResolvedValue(account);
        const passwordResetRepository = new PasswordResetRepositorySpy();
        const emailSender = {
            sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
            sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
        };
        const useCase = new RequestPasswordResetUseCase(accountRepository, passwordResetRepository, emailSender);
        return { useCase, account, accountRepository, passwordResetRepository, emailSender };
    };

    describe("execute", () => {
        it("should request password reset successfully", async () => {
            const sut = makeSut();
            await sut.useCase.execute("john@company.com");
            expect(sut.accountRepository.findByEmail).toHaveBeenCalledWith("john@company.com");
            expect(sut.passwordResetRepository.create).toHaveBeenCalledTimes(1);
            expect(sut.emailSender.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
        });

        it("should not create a password reset when account does not exist", async () => {
            const sut = makeSut();
            sut.accountRepository.findByEmail.mockResolvedValue(null);
            await expect(sut.useCase.execute("unknown@company.com")).resolves.toBeUndefined();
            expect(sut.accountRepository.findByEmail).toHaveBeenCalledWith("unknown@company.com");
            expect(sut.passwordResetRepository.create).not.toHaveBeenCalled();
            expect(sut.emailSender.sendPasswordResetEmail).not.toHaveBeenCalled();
        });

        it("should create a password reset with the expected values", async () => {
            const sut = makeSut();
            await sut.useCase.execute("john@company.com");
            const [passwordReset] = sut.passwordResetRepository.create.mock.calls[0] ?? [];
            expect(passwordReset).toBeDefined();
            expect(passwordReset?.id).toEqual(expect.any(String));
            expect(passwordReset?.id).not.toHaveLength(0);
            expect(passwordReset?.authenticationAccountId).toBe("account-id");
            expect(passwordReset?.tokenHash).toBeDefined();
            expect(passwordReset?.expiresAt).toBeDefined();
            expect(passwordReset?.usedAt).toBeNull();
            expect(passwordReset?.createdAt).toBeInstanceOf(Date);
            expect(passwordReset?.updatedAt).toBeInstanceOf(Date);
        });

        it("should create a password reset with an expiration date 24 hours in the future", async () => {
            const sut = makeSut();
            const before = Date.now();
            await sut.useCase.execute("john@company.com");
            const after = Date.now();
            const [passwordReset] = sut.passwordResetRepository.create.mock.calls[0] ?? [];
            expect(passwordReset).toBeDefined();
            const expirationTime = passwordReset?.expiresAt.value.getTime() ?? 0;
            expect(expirationTime).toBeGreaterThanOrEqual(before + 24 * 60 * 60 * 1000);
            expect(expirationTime).toBeLessThanOrEqual(after + 24 * 60 * 60 * 1000);
        });

        it("should create the password reset for the found account", async () => {
            const sut = makeSut();
            await sut.useCase.execute("john@company.com");
            const [passwordReset] = sut.passwordResetRepository.create.mock.calls[0] ?? [];
            expect(passwordReset?.authenticationAccountId).toBe(sut.account.id);
        });

        it("should generate a token hash for the password reset", async () => {
            const sut = makeSut();
            await sut.useCase.execute("john@company.com");
            const [passwordReset] = sut.passwordResetRepository.create.mock.calls[0] ?? [];
            expect(passwordReset?.tokenHash.value).toEqual(expect.any(String));
            expect(passwordReset?.tokenHash.value).not.toHaveLength(0);
        });

        it("should not persist the original reset token", async () => {
            const sut = makeSut();
            await sut.useCase.execute("john@company.com");
            const [passwordReset] = sut.passwordResetRepository.create.mock.calls[0] ?? [];
            expect(passwordReset).toBeDefined();
            expect(passwordReset).not.toHaveProperty("token");
        });

        it("should send the password reset email using the account email and generated token", async () => {
            const sut = makeSut();
            await sut.useCase.execute("john@company.com");
            expect(sut.emailSender.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
            const calls = sut.emailSender.sendPasswordResetEmail.mock.calls as [string, string][];
            const call = calls[0];
            if (call === undefined) {
                throw new Error("Expected sendPasswordResetEmail to be called");
            }
            const [email, token] = call;
            expect(email).toBe("john@company.com");
            expect(typeof token).toBe("string");
            expect(token).not.toHaveLength(0);
        });

        it("should send the same generated token that corresponds to the persisted hash", async () => {
            const sut = makeSut();
            await sut.useCase.execute("john@company.com");
            const [passwordReset] = sut.passwordResetRepository.create.mock.calls[0] ?? [];
            const calls = sut.emailSender.sendPasswordResetEmail.mock.calls as [string, string][];
            const call = calls[0];
            if (passwordReset === undefined || call === undefined) {
                throw new Error("Expected password reset and email to be created");
            }
            const [, token] = call;
            expect(passwordReset.tokenHash.verify(token)).toBe(true);
        });

        it("should use the account email to send the password reset email", async () => {
            const sut = makeSut();
            await sut.useCase.execute("john@company.com");
            expect(sut.emailSender.sendPasswordResetEmail).toHaveBeenCalledWith(sut.account.email, expect.any(String));
        });

        it("should generate different tokens for different password reset requests", async () => {
            const sut = makeSut();
            await sut.useCase.execute("john@company.com");
            await sut.useCase.execute("john@company.com");
            expect(sut.passwordResetRepository.create).toHaveBeenCalledTimes(2);
            const firstReset = sut.passwordResetRepository.create.mock.calls[0]?.[0];
            const secondReset = sut.passwordResetRepository.create.mock.calls[1]?.[0];
            expect(firstReset).toBeDefined();
            expect(secondReset).toBeDefined();
            expect(firstReset?.tokenHash.value).not.toBe(secondReset?.tokenHash.value);
        });

        it("should not create a password reset when account lookup fails", async () => {
            const sut = makeSut();
            sut.accountRepository.findByEmail.mockRejectedValue(new Error("Database error"));
            await expect(sut.useCase.execute("john@company.com")).rejects.toThrow("Database error");
            expect(sut.passwordResetRepository.create).not.toHaveBeenCalled();
            expect(sut.emailSender.sendPasswordResetEmail).not.toHaveBeenCalled();
        });

        it("should propagate password reset creation errors", async () => {
            const sut = makeSut();
            sut.passwordResetRepository.create.mockRejectedValue(new Error("Creation failed"));
            await expect(sut.useCase.execute("john@company.com")).rejects.toThrow("Creation failed");
            expect(sut.passwordResetRepository.create).toHaveBeenCalledTimes(1);
            expect(sut.emailSender.sendPasswordResetEmail).not.toHaveBeenCalled();
        });

        it("should propagate email sending errors", async () => {
            const sut = makeSut();
            sut.emailSender.sendPasswordResetEmail.mockRejectedValue(new Error("Email sending failed"));
            await expect(sut.useCase.execute("john@company.com")).rejects.toThrow("Email sending failed");
            expect(sut.passwordResetRepository.create).toHaveBeenCalledTimes(1);
            expect(sut.emailSender.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
        });
    });
});
