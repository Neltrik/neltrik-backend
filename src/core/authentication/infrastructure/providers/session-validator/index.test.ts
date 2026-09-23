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
            ownerId: "user-id",
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

    describe("resolve", () => {
        it("should return valid resolution when the session exists and is not revoked", async () => {
            const { provider, sessionRepository } = makeSut();
            const session = makeSession();
            sessionRepository.findByIdWithOwnerState.mockResolvedValue({
                session,
                userStatus: "ACTIVE",
                emailVerified: true,
            });
            const result = await provider.resolve("session-id");
            expect(sessionRepository.findByIdWithOwnerState).toHaveBeenCalledWith("session-id");
            expect(result).toEqual({
                isValid: true,
                userState: { status: "ACTIVE" },
                accountState: { emailVerified: true },
            });
        });

        it("should return invalid resolution when the session does not exist", async () => {
            const { provider, sessionRepository } = makeSut();
            sessionRepository.findByIdWithOwnerState.mockResolvedValue(null);
            const result = await provider.resolve("session-id");
            expect(sessionRepository.findByIdWithOwnerState).toHaveBeenCalledWith("session-id");
            expect(result).toEqual({
                isValid: false,
                userState: { status: "SUSPENDED" },
                accountState: { emailVerified: false },
            });
        });

        it("should return invalid resolution when the session is revoked", async () => {
            const { provider, sessionRepository } = makeSut();
            const session = makeSession();
            session.revoke();
            sessionRepository.findByIdWithOwnerState.mockResolvedValue({
                session,
                userStatus: "ACTIVE",
                emailVerified: true,
            });
            const result = await provider.resolve("session-id");
            expect(sessionRepository.findByIdWithOwnerState).toHaveBeenCalledWith("session-id");
            expect(result).toEqual({
                isValid: false,
                userState: { status: "SUSPENDED" },
                accountState: { emailVerified: false },
            });
        });

        it("should propagate errors from the session repository", async () => {
            const { provider, sessionRepository } = makeSut();
            sessionRepository.findByIdWithOwnerState.mockRejectedValue(new Error("Database error"));
            await expect(provider.resolve("session-id")).rejects.toThrow("Database error");
        });
    });
});
