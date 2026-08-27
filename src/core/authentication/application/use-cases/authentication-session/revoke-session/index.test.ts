import { AuthenticationAccount, AuthenticationSession } from "../../../../domain/entities";
import {
    AuthenticationAccountNotFoundError,
    SessionNotFoundError,
    SessionRevokedError,
    UnauthorizedSessionError,
} from "../../../../domain/errors";
import { ExpirationDate, PasswordHash } from "../../../../domain/value-objects";
import { AuthenticationAccountRepositorySpy, AuthenticationSessionRepositorySpy } from "../../../../test-doubles";
import { RevokeSessionUseCase } from "./index";
import type { RevokeSessionInput } from "./input";

const makeInput = (): RevokeSessionInput => ({
    sessionId: "session-id",
    userId: "user-id",
});

describe("RevokeSessionUseCase", () => {
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
        const session = AuthenticationSession.create({
            id: "session-id",
            authenticationAccountId: "account-id",
            refreshTokenHash: "refresh-token-hash",
            expiresAt: ExpirationDate.create(new Date("2026-09-01T00:00:00.000Z")),
            refreshTokenExpiresAt: ExpirationDate.create(new Date("2026-10-01T00:00:00.000Z")),
            ipAddress: "127.0.0.1",
            userAgent: "Mozilla/5.0",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const sessionRepository = new AuthenticationSessionRepositorySpy();
        sessionRepository.findById.mockResolvedValue(session);
        sessionRepository.update.mockResolvedValue(undefined);
        const accountRepository = new AuthenticationAccountRepositorySpy();
        accountRepository.findById.mockResolvedValue(account);
        const useCase = new RevokeSessionUseCase(sessionRepository, accountRepository);
        return { useCase, sessionRepository, accountRepository, session, account };
    };

    it("should revoke the session successfully", async () => {
        const { useCase, sessionRepository, accountRepository } = makeSut();
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
        expect(accountRepository.findById).toHaveBeenCalledTimes(1);
        expect(accountRepository.findById).toHaveBeenCalledWith("account-id");
        expect(sessionRepository.update).toHaveBeenCalledTimes(1);
        expect(sessionRepository.update).toHaveBeenCalledWith(expect.anything());
    });

    it("should revoke the session", async () => {
        const { useCase, sessionRepository } = makeSut();
        await useCase.execute(makeInput());
        const updatedSession = sessionRepository.update.mock.calls[0]?.[0];
        expect(updatedSession).toBeDefined();
        expect(updatedSession?.isRevoked()).toBe(true);
    });

    it("should throw SessionNotFoundError when session does not exist", async () => {
        const { useCase, sessionRepository, accountRepository } = makeSut();
        sessionRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(SessionNotFoundError);
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
        expect(accountRepository.findById).not.toHaveBeenCalled();
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should throw AuthenticationAccountNotFoundError when account does not exist", async () => {
        const { useCase, sessionRepository, accountRepository } = makeSut();
        accountRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(AuthenticationAccountNotFoundError);
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
        expect(accountRepository.findById).toHaveBeenCalledTimes(1);
        expect(accountRepository.findById).toHaveBeenCalledWith("account-id");
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedSessionError when session belongs to another user", async () => {
        const { useCase, accountRepository, sessionRepository } = makeSut();
        const input: RevokeSessionInput = { sessionId: "session-id", userId: "another-user-id" };
        await expect(useCase.execute(input)).rejects.toThrow(UnauthorizedSessionError);
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
        expect(accountRepository.findById).toHaveBeenCalledTimes(1);
        expect(accountRepository.findById).toHaveBeenCalledWith("account-id");
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should throw SessionRevokedError when session is already revoked", async () => {
        const { useCase, sessionRepository, accountRepository, session } = makeSut();
        session.revoke();
        await expect(useCase.execute(makeInput())).rejects.toThrow(SessionRevokedError);
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
        expect(accountRepository.findById).toHaveBeenCalledTimes(1);
        expect(accountRepository.findById).toHaveBeenCalledWith("account-id");
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate session repository errors", async () => {
        const { useCase, sessionRepository, accountRepository } = makeSut();
        sessionRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
        expect(accountRepository.findById).not.toHaveBeenCalled();
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate account repository errors", async () => {
        const { useCase, sessionRepository, accountRepository } = makeSut();
        accountRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
        expect(accountRepository.findById).toHaveBeenCalledTimes(1);
        expect(accountRepository.findById).toHaveBeenCalledWith("account-id");
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate session update errors", async () => {
        const { useCase, sessionRepository } = makeSut();
        sessionRepository.update.mockRejectedValue(new Error("Session update failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Session update failed");
        expect(sessionRepository.update).toHaveBeenCalledTimes(1);
        expect(sessionRepository.update).toHaveBeenCalledWith(expect.anything());
    });

    it("should not update the session when the user is unauthorized", async () => {
        const { useCase, sessionRepository } = makeSut();
        await expect(useCase.execute({ sessionId: "session-id", userId: "another-user-id" })).rejects.toThrow(
            UnauthorizedSessionError,
        );
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should not update an already revoked session", async () => {
        const { useCase, sessionRepository, session } = makeSut();
        session.revoke();
        await expect(useCase.execute(makeInput())).rejects.toThrow(SessionRevokedError);
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });
});
