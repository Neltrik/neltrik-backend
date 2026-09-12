import { AuthenticationSession } from "../../../../domain/entities";
import { SessionNotFoundError, SessionRevokedError } from "../../../../domain/errors";
import { ExpirationDate } from "../../../../domain/value-objects";
import { AuthenticationSessionRepositorySpy } from "../../../../test-doubles";
import { RevokeSessionUseCase } from "./index";
import type { RevokeSessionInput } from "./input";

const makeInput = (): RevokeSessionInput => ({
    sessionId: "session-id",
    userId: "user-id",
});

describe("RevokeSessionUseCase", () => {
    const makeSut = () => {
        const session = AuthenticationSession.create({
            id: "session-id",
            authenticationAccountId: "account-id",
            ownerId: "user-id",
            refreshTokenHash: "refresh-token-hash",
            expiresAt: ExpirationDate.create(new Date(Date.now() + 60 * 60 * 1000)),
            refreshTokenExpiresAt: ExpirationDate.create(new Date(Date.now() + 24 * 60 * 60 * 1000)),
            ipAddress: "127.0.0.1",
            userAgent: "Mozilla/5.0",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const sessionRepository = new AuthenticationSessionRepositorySpy();
        sessionRepository.findById.mockResolvedValue(session);
        sessionRepository.update.mockResolvedValue(undefined);
        const useCase = new RevokeSessionUseCase(sessionRepository);
        return { useCase, sessionRepository, session };
    };

    it("should revoke the session successfully", async () => {
        const { useCase, sessionRepository } = makeSut();
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
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
        const { useCase, sessionRepository } = makeSut();
        sessionRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(SessionNotFoundError);
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should throw SessionRevokedError when session is already revoked", async () => {
        const { useCase, sessionRepository, session } = makeSut();
        session.revoke();
        await expect(useCase.execute(makeInput())).rejects.toThrow(SessionRevokedError);
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should not update an already revoked session", async () => {
        const { useCase, sessionRepository, session } = makeSut();
        session.revoke();
        await expect(useCase.execute(makeInput())).rejects.toThrow(SessionRevokedError);
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate session repository errors", async () => {
        const { useCase, sessionRepository } = makeSut();
        sessionRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
        expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate session update errors", async () => {
        const { useCase, sessionRepository } = makeSut();
        sessionRepository.update.mockRejectedValue(new Error("Session update failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Session update failed");
        expect(sessionRepository.update).toHaveBeenCalledTimes(1);
        expect(sessionRepository.update).toHaveBeenCalledWith(expect.anything());
    });
});
