import { AuthenticationAccount, AuthenticationSession } from "../../../../domain/entities";
import {
    AuthenticationAccountNotFoundError,
    InvalidRefreshTokenError,
    SessionExpiredError,
    SessionRevokedError,
} from "../../../../domain/errors";
import { ExpirationDate, PasswordHash } from "../../../../domain/value-objects";
import {
    AuthenticationAccountRepositorySpy,
    AuthenticationSessionRepositorySpy,
    AuthorizationRoleApiSpy,
    CsrfTokenProviderSpy,
    Sha256HasherSpy,
    TokenProviderSpy,
    UserApiSpy,
} from "../../../../test-doubles";
import { RefreshTokenUseCase } from "./index";

describe("RefreshTokenUseCase", () => {
    const makeSut = () => {
        const authorizationRoleApi = new AuthorizationRoleApiSpy();
        authorizationRoleApi.getRoleById.mockResolvedValue({
            id: "role-id",
            code: "USER",
            scope: "PLATFORM",
        });
        const userApi = new UserApiSpy();
        userApi.getUserById.mockResolvedValue({
            id: "user-id",
            roleId: "role-id",
            tenantId: "tenant-id",
            createdAt: new Date(),
            email: "john@company.com",
            firstName: "John",
            lastName: "Doe",
            status: "ACTIVE",
            suspendedAt: null,
            updatedAt: new Date(),
        });
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
        accountRepository.findById.mockResolvedValue(account);
        const sessionRepository = new AuthenticationSessionRepositorySpy();
        const sha256Hasher = new Sha256HasherSpy();
        sha256Hasher.hash.mockReturnValueOnce("refresh-token-hash").mockReturnValueOnce("new-refresh-token-hash");
        const tokenProvider = new TokenProviderSpy();
        tokenProvider.generateAccessToken.mockResolvedValue("access-token");
        tokenProvider.generateRefreshToken.mockReturnValue("new-refresh-token");
        const csrfTokenProvider = new CsrfTokenProviderSpy();
        csrfTokenProvider.generate.mockReturnValue("csrf-token");
        const now = Date.now();
        const sessionExpiresAt = new Date(now + 24 * 60 * 60 * 1000);
        const refreshTokenExpiresAt = new Date(now + 30 * 24 * 60 * 60 * 1000);
        const newRefreshTokenExpiration = new Date(now + 60 * 24 * 60 * 60 * 1000);
        tokenProvider.calculateRefreshTokenExpiration.mockReturnValue(newRefreshTokenExpiration);
        const session = AuthenticationSession.create({
            id: "session-id",
            authenticationAccountId: "account-id",
            ownerId: "user-id",
            refreshTokenHash: "refresh-token-hash",
            expiresAt: ExpirationDate.create(sessionExpiresAt),
            refreshTokenExpiresAt: ExpirationDate.create(refreshTokenExpiresAt),
            ipAddress: "127.0.0.1",
            userAgent: "Mozilla/5.0",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        sessionRepository.findByRefreshTokenHash.mockResolvedValue(session);
        const useCase = new RefreshTokenUseCase(
            authorizationRoleApi,
            userApi,
            csrfTokenProvider,
            accountRepository,
            sessionRepository,
            sha256Hasher,
            tokenProvider,
        );
        return {
            useCase,
            authorizationRoleApi,
            userApi,
            accountRepository,
            sessionRepository,
            sha256Hasher,
            tokenProvider,
            csrfTokenProvider,
            sessionExpiresAt,
            newRefreshTokenExpiration,
        };
    };

    afterEach(() => jest.useRealTimers());

    it("should refresh the token successfully", async () => {
        const sut = makeSut();
        const result = await sut.useCase.execute("refresh-token");
        expect(sut.sha256Hasher.hash).toHaveBeenNthCalledWith(1, "refresh-token");
        expect(sut.sha256Hasher.hash).toHaveBeenNthCalledWith(2, "new-refresh-token");
        expect(sut.sessionRepository.findByRefreshTokenHash).toHaveBeenCalledWith("refresh-token-hash");
        expect(sut.tokenProvider.generateAccessToken).toHaveBeenCalledWith({
            userId: "user-id",
            email: "john@company.com",
            tenantId: "tenant-id",
            roleCode: "USER",
            sessionId: "session-id",
        });
        expect(sut.csrfTokenProvider.generate).toHaveBeenCalledWith("session-id");
        expect(sut.sessionRepository.update).toHaveBeenCalled();
        expect(result).toEqual({
            accessToken: "access-token",
            refreshToken: "new-refresh-token",
            csrfToken: "csrf-token",
        });
    });

    it("should throw InvalidRefreshTokenError when refresh token is not provided", async () => {
        const sut = makeSut();
        await expect(sut.useCase.execute(undefined)).rejects.toThrow(InvalidRefreshTokenError);
        expect(sut.sha256Hasher.hash).not.toHaveBeenCalled();
        expect(sut.sessionRepository.findByRefreshTokenHash).not.toHaveBeenCalled();
    });

    it("should throw InvalidRefreshTokenError when session does not exist", async () => {
        const sut = makeSut();
        sut.sessionRepository.findByRefreshTokenHash.mockResolvedValue(null);
        await expect(sut.useCase.execute("refresh-token")).rejects.toThrow(InvalidRefreshTokenError);
        expect(sut.accountRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw SessionExpiredError when session is expired", async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-08-28T12:00:00.000Z"));
        const sut = makeSut();
        jest.setSystemTime(new Date("2026-08-29T12:00:00.000Z"));
        await expect(sut.useCase.execute("refresh-token")).rejects.toThrow(SessionExpiredError);
        expect(sut.accountRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw SessionRevokedError when session is revoked", async () => {
        const sut = makeSut();
        const session = AuthenticationSession.create({
            id: "session-id",
            authenticationAccountId: "account-id",
            ownerId: "user-id",
            refreshTokenHash: "refresh-token-hash",
            expiresAt: ExpirationDate.create(new Date("2099-01-01")),
            refreshTokenExpiresAt: ExpirationDate.create(new Date("2099-01-01")),
            ipAddress: null,
            userAgent: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        session.revoke();
        sut.sessionRepository.findByRefreshTokenHash.mockResolvedValue(session);
        await expect(sut.useCase.execute("refresh-token")).rejects.toThrow(SessionRevokedError);
        expect(sut.accountRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw InvalidRefreshTokenError when refresh token is expired", async () => {
        jest.useFakeTimers();
        const now = new Date("2026-08-28T12:00:00.000Z");
        jest.setSystemTime(now);
        const sut = makeSut();
        const session = AuthenticationSession.create({
            id: "session-id",
            authenticationAccountId: "account-id",
            ownerId: "user-id",
            refreshTokenHash: "refresh-token-hash",
            expiresAt: ExpirationDate.create(new Date(now.getTime() + 2 * 60 * 60 * 1000)),
            refreshTokenExpiresAt: ExpirationDate.create(new Date(now.getTime() + 30 * 60 * 1000)),
            ipAddress: null,
            userAgent: null,
            createdAt: now,
            updatedAt: now,
        });
        sut.sessionRepository.findByRefreshTokenHash.mockResolvedValue(session);
        jest.setSystemTime(new Date(now.getTime() + 60 * 60 * 1000));
        await expect(sut.useCase.execute("refresh-token")).rejects.toThrow(InvalidRefreshTokenError);
        expect(sut.accountRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw AuthenticationAccountNotFoundError when account does not exist", async () => {
        const sut = makeSut();
        sut.accountRepository.findById.mockResolvedValue(null);
        await expect(sut.useCase.execute("refresh-token")).rejects.toThrow(AuthenticationAccountNotFoundError);
        expect(sut.accountRepository.findById).toHaveBeenCalledWith("account-id");
        expect(sut.userApi.getUserById).not.toHaveBeenCalled();
        expect(sut.tokenProvider.generateAccessToken).not.toHaveBeenCalled();
    });

    it.each([
        [
            "session lookup",
            "Database error",
            (sut: ReturnType<typeof makeSut>) => {
                sut.sessionRepository.findByRefreshTokenHash.mockRejectedValue(new Error("Database error"));
            },
        ],
        [
            "account lookup",
            "Account lookup failed",
            (sut: ReturnType<typeof makeSut>) => {
                sut.accountRepository.findById.mockRejectedValue(new Error("Account lookup failed"));
            },
        ],
        [
            "user lookup",
            "User lookup failed",
            (sut: ReturnType<typeof makeSut>) => {
                sut.userApi.getUserById.mockRejectedValue(new Error("User lookup failed"));
            },
        ],
        [
            "role lookup",
            "Role lookup failed",
            (sut: ReturnType<typeof makeSut>) => {
                sut.authorizationRoleApi.getRoleById.mockRejectedValue(new Error("Role lookup failed"));
            },
        ],
        [
            "access token generation",
            "Access token generation failed",
            (sut: ReturnType<typeof makeSut>) => {
                sut.tokenProvider.generateAccessToken.mockRejectedValue(new Error("Access token generation failed"));
            },
        ],
    ])("should propagate %s errors", async (_, error, configure) => {
        const sut = makeSut();
        configure(sut);
        await expect(sut.useCase.execute("refresh-token")).rejects.toThrow(error);
    });

    it("should propagate refresh token hashing errors", async () => {
        const sut = makeSut();
        sut.sha256Hasher.hash.mockReset();
        sut.sha256Hasher.hash.mockImplementation(() => {
            throw new Error("Hashing failed");
        });
        await expect(sut.useCase.execute("refresh-token")).rejects.toThrow("Hashing failed");
        expect(sut.sha256Hasher.hash).toHaveBeenCalledWith("refresh-token");
        expect(sut.sessionRepository.findByRefreshTokenHash).not.toHaveBeenCalled();
    });

    it("should propagate new refresh token hashing errors", async () => {
        const sut = makeSut();
        sut.sha256Hasher.hash
            .mockReset()
            .mockReturnValueOnce("refresh-token-hash")
            .mockImplementationOnce(() => {
                throw new Error("New refresh token hashing failed");
            });
        await expect(sut.useCase.execute("refresh-token")).rejects.toThrow("New refresh token hashing failed");
        expect(sut.sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate csrf token generation errors", async () => {
        const sut = makeSut();
        sut.csrfTokenProvider.generate.mockImplementation(() => {
            throw new Error("CSRF token generation failed");
        });
        await expect(sut.useCase.execute("refresh-token")).rejects.toThrow("CSRF token generation failed");
        expect(sut.sessionRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate session update errors", async () => {
        const sut = makeSut();
        sut.sessionRepository.update.mockRejectedValue(new Error("Session update failed"));
        await expect(sut.useCase.execute("refresh-token")).rejects.toThrow("Session update failed");
    });

    it("should rotate the refresh token and update expiration", async () => {
        const sut = makeSut();
        await sut.useCase.execute("refresh-token");
        const updatedSession = sut.sessionRepository.update.mock.calls[0]?.[0];
        expect(updatedSession).toBeDefined();
        expect(updatedSession?.refreshTokenHash).toBe("new-refresh-token-hash");
        expect(updatedSession?.expiresAt.value).toEqual(sut.sessionExpiresAt);
        expect(updatedSession?.refreshTokenExpiresAt.value).toEqual(sut.newRefreshTokenExpiration);
    });
});
