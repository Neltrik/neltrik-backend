import { AuthenticationSession } from "../../../../domain/entities";
import { SessionNotFoundError } from "../../../../domain/errors";
import { ExpirationDate } from "../../../../domain/value-objects";
import { AuthenticationSessionRepositorySpy } from "../../../../test-doubles";
import { GetSessionUseCase } from "./index";

describe("GetSessionUseCase", () => {
    const makeSut = () => {
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
        sessionRepository.findById.mockResolvedValue(session);
        const useCase = new GetSessionUseCase(sessionRepository);
        return { useCase, sessionRepository, session };
    };

    it("should get the session successfully", async () => {
        const { useCase, sessionRepository, session } = makeSut();
        const result = await useCase.execute({ sessionId: "session-id", userId: "user-id" });
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

    it("should throw SessionNotFoundError when session does not exist", async () => {
        const { useCase, sessionRepository } = makeSut();
        sessionRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute({ sessionId: "session-id", userId: "user-id" })).rejects.toThrow(
            SessionNotFoundError,
        );
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
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
        sessionRepository.findById.mockResolvedValue(sessionWithoutClientInfo);
        const result = await useCase.execute({ sessionId: "session-id", userId: "user-id" });
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
        const result = await useCase.execute({ sessionId: "session-id", userId: "user-id" });
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
        const result = await useCase.execute({ sessionId: "session-id", userId: "user-id" });
        expect(result.id).toBe(session.id);
        expect(result.ipAddress).toBe(session.ipAddress);
        expect(result.userAgent).toBe(session.userAgent);
        expect(result.lastUsedAt).toBe(session.lastUsedAt);
        expect(result.createdAt).toBe(session.createdAt);
        expect(result.expiresAt).toBe(session.expiresAt.value);
        expect(result.isRevoked).toBe(session.isRevoked());
    });

    it("should propagate session repository errors", async () => {
        const { useCase, sessionRepository } = makeSut();
        sessionRepository.findById.mockRejectedValue(new Error("Session lookup failed"));
        await expect(useCase.execute({ sessionId: "session-id", userId: "user-id" })).rejects.toThrow(
            "Session lookup failed",
        );
        expect(sessionRepository.findById).toHaveBeenCalledTimes(1);
        expect(sessionRepository.findById).toHaveBeenCalledWith("session-id");
    });
});
