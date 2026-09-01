import { AuthenticationSession } from "../../../../domain/entities";
import { InvalidRefreshTokenError } from "../../../../domain/errors";
import { ExpirationDate } from "../../../../domain/value-objects";
import { AuthenticationSessionRepositorySpy, Sha256HasherSpy } from "../../../../test-doubles";
import { LogoutUseCase } from "./index";

describe("LogoutUseCase", () => {
    const makeSut = () => {
        const sessionRepository = new AuthenticationSessionRepositorySpy();
        const sha256Hasher = new Sha256HasherSpy();
        sha256Hasher.hash.mockReturnValue("refresh-token-hash");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        const refreshTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const session = AuthenticationSession.create({
            id: "session-id",
            authenticationAccountId: "account-id",
            refreshTokenHash: "refresh-token-hash",
            expiresAt: ExpirationDate.create(expiresAt),
            refreshTokenExpiresAt: ExpirationDate.create(refreshTokenExpiresAt),
            ipAddress: "127.0.0.1",
            userAgent: "Mozilla/5.0",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        sessionRepository.findByRefreshTokenHash.mockResolvedValue(session);
        sessionRepository.update.mockResolvedValue(undefined);
        const useCase = new LogoutUseCase(sessionRepository, sha256Hasher);
        return { useCase, sessionRepository, sha256Hasher, session };
    };

    it("should throw InvalidRefreshTokenError when refresh token is not provided", async () => {
        const { useCase, sha256Hasher, sessionRepository } = makeSut();
        await expect(useCase.execute(undefined)).rejects.toThrow(InvalidRefreshTokenError);
        expect(sha256Hasher.hash).not.toHaveBeenCalled();
        expect(sessionRepository.findByRefreshTokenHash).not.toHaveBeenCalled();
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should logout successfully", async () => {
        const { useCase, sha256Hasher, sessionRepository } = makeSut();
        await expect(useCase.execute("refresh-token")).resolves.toBeUndefined();
        expect(sha256Hasher.hash).toHaveBeenCalledTimes(1);
        expect(sha256Hasher.hash).toHaveBeenCalledWith("refresh-token");
        expect(sessionRepository.findByRefreshTokenHash).toHaveBeenCalledWith("refresh-token-hash");
        expect(sessionRepository.update).toHaveBeenCalledTimes(1);
        expect(sessionRepository.update).toHaveBeenCalledWith(expect.anything());
    });

    it("should revoke the session", async () => {
        const { useCase, sessionRepository } = makeSut();
        await useCase.execute("refresh-token");
        const [updatedSession] = sessionRepository.update.mock.calls[0]!;
        expect(updatedSession.isRevoked()).toBe(true);
    });

    it("should throw InvalidRefreshTokenError when session does not exist", async () => {
        const { useCase, sha256Hasher, sessionRepository } = makeSut();
        sessionRepository.findByRefreshTokenHash.mockResolvedValue(null);
        await expect(useCase.execute("invalid-refresh-token")).rejects.toThrow(InvalidRefreshTokenError);
        expect(sha256Hasher.hash).toHaveBeenCalledWith("invalid-refresh-token");
        expect(sessionRepository.findByRefreshTokenHash).toHaveBeenCalledWith("refresh-token-hash");
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate hash errors", async () => {
        const { useCase, sha256Hasher, sessionRepository } = makeSut();
        sha256Hasher.hash.mockImplementation(() => {
            throw new Error("Hashing failed");
        });
        await expect(useCase.execute("refresh-token")).rejects.toThrow("Hashing failed");
        expect(sessionRepository.findByRefreshTokenHash).not.toHaveBeenCalled();
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate session lookup errors", async () => {
        const { useCase, sessionRepository } = makeSut();
        sessionRepository.findByRefreshTokenHash.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("refresh-token")).rejects.toThrow("Database error");
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate session update errors", async () => {
        const { useCase, sessionRepository } = makeSut();
        sessionRepository.update.mockRejectedValue(new Error("Session update failed"));
        await expect(useCase.execute("refresh-token")).rejects.toThrow("Session update failed");
    });
});
