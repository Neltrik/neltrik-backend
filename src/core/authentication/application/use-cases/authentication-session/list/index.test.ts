import { AuthenticationAccount, AuthenticationSession } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError } from "../../../../domain/errors";
import { ExpirationDate, PasswordHash } from "../../../../domain/value-objects";
import { AuthenticationAccountRepositorySpy, AuthenticationSessionRepositorySpy } from "../../../../test-doubles";
import { ListSessionsUseCase } from "./index";

describe("ListSessionsUseCase", () => {
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
            ownerId: "user-id",
            refreshTokenHash: "refresh-token-hash",
            expiresAt: ExpirationDate.create(new Date(Date.now() + 60 * 60 * 1000)),
            refreshTokenExpiresAt: ExpirationDate.create(new Date(Date.now() + 2 * 60 * 60 * 1000)),
            ipAddress: "127.0.0.1",
            userAgent: "Mozilla/5.0",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        sessionRepository.findByAuthenticationAccountId.mockResolvedValue([session]);
        const useCase = new ListSessionsUseCase(accountRepository, sessionRepository);
        return { useCase, accountRepository, sessionRepository, account, session };
    };

    it("should list the authentication account sessions successfully", async () => {
        const { useCase, accountRepository, sessionRepository, session } = makeSut();
        const result = await useCase.execute("user-id");
        expect(accountRepository.findByUserId).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
        expect(sessionRepository.findByAuthenticationAccountId).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findByAuthenticationAccountId).toHaveBeenCalledWith("account-id");
        expect(result).toEqual({
            sessions: [
                {
                    id: session.id,
                    ipAddress: session.ipAddress,
                    userAgent: session.userAgent,
                    lastUsedAt: session.lastUsedAt,
                    createdAt: session.createdAt,
                    expiresAt: session.expiresAt.value,
                    isRevoked: session.isRevoked(),
                },
            ],
        });
    });

    it("should throw AuthenticationAccountNotFoundError when account does not exist", async () => {
        const { useCase, accountRepository, sessionRepository } = makeSut();
        accountRepository.findByUserId.mockResolvedValue(null);
        await expect(useCase.execute("user-id")).rejects.toThrow(AuthenticationAccountNotFoundError);
        expect(accountRepository.findByUserId).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
        expect(sessionRepository.findByAuthenticationAccountId).not.toHaveBeenCalled();
    });

    it("should return an empty sessions array when the account has no sessions", async () => {
        const { useCase, accountRepository, sessionRepository } = makeSut();
        sessionRepository.findByAuthenticationAccountId.mockResolvedValue([]);
        const result = await useCase.execute("user-id");
        expect(accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
        expect(sessionRepository.findByAuthenticationAccountId).toHaveBeenCalledWith("account-id");
        expect(result).toEqual({ sessions: [] });
    });

    it("should list multiple sessions", async () => {
        const { useCase, sessionRepository } = makeSut();
        const secondSession = AuthenticationSession.create({
            id: "second-session-id",
            authenticationAccountId: "account-id",
            ownerId: "user-id",
            refreshTokenHash: "second-refresh-token-hash",
            expiresAt: ExpirationDate.create(new Date(Date.now() + 2 * 60 * 60 * 1000)),
            refreshTokenExpiresAt: ExpirationDate.create(new Date(Date.now() + 3 * 60 * 60 * 1000)),
            ipAddress: "192.168.1.10",
            userAgent: "Chrome/120.0",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        sessionRepository.findByAuthenticationAccountId.mockResolvedValue([makeSut().session, secondSession]);
        const result = await useCase.execute("user-id");
        expect(result.sessions).toHaveLength(2);
        expect(result.sessions[0]).toEqual(
            expect.objectContaining({
                id: "session-id",
                ipAddress: "127.0.0.1",
                userAgent: "Mozilla/5.0",
                isRevoked: false,
            }),
        );
        expect(result.sessions[1]).toEqual(
            expect.objectContaining({
                id: "second-session-id",
                ipAddress: "192.168.1.10",
                userAgent: "Chrome/120.0",
                isRevoked: false,
            }),
        );
    });

    it("should return revoked status correctly", async () => {
        const { useCase, sessionRepository, session } = makeSut();
        session.revoke();
        sessionRepository.findByAuthenticationAccountId.mockResolvedValue([session]);
        const result = await useCase.execute("user-id");
        expect(result.sessions).toEqual([expect.objectContaining({ id: "session-id", isRevoked: true })]);
    });

    it("should return null ipAddress and userAgent when they are not available", async () => {
        const { useCase, sessionRepository } = makeSut();
        const sessionWithoutClientInfo = AuthenticationSession.create({
            id: "session-id",
            authenticationAccountId: "account-id",
            ownerId: "user-id",
            refreshTokenHash: "refresh-token-hash",
            expiresAt: ExpirationDate.create(new Date(Date.now() + 60 * 60 * 1000)),
            refreshTokenExpiresAt: ExpirationDate.create(new Date(Date.now() + 2 * 60 * 60 * 1000)),
            ipAddress: null,
            userAgent: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        sessionRepository.findByAuthenticationAccountId.mockResolvedValue([sessionWithoutClientInfo]);
        const result = await useCase.execute("user-id");
        expect(result.sessions).toEqual([
            expect.objectContaining({
                id: "session-id",
                ipAddress: null,
                userAgent: null,
                isRevoked: false,
            }),
        ]);
    });

    it("should map all session properties correctly", async () => {
        const { useCase, session } = makeSut();
        const result = await useCase.execute("user-id");
        expect(result.sessions[0]).toEqual({
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
        await expect(useCase.execute("user-id")).rejects.toThrow("Account lookup failed");
        expect(accountRepository.findByUserId).toHaveBeenCalledTimes(1);
        expect(accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
        expect(sessionRepository.findByAuthenticationAccountId).not.toHaveBeenCalled();
    });

    it("should propagate session repository errors", async () => {
        const { useCase, accountRepository, sessionRepository } = makeSut();
        sessionRepository.findByAuthenticationAccountId.mockRejectedValue(new Error("Session lookup failed"));
        await expect(useCase.execute("user-id")).rejects.toThrow("Session lookup failed");
        expect(accountRepository.findByUserId).toHaveBeenCalledWith("user-id");
        expect(sessionRepository.findByAuthenticationAccountId).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findByAuthenticationAccountId).toHaveBeenCalledWith("account-id");
    });
});
