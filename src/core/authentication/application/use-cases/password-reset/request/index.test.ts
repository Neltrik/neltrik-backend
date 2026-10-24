import { env } from "@/config/index";
import { type GetUserRequestDto } from "@/core/identity/api";
import { LOCALES, NOTIFICATION_CHANNEL, NOTIFICATION_CODES } from "@/core/notifications/api";
import { type TenantResultDto } from "@/core/tenant/api";

import { AuthenticationAccount } from "../../../../domain/entities";
import { PasswordHash } from "../../../../domain/value-objects";
import {
    AuthenticationAccountRepositorySpy,
    NotificationApiSpy,
    PasswordResetRepositorySpy,
    TenantApiSpy,
    TransactionManagerSpy,
    UserApiSpy,
} from "../../../../test-doubles";
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
        const user: GetUserRequestDto = {
            id: "user-id",
            tenantId: "tenant-id",
            email: "john@company.com",
            firstName: "John",
            lastName: "Doe",
            roleId: "role-id",
            status: "ACTIVE",
            createdAt: new Date("2025-01-01T00:00:00.000Z"),
            updatedAt: new Date("2025-01-01T00:00:00.000Z"),
            suspendedAt: null,
        };
        const tenant: TenantResultDto = { id: "tenant-id", name: "Company" } as TenantResultDto;
        const userApi = new UserApiSpy();
        userApi.getUserById.mockResolvedValue(user);
        const tenantApi = new TenantApiSpy();
        tenantApi.getById.mockResolvedValue(tenant);
        const notificationApi = new NotificationApiSpy();
        notificationApi.send.mockResolvedValue("notification-id");
        const transactionManager = new TransactionManagerSpy();
        const accountRepository = new AuthenticationAccountRepositorySpy();
        accountRepository.findByEmail.mockResolvedValue(account);
        const passwordResetRepository = new PasswordResetRepositorySpy();
        const useCase = new RequestPasswordResetUseCase(
            userApi,
            notificationApi,
            tenantApi,
            transactionManager,
            accountRepository,
            passwordResetRepository,
        );
        return {
            useCase,
            account,
            user,
            tenant,
            userApi,
            tenantApi,
            notificationApi,
            transactionManager,
            accountRepository,
            passwordResetRepository,
        };
    };

    describe("execute", () => {
        it("should request password reset successfully", async () => {
            const sut = makeSut();
            await sut.useCase.execute("john@company.com");
            expect(sut.accountRepository.findByEmail).toHaveBeenCalledWith("john@company.com");
            expect(sut.userApi.getUserById).toHaveBeenCalledWith("user-id");
            expect(sut.tenantApi.getById).toHaveBeenCalledWith("tenant-id");
            expect(sut.passwordResetRepository.invalidatePendingByAccount).toHaveBeenCalledWith(
                "account-id",
                expect.anything(),
            );
            expect(sut.passwordResetRepository.create).toHaveBeenCalledTimes(1);
            expect(sut.notificationApi.send).toHaveBeenCalledTimes(1);
        });

        it("should not create a password reset when account does not exist", async () => {
            const sut = makeSut();
            sut.accountRepository.findByEmail.mockResolvedValue(null);
            await expect(sut.useCase.execute("unknown@company.com")).resolves.toBeUndefined();
            expect(sut.accountRepository.findByEmail).toHaveBeenCalledWith("unknown@company.com");
            expect(sut.userApi.getUserById).not.toHaveBeenCalled();
            expect(sut.tenantApi.getById).not.toHaveBeenCalled();
            expect(sut.passwordResetRepository.invalidatePendingByAccount).not.toHaveBeenCalled();
            expect(sut.passwordResetRepository.create).not.toHaveBeenCalled();
            expect(sut.notificationApi.send).not.toHaveBeenCalled();
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

        it("should send the password reset notification using correct payload and configuration", async () => {
            const sut = makeSut();
            await sut.useCase.execute("john@company.com");
            expect(sut.notificationApi.send).toHaveBeenCalledTimes(1);
            const callArgs = sut.notificationApi.send.mock.calls[0]?.[0];
            expect(callArgs).toBeDefined();
            expect(callArgs).toMatchObject({
                tenantId: sut.user.tenantId,
                recipientId: sut.account.userId,
                recipientEmail: sut.account.email,
                code: NOTIFICATION_CODES.RESET_PASSWORD,
                channels: [NOTIFICATION_CHANNEL.EMAIL],
                locale: LOCALES.ES_CO,
                payload: { name: sut.user.firstName, email: sut.account.email, tenantName: sut.tenant.name },
            });
            expect(callArgs?.payload.resetUrl).toContain(`${env.FRONTEND_URL}/auth/reset-password?token=`);
        });

        it("should fetch the tenant using the user's tenant ID", async () => {
            const sut = makeSut();
            await sut.useCase.execute("john@company.com");
            expect(sut.tenantApi.getById).toHaveBeenCalledTimes(1);
            expect(sut.tenantApi.getById).toHaveBeenCalledWith(sut.user.tenantId);
        });

        it("should send a token that corresponds to the persisted hash", async () => {
            const sut = makeSut();
            await sut.useCase.execute("john@company.com");
            const [passwordReset] = sut.passwordResetRepository.create.mock.calls[0] ?? [];
            const callArgs = sut.notificationApi.send.mock.calls[0]?.[0];
            if (passwordReset === undefined || callArgs === undefined) {
                throw new Error("Expected password reset and notification to be created");
            }
            const resetUrl = callArgs.payload.resetUrl as string;
            const token = new URL(resetUrl).searchParams.get("token");
            expect(token).toBeDefined();
            expect(passwordReset.tokenHash.verify(token!)).toBe(true);
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
            expect(sut.notificationApi.send).not.toHaveBeenCalled();
        });

        it("should propagate password reset creation errors", async () => {
            const sut = makeSut();
            sut.passwordResetRepository.create.mockRejectedValue(new Error("Creation failed"));
            await expect(sut.useCase.execute("john@company.com")).rejects.toThrow("Creation failed");
            expect(sut.passwordResetRepository.create).toHaveBeenCalledTimes(1);
            expect(sut.notificationApi.send).not.toHaveBeenCalled();
        });

        it("should propagate notification sending errors", async () => {
            const sut = makeSut();
            sut.notificationApi.send.mockRejectedValue(new Error("Notification sending failed"));
            await expect(sut.useCase.execute("john@company.com")).rejects.toThrow("Notification sending failed");
            expect(sut.passwordResetRepository.create).toHaveBeenCalledTimes(1);
            expect(sut.notificationApi.send).toHaveBeenCalledTimes(1);
        });

        it("should propagate tenant lookup errors without sending a notification", async () => {
            const sut = makeSut();
            sut.tenantApi.getById.mockRejectedValue(new Error("Tenant lookup failed"));
            await expect(sut.useCase.execute("john@company.com")).rejects.toThrow("Tenant lookup failed");
            expect(sut.passwordResetRepository.create).toHaveBeenCalledTimes(1);
            expect(sut.tenantApi.getById).toHaveBeenCalledWith("tenant-id");
            expect(sut.notificationApi.send).not.toHaveBeenCalled();
        });
    });
});
