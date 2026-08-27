import { AuthenticationSession } from "../../../../domain/entities";
import { InvalidRefreshTokenError } from "../../../../domain/errors";
import { ExpirationDate } from "../../../../domain/value-objects";
import { AuthenticationSessionRepositorySpy, TokenProviderSpy } from "../../../../test-doubles";
import { LogoutUseCase } from "./index";

describe("LogoutUseCase", () => {
    const makeSut = () => {
        const sessionRepository = new AuthenticationSessionRepositorySpy();
        const tokenProvider = new TokenProviderSpy();
        tokenProvider.hashRefreshToken.mockResolvedValue("refresh-token-hash");
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
        sessionRepository.findByRefreshTokenHash.mockResolvedValue(session);
        sessionRepository.update.mockResolvedValue(undefined);
        const useCase = new LogoutUseCase(sessionRepository, tokenProvider);
        return { useCase, sessionRepository, tokenProvider, session };
    };

    it("should logout successfully", async () => {
        const { useCase, tokenProvider, sessionRepository } = makeSut();
        await expect(useCase.execute("refresh-token")).resolves.toBeUndefined();
        expect(tokenProvider.hashRefreshToken).toHaveBeenCalledTimes(1);
        expect(tokenProvider.hashRefreshToken).toHaveBeenCalledWith("refresh-token");
        expect(sessionRepository.findByRefreshTokenHash).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findByRefreshTokenHash).toHaveBeenCalledWith("refresh-token-hash");
        expect(sessionRepository.update).toHaveBeenCalledTimes(1);
        expect(sessionRepository.update).toHaveBeenCalledWith(expect.anything());
    });

    it("should revoke the session", async () => {
        const { useCase, sessionRepository } = makeSut();
        await useCase.execute("refresh-token");
        const updatedSession = sessionRepository.update.mock.calls[0]?.[0];
        expect(updatedSession).toBeDefined();
        expect(updatedSession?.isRevoked()).toBe(true);
    });

    it("should throw InvalidRefreshTokenError when session does not exist", async () => {
        const { useCase, tokenProvider, sessionRepository } = makeSut();
        sessionRepository.findByRefreshTokenHash.mockResolvedValue(null);
        await expect(useCase.execute("invalid-refresh-token")).rejects.toThrow(InvalidRefreshTokenError);
        expect(tokenProvider.hashRefreshToken).toHaveBeenCalledTimes(1);
        expect(tokenProvider.hashRefreshToken).toHaveBeenCalledWith("invalid-refresh-token");
        expect(sessionRepository.findByRefreshTokenHash).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findByRefreshTokenHash).toHaveBeenCalledWith("refresh-token-hash");
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate refresh token hashing errors", async () => {
        const { useCase, tokenProvider, sessionRepository } = makeSut();
        tokenProvider.hashRefreshToken.mockRejectedValue(new Error("Refresh token hashing failed"));
        await expect(useCase.execute("refresh-token")).rejects.toThrow("Refresh token hashing failed");
        expect(tokenProvider.hashRefreshToken).toHaveBeenCalledTimes(1);
        expect(tokenProvider.hashRefreshToken).toHaveBeenCalledWith("refresh-token");
        expect(sessionRepository.findByRefreshTokenHash).not.toHaveBeenCalled();
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate session repository errors", async () => {
        const { useCase, sessionRepository } = makeSut();
        sessionRepository.findByRefreshTokenHash.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("refresh-token")).rejects.toThrow("Database error");
        expect(sessionRepository.findByRefreshTokenHash).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findByRefreshTokenHash).toHaveBeenCalledWith("refresh-token-hash");
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate session update errors", async () => {
        const { useCase, sessionRepository } = makeSut();
        sessionRepository.update.mockRejectedValue(new Error("Session update failed"));
        await expect(useCase.execute("refresh-token")).rejects.toThrow("Session update failed");
        expect(sessionRepository.update).toHaveBeenCalledTimes(1);
        expect(sessionRepository.update).toHaveBeenCalledWith(expect.anything());
    });

    it("should not update the session when the refresh token is invalid", async () => {
        const { useCase, sessionRepository } = makeSut();
        sessionRepository.findByRefreshTokenHash.mockResolvedValue(null);
        await expect(useCase.execute("refresh-token")).rejects.toThrow(InvalidRefreshTokenError);
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });
});
