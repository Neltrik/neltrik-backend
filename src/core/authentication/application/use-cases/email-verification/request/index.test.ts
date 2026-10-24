import { env } from "@/config/index";
import { LOCALES, NOTIFICATION_CHANNEL, NOTIFICATION_CODES } from "@/core/notifications/api";
import type { IdGenerator } from "@/shared/id-generator";

import { AuthenticationAccount } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError, EmailAlreadyVerifiedError } from "../../../../domain/errors";
import { ExpirationDate, PasswordHash } from "../../../../domain/value-objects";
import {
    AuthenticationAccountRepositorySpy,
    EmailVerificationRepositorySpy,
    NotificationApiSpy,
    TenantApiSpy,
    TransactionManagerSpy,
    UserApiSpy,
} from "../../../../test-doubles";
import { RequestEmailVerificationUseCase } from "./index";
import type { RequestEmailVerificationInput } from "./input";

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
        const idGenerator = { generate: jest.fn().mockReturnValue("email-verification-id") } satisfies IdGenerator;
        const transactionManager = new TransactionManagerSpy();
        const accountRepository = new AuthenticationAccountRepositorySpy();
        accountRepository.findByUserId.mockResolvedValue(account);
        const emailVerificationRepository = new EmailVerificationRepositorySpy();
        const userApi = new UserApiSpy();
        userApi.getUserById.mockResolvedValue({
            id: "user-id",
            firstName: "John",
            tenantId: "tenant-id",
        } as Awaited<ReturnType<UserApiSpy["getUserById"]>>);
        const tenantApi = new TenantApiSpy();
        tenantApi.getById.mockResolvedValue({
            id: "tenant-id",
            name: "Company",
        } as Awaited<ReturnType<TenantApiSpy["getById"]>>);
        const notificationApi = new NotificationApiSpy();
        notificationApi.send.mockResolvedValue("notification-id");
        const useCase = new RequestEmailVerificationUseCase(
            userApi,
            notificationApi,
            tenantApi,
            idGenerator,
            transactionManager,
            accountRepository,
            emailVerificationRepository,
        );
        return {
            useCase,
            account,
            idGenerator,
            transactionManager,
            accountRepository,
            emailVerificationRepository,
            userApi,
            tenantApi,
            notificationApi,
        };
    };

    const input: RequestEmailVerificationInput = { userId: "user-id", tenantId: "tenant-id" };

    describe("execute", () => {
        it("should request email verification successfully", async () => {
            const sut = makeSut();
            await sut.useCase.execute(input);
            expect(sut.accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
            expect(sut.transactionManager.executeCalls).toBe(1);
            expect(sut.emailVerificationRepository.invalidatePendingByAccount).toHaveBeenCalledTimes(1);
            expect(sut.emailVerificationRepository.create).toHaveBeenCalledTimes(1);
            expect(sut.idGenerator.generate).toHaveBeenCalledTimes(1);
            expect(sut.userApi.getUserById).toHaveBeenCalledWith("user-id");
            expect(sut.tenantApi.getById).toHaveBeenCalledWith("tenant-id");
            expect(sut.notificationApi.send).toHaveBeenCalledTimes(1);
        });

        it("should throw AuthenticationAccountNotFoundError when account does not exist", async () => {
            const sut = makeSut();
            sut.accountRepository.findByUserId.mockResolvedValue(null);
            await expect(sut.useCase.execute(input)).rejects.toThrow(AuthenticationAccountNotFoundError);
            expect(sut.transactionManager.executeCalls).toBe(0);
            expect(sut.emailVerificationRepository.create).not.toHaveBeenCalled();
            expect(sut.userApi.getUserById).not.toHaveBeenCalled();
            expect(sut.notificationApi.send).not.toHaveBeenCalled();
        });

        it("should throw EmailAlreadyVerifiedError when email is already verified", async () => {
            const sut = makeSut();
            sut.accountRepository.findByUserId.mockResolvedValue(
                AuthenticationAccount.restore({
                    id: "account-id",
                    userId: "user-id",
                    email: "john@company.com",
                    provider: "email-password",
                    createdAt: new Date(),
                    passwordHash: PasswordHash.create("hashed-password"),
                    emailVerified: true,
                    updatedAt: new Date(),
                }),
            );
            await expect(sut.useCase.execute(input)).rejects.toThrow(EmailAlreadyVerifiedError);
            expect(sut.transactionManager.executeCalls).toBe(0);
            expect(sut.emailVerificationRepository.create).not.toHaveBeenCalled();
            expect(sut.userApi.getUserById).not.toHaveBeenCalled();
            expect(sut.notificationApi.send).not.toHaveBeenCalled();
        });

        it("should invalidate pending verifications before creating a new one", async () => {
            const sut = makeSut();
            await sut.useCase.execute(input);
            const invalidateContext = sut.emailVerificationRepository.invalidatePendingByAccount.mock.calls[0]?.[1];
            const createContext = sut.emailVerificationRepository.create.mock.calls[0]?.[1];
            expect(sut.emailVerificationRepository.invalidatePendingByAccount).toHaveBeenCalledTimes(1);
            expect(sut.emailVerificationRepository.create).toHaveBeenCalledTimes(1);
            expect(invalidateContext).toBe(createContext);
        });

        it("should invalidate pending verifications for the account", async () => {
            const sut = makeSut();
            await sut.useCase.execute(input);
            expect(sut.emailVerificationRepository.invalidatePendingByAccount).toHaveBeenCalledWith(
                "account-id",
                expect.anything(),
            );
        });

        it("should create a verification with the expected values", async () => {
            const sut = makeSut();
            await sut.useCase.execute(input);
            const [verification] = sut.emailVerificationRepository.create.mock.calls[0] ?? [];
            expect(verification).toBeDefined();
            expect(verification?.id).toBe("email-verification-id");
            expect(verification?.authenticationAccountId).toBe("account-id");
            expect(verification?.email).toBe("john@company.com");
            expect(verification?.tokenHash).toBeDefined();
            expect(verification?.expiresAt).toBeInstanceOf(ExpirationDate);
            expect(verification?.verifiedAt).toBeNull();
            expect(verification?.createdAt).toEqual(verification?.updatedAt);
        });

        it("should expire the verification 24 hours in the future", async () => {
            const sut = makeSut();
            const before = Date.now();
            await sut.useCase.execute(input);
            const [verification] = sut.emailVerificationRepository.create.mock.calls[0] ?? [];
            const expiration = verification?.expiresAt.value.getTime() ?? 0;
            expect(expiration).toBeGreaterThanOrEqual(before + 86_400_000);
            expect(expiration).toBeLessThanOrEqual(Date.now() + 86_400_000);
        });

        it("should send the verification notification with the expected payload", async () => {
            const sut = makeSut();
            await sut.useCase.execute(input);
            const [notification] = sut.notificationApi.send.mock.calls[0] ?? [];
            expect(notification).toMatchObject({
                tenantId: "tenant-id",
                recipientId: "user-id",
                recipientEmail: "john@company.com",
                code: NOTIFICATION_CODES.EMAIL_VERIFICATION,
                channels: [NOTIFICATION_CHANNEL.EMAIL],
                locale: LOCALES.ES_CO,
                payload: { name: "John", email: "john@company.com", tenantName: "Company" },
            });
            expect(notification?.payload.verificationUrl).toContain(`${env.FRONTEND_URL}/auth/verify-email?token=`);
        });

        it("should use the generated id", async () => {
            const sut = makeSut();
            await sut.useCase.execute(input);
            expect(sut.idGenerator.generate).toHaveBeenCalledTimes(1);
            expect(sut.emailVerificationRepository.create.mock.calls[0]?.[0].id).toBe("email-verification-id");
        });

        it("should execute persistence inside a transaction", async () => {
            const sut = makeSut();
            await sut.useCase.execute(input);
            expect(sut.transactionManager.executeCalls).toBe(1);
            expect(sut.emailVerificationRepository.invalidatePendingByAccount).toHaveBeenCalledTimes(1);
            expect(sut.emailVerificationRepository.create).toHaveBeenCalledTimes(1);
        });

        it("should not continue when the transaction fails", async () => {
            const sut = makeSut();
            sut.transactionManager.shouldFail = true;
            await expect(sut.useCase.execute(input)).rejects.toThrow("Transaction failed");
            expect(sut.emailVerificationRepository.create).not.toHaveBeenCalled();
            expect(sut.userApi.getUserById).not.toHaveBeenCalled();
            expect(sut.notificationApi.send).not.toHaveBeenCalled();
        });

        it.each([
            [
                "account repository",
                "Database error",
                () => {
                    const sut = makeSut();
                    sut.accountRepository.findByUserId.mockRejectedValue(new Error("Database error"));
                    return sut;
                },
            ],
            [
                "verification invalidation",
                "Invalidation failed",
                () => {
                    const sut = makeSut();
                    sut.emailVerificationRepository.invalidatePendingByAccount.mockRejectedValue(
                        new Error("Invalidation failed"),
                    );
                    return sut;
                },
            ],
            [
                "verification creation",
                "Creation failed",
                () => {
                    const sut = makeSut();
                    sut.emailVerificationRepository.create.mockRejectedValue(new Error("Creation failed"));
                    return sut;
                },
            ],
            [
                "user API",
                "User lookup failed",
                () => {
                    const sut = makeSut();
                    sut.userApi.getUserById.mockRejectedValue(new Error("User lookup failed"));
                    return sut;
                },
            ],
            [
                "tenant API",
                "Tenant lookup failed",
                () => {
                    const sut = makeSut();
                    sut.tenantApi.getById.mockRejectedValue(new Error("Tenant lookup failed"));
                    return sut;
                },
            ],
            [
                "notification API",
                "Notification sending failed",
                () => {
                    const sut = makeSut();
                    sut.notificationApi.send.mockRejectedValue(new Error("Notification sending failed"));
                    return sut;
                },
            ],
        ])("should propagate %s errors", async (_source, error, setup) => {
            const sut = setup();
            await expect(sut.useCase.execute(input)).rejects.toThrow(error);
        });
    });
});
