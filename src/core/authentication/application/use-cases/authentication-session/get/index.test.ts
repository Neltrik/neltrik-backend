import { AuthenticationAccount, AuthenticationSession } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError, SessionNotFoundError } from "../../../../domain/errors";
import { ExpirationDate, PasswordHash } from "../../../../domain/value-objects";
import { AuthenticationAccountRepositorySpy, AuthenticationSessionRepositorySpy } from "../../../../test-doubles";
import { GetSessionUseCase } from "./index";

describe("GetSessionUseCase", () => {
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
        const session = AuthenticationSession.create({
            id: "session-id",
            authenticationAccountId: "account-id",
            refreshTokenHash: "refresh-token-hash",
            expiresAt: ExpirationDate.create(new Date(Date.now() + 60 * 60 * 1000)),
            refreshTokenExpiresAt: ExpirationDate.create(new Date(Date.now() + 2 * 60 * 60 * 1000)),
            ipAddress: "127.0.0.1",
            userAgent: "Mozilla/5.0",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        sessionRepository.findById.mockResolvedValue(session);
        const useCase = new GetSessionUseCase(accountRepository, sessionRepository);
        return { useCase, accountRepository, sessionRepository, account, session };
    };

    it("should get the session successfully", async () => {
        const { useCase, accountRepository, sessionRepository, session } = makeSut();
        const result = await useCase.execute({ userId: "user-id", sessionId: "session-id" });
        expect(accountRepository.findByUserId).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
        expect(result).toEqual({
            id: session.id,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            lastUsedAt: session.lastUsedAt,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt.value,
            isRevoked: session.isRevoked(),
        });
    });

    it("should throw AuthenticationAccountNotFoundError when account does not exist", async () => {
        const { useCase, accountRepository, sessionRepository } = makeSut();
        accountRepository.findByUserId.mockResolvedValue(null);
        await expect(useCase.execute({ userId: "user-id", sessionId: "session-id" })).rejects.toThrow(
            AuthenticationAccountNotFoundError,
        );
        expect(accountRepository.findByUserId).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
        expect(sessionRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw SessionNotFoundError when session does not exist", async () => {
        const { useCase, accountRepository, sessionRepository } = makeSut();
        sessionRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute({ userId: "user-id", sessionId: "session-id" })).rejects.toThrow(
            SessionNotFoundError,
        );
        expect(accountRepository.findByUserId).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
    });

    it("should throw SessionNotFoundError when session belongs to another account", async () => {
        const { useCase, accountRepository, sessionRepository } = makeSut();
        const sessionFromAnotherAccount = AuthenticationSession.create({
            id: "session-id",
            authenticationAccountId: "another-account-id",
            refreshTokenHash: "refresh-token-hash",
            expiresAt: ExpirationDate.create(new Date(Date.now() + 60 * 60 * 1000)),
            refreshTokenExpiresAt: ExpirationDate.create(new Date(Date.now() + 2 * 60 * 60 * 1000)),
            ipAddress: "127.0.0.1",
            userAgent: "Mozilla/5.0",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        sessionRepository.findById.mockResolvedValue(sessionFromAnotherAccount);
        await expect(useCase.execute({ userId: "user-id", sessionId: "session-id" })).rejects.toThrow(
            SessionNotFoundError,
        );
        expect(accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
    });

    it("should return null ipAddress and userAgent when they are not available", async () => {
        const { useCase, sessionRepository } = makeSut();
        const sessionWithoutClientInfo = AuthenticationSession.create({
            id: "session-id",
            authenticationAccountId: "account-id",
            refreshTokenHash: "refresh-token-hash",
            expiresAt: ExpirationDate.create(new Date(Date.now() + 60 * 60 * 1000)),
            refreshTokenExpiresAt: ExpirationDate.create(new Date(Date.now() + 2 * 60 * 60 * 1000)),
            ipAddress: null,
            userAgent: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        sessionRepository.findById.mockResolvedValue(sessionWithoutClientInfo);
        const result = await useCase.execute({ userId: "user-id", sessionId: "session-id" });
        expect(result).toEqual({
            id: sessionWithoutClientInfo.id,
            ipAddress: null,
            userAgent: null,
            lastUsedAt: sessionWithoutClientInfo.lastUsedAt,
            createdAt: sessionWithoutClientInfo.createdAt,
            expiresAt: sessionWithoutClientInfo.expiresAt.value,
            isRevoked: sessionWithoutClientInfo.isRevoked(),
        });
    });

    it("should return revoked status correctly", async () => {
        const { useCase, sessionRepository, session } = makeSut();
        session.revoke();
        sessionRepository.findById.mockResolvedValue(session);
        const result = await useCase.execute({ userId: "user-id", sessionId: "session-id" });
        expect(result).toEqual({
            id: session.id,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            lastUsedAt: session.lastUsedAt,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt.value,
            isRevoked: true,
        });
    });

    it("should map all session properties correctly", async () => {
        const { useCase, session } = makeSut();
        const result = await useCase.execute({ userId: "user-id", sessionId: "session-id" });
        expect(result).toEqual({
            id: session.id,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            lastUsedAt: session.lastUsedAt,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt.value,
            isRevoked: session.isRevoked(),
        });
    });

    it("should propagate account repository errors", async () => {
        const { useCase, accountRepository, sessionRepository } = makeSut();
        accountRepository.findByUserId.mockRejectedValue(new Error("Account lookup failed"));
        await expect(useCase.execute({ userId: "user-id", sessionId: "session-id" })).rejects.toThrow(
            "Account lookup failed",
        );
        expect(accountRepository.findByUserId).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
        expect(sessionRepository.findById).not.toHaveBeenCalled();
    });

    it("should propagate session repository errors", async () => {
        const { useCase, accountRepository, sessionRepository } = makeSut();
        sessionRepository.findById.mockRejectedValue(new Error("Session lookup failed"));
        await expect(useCase.execute({ userId: "user-id", sessionId: "session-id" })).rejects.toThrow(
            "Session lookup failed",
        );
        expect(accountRepository.findByUserId).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
    });
});
