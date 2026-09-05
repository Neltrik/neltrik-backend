import { AuthenticationSession } from "../../../domain/entities";
import { ExpirationDate } from "../../../domain/value-objects";
import { AuthenticationSessionRepositorySpy } from "../../../test-doubles";
import { SessionValidatorProvider } from "./";

describe("SessionValidatorProvider", () => {
    const makeSession = () => {
        const now = new Date();
        const expiration = new Date(now.getTime() + 60 * 60 * 1000);
        const refreshTokenExpiration = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        return AuthenticationSession.create({
            id: "session-id",
            authenticationAccountId: "account-id",
            refreshTokenHash: "refresh-token-hash",
            expiresAt: ExpirationDate.create(expiration),
            refreshTokenExpiresAt: ExpirationDate.create(refreshTokenExpiration),
            ipAddress: "127.0.0.1",
            userAgent: "test-user-agent",
            createdAt: now,
            updatedAt: now,
        });
    };

    const makeSut = () => {
        const sessionRepository = new AuthenticationSessionRepositorySpy();
        const provider = new SessionValidatorProvider(sessionRepository);
        return { provider, sessionRepository };
    };

    describe("validate", () => {
        it("should return true when the session exists and is not revoked", async () => {
            const sut = makeSut();
            const session = makeSession();
            sut.sessionRepository.findById.mockResolvedValue(session);
            const result = await sut.provider.validate("session-id");
            expect(sut.sessionRepository.findById).toHaveBeenCalledWith("session-id");
            expect(result).toBe(true);
        });

        it("should return false when the session does not exist", async () => {
            const sut = makeSut();
            sut.sessionRepository.findById.mockResolvedValue(null);
            const result = await sut.provider.validate("session-id");
            expect(sut.sessionRepository.findById).toHaveBeenCalledWith("session-id");
            expect(result).toBe(false);
        });

        it("should return false when the session is revoked", async () => {
            const sut = makeSut();
            const session = makeSession();
            session.revoke();
            sut.sessionRepository.findById.mockResolvedValue(session);
            const result = await sut.provider.validate("session-id");
            expect(sut.sessionRepository.findById).toHaveBeenCalledWith("session-id");
            expect(result).toBe(false);
        });

        it("should propagate errors from the session repository", async () => {
            const sut = makeSut();
            sut.sessionRepository.findById.mockRejectedValue(new Error("Database error"));
            await expect(sut.provider.validate("session-id")).rejects.toThrow("Database error");
        });
    });
});
